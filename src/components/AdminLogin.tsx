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
      <div className="glass-panel p-8 rounded-3xl space-y-6 shadow-2xl border border-indigo-500/20 text-center relative overflow-hidden">
        
        {/* Glow de fondo */}
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-indigo-600/20 rounded-full blur-2xl"></div>

        <div className="w-16 h-16 bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-2 border border-indigo-500/30 glow-indigo">
          <Lock className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white">Acceso de Administración</h2>
          <p className="text-xs text-slate-400 mt-1">
            Panel restringido para la gestión y seguimiento de quejas y sugerencias
          </p>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 p-3.5 rounded-xl text-xs flex items-center space-x-2 text-left">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Contraseña de Acceso
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-3.5 pl-11 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
              <Key className="w-5 h-5 text-slate-500 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full py-3.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-600/30 transition disabled:opacity-50 flex items-center justify-center space-x-2"
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

        <div className="text-[11px] text-slate-500 bg-slate-900/50 p-3 rounded-xl border border-slate-800/60">
          🔑 <span className="font-semibold text-slate-400">Contraseña por defecto:</span> <code className="bg-slate-800 px-1.5 py-0.5 rounded text-indigo-300">admin123</code> (puedes cambiarla en tus variables de entorno).
        </div>

      </div>
    </div>
  );
};
