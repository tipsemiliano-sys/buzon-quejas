/**
 * Conexión a Neon DB desactivada en frontend por seguridad.
 * Las conexiones directas PostgreSQL no deben ejecutarse en el navegador
 * para evitar la exposición de credenciales maestras.
 * La aplicación utiliza Supabase con Row Level Security (RLS).
 */

export const isNeonConfigured = false;

export function getNeonSql() {
  return null;
}

