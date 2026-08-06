import { Report, NewReportInput, ReportStatus } from '../types';
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

// Datos iniciales de demostración para LocalStorage cuando Neon aún no esté vinculado
const INITIAL_DEMO_REPORTS: Report[] = [
  {
    id: 1,
    folio: 'QS-2026-A8K91',
    tipo: 'queja',
    categoria: 'Infraestructura y Equipos',
    urgencia: 'alta',
    asunto: 'Falla constante en la climatización del segundo piso',
    descripcion: 'El sistema de aire acondicionado del área de desarrollo lleva 3 días goteando sobre los equipos y la temperatura supera los 28°C.',
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
    categoria: 'Ambiente y Bienestar Laboral',
    urgencia: 'media',
    asunto: 'Implementar días de frutas o snacks saludables',
    descripcion: 'Sugerimos habilitar una canasta de fruta fresca en el comedor dos veces por semana para incentivar hábitos más saludables en el equipo.',
    adjunto: '',
    estado: 'Pendiente',
    respuesta_admin: '',
    fecha_creacion: new Date(Date.now() - 86400000 * 2).toISOString(),
    fecha_actualizacion: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 3,
    folio: 'QS-2026-Z9R15',
    tipo: 'felicitacion',
    categoria: 'Trato y Liderazgo',
    urgencia: 'baja',
    asunto: 'Reconocimiento a la capacitación de ciberseguridad',
    descripcion: 'Excelente taller impartido esta semana. El instructor explicó de forma práctica cómo prevenir phishing sin tecnicismos complejos.',
    adjunto: '',
    estado: 'Resuelto',
    respuesta_admin: '¡Muchas gracias por la retroalimentación positiva! Compartiremos las felicitaciones con el departamento de TI.',
    fecha_creacion: new Date(Date.now() - 86400000 * 5).toISOString(),
    fecha_actualizacion: new Date(Date.now() - 86400000 * 4).toISOString(),
  }
];

// Auxiliar para obtener reportes de LocalStorage
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

// Auxiliar para guardar reportes en LocalStorage
function saveLocalReports(reports: Report[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(reports));
  } catch (error) {
    console.error('Error al guardar en LocalStorage:', error);
  }
}

/**
 * Obtener todos los reportes (de Neon o LocalStorage)
 */
export async function getAllReports(): Promise<Report[]> {
  const sql = getNeonSql();
  if (sql && isNeonConfigured) {
    try {
      const rows = await sql`
        SELECT * FROM reportes ORDER BY fecha_creacion DESC
      `;
      return rows as Report[];
    } catch (error) {
      console.warn('Fallback a LocalStorage debido a error en Neon SQL:', error);
      return getLocalReports();
    }
  }
  return getLocalReports();
}

/**
 * Obtener un reporte específico por su Folio
 */
export async function getReportByFolio(folio: string): Promise<Report | null> {
  const cleanedFolio = folio.trim().toUpperCase();
  const sql = getNeonSql();

  if (sql && isNeonConfigured) {
    try {
      const rows = await sql`
        SELECT * FROM reportes WHERE UPPER(folio) = ${cleanedFolio} LIMIT 1
      `;
      if (rows && rows.length > 0) {
        return rows[0] as Report;
      }
      return null;
    } catch (error) {
      console.warn('Error en Neon al buscar folio, intentando LocalStorage:', error);
    }
  }

  const localList = getLocalReports();
  return localList.find(r => r.folio.toUpperCase() === cleanedFolio) || null;
}

/**
 * Crear un nuevo reporte anónimo
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
      console.warn('Falló la inserción en Neon, guardando localmente:', error);
    }
  }

  // Guardar en LocalStorage si Neon no está activo
  const localList = getLocalReports();
  newReport.id = Date.now();
  localList.unshift(newReport);
  saveLocalReports(localList);
  return newReport;
}

/**
 * Actualizar el estado y respuesta del administrador para un reporte
 */
export async function updateReportStatus(
  folio: string, 
  nuevoEstado: ReportStatus, 
  respuestaAdmin?: string
): Promise<Report | null> {
  const cleanedFolio = folio.trim().toUpperCase();
  const now = new Date().toISOString();
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
      console.warn('Error al actualizar en Neon, intentando LocalStorage:', error);
    }
  }

  // Actualización en LocalStorage
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
 * Eliminar un reporte (Sólo administrador)
 */
export async function deleteReport(folio: string): Promise<boolean> {
  const cleanedFolio = folio.trim().toUpperCase();
  const sql = getNeonSql();

  if (sql && isNeonConfigured) {
    try {
      await sql`DELETE FROM reportes WHERE UPPER(folio) = ${cleanedFolio}`;
      return true;
    } catch (error) {
      console.warn('Error al eliminar en Neon, intentando en LocalStorage:', error);
    }
  }

  const localList = getLocalReports();
  const filtered = localList.filter(r => r.folio.toUpperCase() !== cleanedFolio);
  saveLocalReports(filtered);
  return true;
}
