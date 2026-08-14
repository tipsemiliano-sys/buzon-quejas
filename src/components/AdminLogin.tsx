import React, { useState } from 'react';
import { Lock, ShieldCheck, Key, Mail, AlertCircle } from 'lucide-react';
import { getSupabase, isSupabaseConfigured } from '../config/supabase';

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const supabase = getSupabase();
    if (!supabase || !isSupabaseConfigured) {
      setError('La conexión con Supabase no está configurada. Verifica las variables de entorno.');
      setLoading(false);
      return;
    }

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (authError) {
        if (authError.message.includes('Invalid login credentials')) {
          setError('Correo electrónico o contraseña incorrectos.');
        } else if (authError.message.includes('Email not confirmed')) {
          setError('El correo electrónico no ha sido confirmado.');
        } else {
          setError(`Error de autenticación: ${authError.message}`);
        }
        setLoading(false);
        return;
      }

      if (data.session) {
        onLoginSuccess();
      }
    } catch (err: any) {
      console.error('Error al iniciar sesión:', err);
      setError('Ocurrió un error inesperado al conectar con el servidor de autenticación.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-10 animate-fade-in">
      <div className="bg-white p-8 rounded-3xl space-y-6 shadow-xl border border-slate-200 text-center relative overflow-hidden">
        
        {/* Glow de fondo ligero */}
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-indigo-100/50 rounded-full blur-2xl pointer-events-none"></div>

        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-2 border border-indigo-200 glow-indigo">
          <Lock className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-slate-900">Acceso de Administración</h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Inicia sesión con tu cuenta de administrador de Supabase
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-xl text-xs flex items-center space-x-2 text-left font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Correo Electrónico
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@tuempresa.com"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3.5 pl-11 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition"
              />
              <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Contraseña
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3.5 pl-11 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition"
              />
              <Key className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !email.trim() || !password}
            className="w-full py-3.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-600/20 transition disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <>
                <ShieldCheck className="w-5 h-5" />
                <span>Ingresar de Forma Segura</span>
              </>
            )}
          </button>
        </form>

        <div className="text-[11px] text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200">
          🔒 <span className="font-semibold text-slate-700">Seguridad:</span> Autenticación protegida por tokens criptográficos (JWT) mediante Supabase Auth.
        </div>

      </div>
    </div>
  );
};
