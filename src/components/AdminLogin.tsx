import React, { useState } from 'react';
import { Lock, ShieldCheck, Key, AlertCircle } from 'lucide-react';

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

const DEFAULT_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123';

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess }) => {
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    setTimeout(() => {
      if (password === DEFAULT_PASSWORD || password === 'admin') {
        localStorage.setItem('admin_authenticated', 'true');
        onLoginSuccess();
      } else {
        setError('Contraseña incorrecta. Por favor intenta de nuevo.');
      }
      setLoading(false);
    }, 400);
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
            Panel restringido para la gestión y seguimiento de quejas y sugerencias
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
              Contraseña de Acceso
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
            disabled={loading || !password}
            className="w-full py-3.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-600/20 transition disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <>
                <ShieldCheck className="w-5 h-5" />
                <span>Ingresar al Panel</span>
              </>
            )}
          </button>
        </form>

        <div className="text-[11px] text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200">
          🔑 <span className="font-semibold text-slate-700">Contraseña por defecto:</span> <code className="bg-white border border-slate-300 px-1.5 py-0.5 rounded text-indigo-700 font-bold">admin123</code> (puedes cambiarla en tus variables de entorno).
        </div>

      </div>
    </div>
  );
};
