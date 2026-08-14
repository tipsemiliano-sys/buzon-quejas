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

// Inicialización vacía para evitar reportes precargados de demostración
const INITIAL_DEMO_REPORTS: Report[] = [];

function getLocalReports(): Report[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([]));
      return [];
    }
    return JSON.parse(raw);
  } catch {
    return [];
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
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
    const filePath = `adjuntos/${fileName}`;

    const { error } = await supabase.storage
      .from('evidencias_quejas')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Error al subir archivo a Supabase Storage:', error);
      throw new Error(`Falló la subida de evidencia a Supabase Storage: ${error.message}`);
    }

    const { data: publicUrlData } = supabase.storage
      .from('evidencias_quejas')
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  }

  // Fallback Data URL solo si Supabase no está configurado
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });
}

/**
 * Subida múltiple de archivos a Supabase Storage
 */
export async function uploadMultipleAnonymousFiles(files: File[]): Promise<string[]> {
  if (!files || files.length === 0) return [];
  const uploadPromises = files.map(file => uploadAnonymousFile(file));
  return Promise.all(uploadPromises);
}


/**
 * Obtener todos los reportes desde Supabase, Neon o LocalStorage
 */
export async function getAllReports(): Promise<Report[]> {
  const supabase = getSupabase();
  if (supabase && isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('reportes')
      .select('*')
      .order('fecha_creacion', { ascending: false });

    if (error) {
      console.error('Error al consultar reportes en Supabase:', error);
      throw new Error(`Error en Supabase: ${error.message}`);
    }

    return (data || []) as Report[];
  }

  const sql = getNeonSql();
  if (sql && isNeonConfigured) {
    try {
      const rows = await sql`SELECT * FROM reportes ORDER BY fecha_creacion DESC`;
      return rows as Report[];
    } catch (error) {
      console.error('Error en Neon SQL:', error);
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
    const { data, error } = await supabase
      .from('reportes')
      .select('*')
      .ilike('folio', cleanedFolio)
      .limit(1);

    if (error) {
      console.error('Error al buscar folio en Supabase:', error);
      throw new Error(`Error en Supabase: ${error.message}`);
    }

    return (data && data.length > 0) ? (data[0] as Report) : null;
  }

  const sql = getNeonSql();
  if (sql && isNeonConfigured) {
    try {
      const rows = await sql`SELECT * FROM reportes WHERE UPPER(folio) = ${cleanedFolio} LIMIT 1`;
      if (rows && rows.length > 0) {
        return rows[0] as Report;
      }
    } catch (error) {
      console.error('Error en Neon SQL:', error);
    }
  }

  const localList = getLocalReports();
  return localList.find(r => r.folio.toUpperCase() === cleanedFolio) || null;
}

/**
 * Crear un nuevo reporte anónimo en Supabase
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
    const { data, error } = await supabase
      .from('reportes')
      .insert([newReport])
      .select();

    if (error) {
      console.error('Error al insertar reporte en Supabase:', error);
      throw new Error(`Error en Supabase: ${error.message}. Verifica que hayas creado la tabla 'reportes' y habilitado sus políticas RLS.`);
    }

    if (data && data.length > 0) {
      return data[0] as Report;
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
      console.error('Falló la inserción en Neon:', error);
      throw error;
    }
  }

  // Guardar en LocalStorage solo si no hay base de datos configurada
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
    const { data, error } = await supabase
      .from('reportes')
      .update({
        estado: nuevoEstado,
        respuesta_admin: respuestaAdmin ?? '',
        fecha_actualizacion: now
      })
      .ilike('folio', cleanedFolio)
      .select();

    if (error) {
      console.error('Error al actualizar en Supabase:', error);
      throw new Error(`Error en Supabase: ${error.message}`);
    }

    return (data && data.length > 0) ? (data[0] as Report) : null;
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
      console.error('Error al actualizar en Neon:', error);
    }
  }

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
    const { error } = await supabase
      .from('reportes')
      .delete()
      .ilike('folio', cleanedFolio);

    if (error) {
      console.error('Error al eliminar en Supabase:', error);
      throw new Error(`Error en Supabase: ${error.message}`);
    }

    return true;
  }

  const sql = getNeonSql();
  if (sql && isNeonConfigured) {
    try {
      await sql`DELETE FROM reportes WHERE UPPER(folio) = ${cleanedFolio}`;
      return true;
    } catch (error) {
      console.error('Error al eliminar en Neon:', error);
    }
  }

  const localList = getLocalReports();
  const filtered = localList.filter(r => r.folio.toUpperCase() !== cleanedFolio);
  saveLocalReports(filtered);
  return true;
}
