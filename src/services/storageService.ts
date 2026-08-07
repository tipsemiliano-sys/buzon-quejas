import { Report, NewReportInput, ReportStatus } from '../types';
import { getSupabase, isSupabaseConfigured } from '../config/supabase';
import { getNeonSql, isNeonConfigured } from '../config/neon';

const LOCAL_STORAGE_KEY = 'buzon_quejas_reportes_v1';

// Generador de Folios Únicos (ejemplo: QS-2026-X8F92)
export function generateFolio(): string {
  const year = new Date().getFullYear();
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let randomPart = '';
  for (let i = 0; i < 5; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `QS-${year}-${randomPart}`;
}

// Datos iniciales de demostración para LocalStorage
const INITIAL_DEMO_REPORTS: Report[] = [
  {
    id: 1,
    folio: 'QS-2026-A8K91',
    tipo: 'queja',
    categoria: 'Infraestructura / Herramientas de trabajo',
    urgencia: 'alta',
    asunto: 'Queja: Infraestructura / Herramientas de trabajo',
    descripcion: 'Categoría de Incidencia: Infraestructura / Herramientas de trabajo\nÁrea / Departamento: Operaciones\nNivel de Urgencia / Impacto: Alto\n\nDescripción Detallada de los Hechos:\nEl sistema de aire acondicionado del área de producción lleva 3 días goteando sobre los equipos y la temperatura supera los 28°C.',
    adjunto: '',
    estado: 'En Proceso',
    respuesta_admin: 'El equipo de mantenimiento ya tiene el reporte y acudirá mañana a primera hora a reemplazar los filtros y sellar el ducto.',
    fecha_creacion: new Date(Date.now() - 86400000 * 3).toISOString(),
    fecha_actualizacion: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 2,
    folio: 'QS-2026-M4P73',
    tipo: 'sugerencia',
    categoria: 'Ambiente y clima laboral',
    urgencia: 'media',
    asunto: 'Sugerencia: Ambiente y clima laboral',
    descripcion: 'Aspecto a Mejorar: Ambiente y clima laboral\n\nDescripción de la Idea / Propuesta:\nSugerimos habilitar una canasta de fruta fresca en el comedor dos veces por semana para incentivar hábitos más saludables.\n\nBeneficios esperados para el equipo/empresa:\nMejora la energía y salud del equipo durante la jornada laboral.',
    adjunto: '',
    estado: 'Pendiente',
    respuesta_admin: '',
    fecha_creacion: new Date(Date.now() - 86400000 * 2).toISOString(),
    fecha_actualizacion: new Date(Date.now() - 86400000 * 2).toISOString(),
  }
];

function getLocalReports(): Report[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_DEMO_REPORTS));
      return INITIAL_DEMO_REPORTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_DEMO_REPORTS;
  }
}

function saveLocalReports(reports: Report[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(reports));
  } catch (error) {
    console.error('Error al guardar en LocalStorage:', error);
  }
}

/**
 * Subida anónima de archivos a Supabase Storage (Bucket: 'evidencias-quejas')
 */
export async function uploadAnonymousFile(file: File): Promise<string> {
  const supabase = getSupabase();

  if (supabase && isSupabaseConfigured) {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      const filePath = `adjuntos/${fileName}`;

      const { error } = await supabase.storage
        .from('evidencias-quejas')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Error al subir archivo a Supabase Storage:', error);
        throw error;
      }

      const { data: publicUrlData } = supabase.storage
        .from('evidencias-quejas')
        .getPublicUrl(filePath);

      return publicUrlData.publicUrl;
    } catch (err) {
      console.warn('Falló la subida a Supabase Storage, utilizando Data URL local:', err);
    }
  }

  // Fallback Data URL cuando Supabase no esté vinculado
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });
}

/**
 * Obtener todos los reportes (de Supabase, Neon o LocalStorage)
 */
export async function getAllReports(): Promise<Report[]> {
  const supabase = getSupabase();
  if (supabase && isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('reportes')
        .select('*')
        .order('fecha_creacion', { ascending: false });

      if (!error && data) {
        return data as Report[];
      }
    } catch (error) {
      console.warn('Error en Supabase, intentando fallback:', error);
    }
  }

  const sql = getNeonSql();
  if (sql && isNeonConfigured) {
    try {
      const rows = await sql`SELECT * FROM reportes ORDER BY fecha_creacion DESC`;
      return rows as Report[];
    } catch (error) {
      console.warn('Fallback a LocalStorage debido a error en Neon SQL:', error);
    }
  }

  return getLocalReports();
}

/**
 * Obtener un reporte específico por su Folio
 */
export async function getReportByFolio(folio: string): Promise<Report | null> {
  const cleanedFolio = folio.trim().toUpperCase();

  const supabase = getSupabase();
  if (supabase && isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('reportes')
        .select('*')
        .ilike('folio', cleanedFolio)
        .limit(1);

      if (!error && data && data.length > 0) {
        return data[0] as Report;
      }
    } catch (error) {
      console.warn('Error en Supabase al buscar por folio:', error);
    }
  }

  const sql = getNeonSql();
  if (sql && isNeonConfigured) {
    try {
      const rows = await sql`SELECT * FROM reportes WHERE UPPER(folio) = ${cleanedFolio} LIMIT 1`;
      if (rows && rows.length > 0) {
        return rows[0] as Report;
      }
    } catch (error) {
      console.warn('Error en Neon SQL:', error);
    }
  }

  const localList = getLocalReports();
  return localList.find(r => r.folio.toUpperCase() === cleanedFolio) || null;
}

