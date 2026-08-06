export type ReportType = 'queja' | 'sugerencia' | 'felicitacion' | 'etica';
export type UrgencyLevel = 'baja' | 'media' | 'alta' | 'critica';
export type ReportStatus = 'Pendiente' | 'En Revisión' | 'En Proceso' | 'Resuelto' | 'Archivado';

export interface Report {
  id?: number;
  folio: string;
  tipo: ReportType;
  categoria: string;
  urgencia: UrgencyLevel;
  asunto: string;
  descripcion: string;
  adjunto?: string;
  estado: ReportStatus;
  respuesta_admin?: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface NewReportInput {
  tipo: ReportType;
  categoria: string;
  urgencia: UrgencyLevel;
  asunto: string;
  descripcion: string;
  adjunto?: string;
}
