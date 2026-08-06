-- Script de creación de tabla para Neon PostgreSQL
-- Copia y pega este contenido en el SQL Editor de tu consola de Neon (https://console.neon.tech)

CREATE TABLE IF NOT EXISTS reportes (
    id SERIAL PRIMARY KEY,
    folio VARCHAR(20) UNIQUE NOT NULL,
    tipo VARCHAR(30) NOT NULL,        -- 'queja', 'sugerencia', 'felicitacion', 'etica'
    categoria VARCHAR(60) NOT NULL,   -- 'Ambiente Laboral', 'Infraestructura', etc.
    urgencia VARCHAR(20) NOT NULL,    -- 'baja', 'media', 'alta', 'critica'
    asunto VARCHAR(180) NOT NULL,
    descripcion TEXT NOT NULL,
    adjunto TEXT,                      -- Enlace o datos base64 opcionales
    estado VARCHAR(30) DEFAULT 'Pendiente', -- 'Pendiente', 'En Revisión', 'En Proceso', 'Resuelto', 'Archivado'
    respuesta_admin TEXT,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índice para acelerar búsquedas por Folio y Estado
CREATE INDEX IF NOT EXISTS idx_reportes_folio ON reportes(folio);
CREATE INDEX IF NOT EXISTS idx_reportes_estado ON reportes(estado);