/**
 * Crear un nuevo reporte anónimo en Supabase, Neon o LocalStorage
 */
export async function createReport(input: NewReportInput): Promise<Report> {
  const newFolio = generateFolio();
  const now = new Date().toISOString();

  const newReport: Report = {
    folio: newFolio,
    tipo: input.tipo,
    categoria: input.categoria,
    urgencia: input.urgencia,
    asunto: input.asunto.trim(),
    descripcion: input.descripcion.trim(),
    adjunto: input.adjunto || '',
    estado: 'Pendiente',
    respuesta_admin: '',
    fecha_creacion: now,
    fecha_actualizacion: now,
  };

  const supabase = getSupabase();
  if (supabase && isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('reportes')
        .insert([newReport])
        .select();

      if (!error && data && data.length > 0) {
        return data[0] as Report;
      }
    } catch (error) {
      console.warn('Error al insertar en Supabase, guardando localmente:', error);
    }
  }

  const sql = getNeonSql();
  if (sql && isNeonConfigured) {
    try {
      const rows = await sql`
        INSERT INTO reportes (folio, tipo, categoria, urgencia, asunto, descripcion, adjunto, estado, respuesta_admin, fecha_creacion, fecha_actualizacion)
        VALUES (${newReport.folio}, ${newReport.tipo}, ${newReport.categoria}, ${newReport.urgencia}, ${newReport.asunto}, ${newReport.descripcion}, ${newReport.adjunto}, ${newReport.estado}, ${newReport.respuesta_admin}, ${newReport.fecha_creacion}, ${newReport.fecha_actualizacion})
        RETURNING *
      `;
      if (rows && rows.length > 0) {
        return rows[0] as Report;
      }
    } catch (error) {
      console.warn('Falló la inserción en Neon:', error);
    }
  }

  // Guardar en LocalStorage si no hay backend activo
  const localList = getLocalReports();
  newReport.id = Date.now();
  localList.unshift(newReport);
  saveLocalReports(localList);
  return newReport;
}

/**
 * Actualizar el estado y respuesta del administrador
 */
export async function updateReportStatus(
  folio: string, 
  nuevoEstado: ReportStatus, 
  respuestaAdmin?: string
): Promise<Report | null> {
  const cleanedFolio = folio.trim().toUpperCase();
  const now = new Date().toISOString();

  const supabase = getSupabase();
  if (supabase && isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('reportes')
        .update({
          estado: nuevoEstado,
          respuesta_admin: respuestaAdmin ?? '',
          fecha_actualizacion: now
        })
        .ilike('folio', cleanedFolio)
        .select();

      if (!error && data && data.length > 0) {
        return data[0] as Report;
      }
    } catch (error) {
      console.warn('Error al actualizar en Supabase:', error);
    }
  }

  const sql = getNeonSql();
  if (sql && isNeonConfigured) {
    try {
      const rows = await sql`
        UPDATE reportes
        SET estado = ${nuevoEstado},
            respuesta_admin = ${respuestaAdmin ?? ''},
            fecha_actualizacion = ${now}
        WHERE UPPER(folio) = ${cleanedFolio}
        RETURNING *
      `;
      if (rows && rows.length > 0) {
        return rows[0] as Report;
      }
    } catch (error) {
      console.warn('Error al actualizar en Neon:', error);
    }
  }

  // LocalStorage
  const localList = getLocalReports();
  const index = localList.findIndex(r => r.folio.toUpperCase() === cleanedFolio);
  if (index !== -1) {
    localList[index].estado = nuevoEstado;
    if (respuestaAdmin !== undefined) {
      localList[index].respuesta_admin = respuestaAdmin;
    }
    localList[index].fecha_actualizacion = now;
    saveLocalReports(localList);
    return localList[index];
  }

  return null;
}

/**
 * Eliminar un reporte
 */
export async function deleteReport(folio: string): Promise<boolean> {
  const cleanedFolio = folio.trim().toUpperCase();

  const supabase = getSupabase();
  if (supabase && isSupabaseConfigured) {
    try {
      const { error } = await supabase
        .from('reportes')
        .delete()
        .ilike('folio', cleanedFolio);

      if (!error) return true;
    } catch (error) {
      console.warn('Error al eliminar en Supabase:', error);
    }
  }

  const sql = getNeonSql();
  if (sql && isNeonConfigured) {
    try {
      await sql`DELETE FROM reportes WHERE UPPER(folio) = ${cleanedFolio}`;
      return true;
    } catch (error) {
      console.warn('Error al eliminar en Neon:', error);
    }
  }

  const localList = getLocalReports();
  const filtered = localList.filter(r => r.folio.toUpperCase() !== cleanedFolio);
  saveLocalReports(filtered);
  return true;
}
