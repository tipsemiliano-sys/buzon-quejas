import { neon } from '@neondatabase/serverless';

// Obtener la URL de conexión desde variables de entorno VITE_NEON_DATABASE_URL
const databaseUrl = import.meta.env.VITE_NEON_DATABASE_URL || '';

export const isNeonConfigured = Boolean(
  databaseUrl && 
  (databaseUrl.startsWith('postgres://') || databaseUrl.startsWith('postgresql://') || databaseUrl.startsWith('https://'))
);

export function getNeonSql() {
  if (!isNeonConfigured) {
    return null;
  }
  try {
    return neon(databaseUrl);
  } catch (error) {
    console.error('Error al inicializar la conexión con Neon:', error);
    return null;
  }
}
