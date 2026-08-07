import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith('https://')
);

let supabaseClient: SupabaseClient | null = null;

if (isSupabaseConfigured) {
  try {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    console.error('Error al inicializar la conexión con Supabase:', error);
  }
}

export function getSupabase(): SupabaseClient | null {
  return supabaseClient;
}
