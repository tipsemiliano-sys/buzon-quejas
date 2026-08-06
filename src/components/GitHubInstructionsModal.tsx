import React, { useState } from 'react';
import { X, Github, Database, Mail, Terminal, ExternalLink, CheckCircle2, Copy } from 'lucide-react';

interface GitHubInstructionsModalProps {
  onClose: () => void;
}

export const GitHubInstructionsModal: React.FC<GitHubInstructionsModalProps> = ({ onClose }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const sqlScript = `CREATE TABLE IF NOT EXISTS reportes (
    id SERIAL PRIMARY KEY,
    folio VARCHAR(20) UNIQUE NOT NULL,
    tipo VARCHAR(30) NOT NULL,
    categoria VARCHAR(60) NOT NULL,
    urgencia VARCHAR(20) NOT NULL,
    asunto VARCHAR(180) NOT NULL,
    descripcion TEXT NOT NULL,
    adjunto TEXT,
    estado VARCHAR(30) DEFAULT 'Pendiente',
    respuesta_admin TEXT,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);`;

  const gitCommands = `git init
git add .
git commit -m "Buzón de Quejas versión inicial"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/buzon-quejas.git
git push -u origin main`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="glass-panel w-full max-w-3xl max-h-[90vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl border border-indigo-500/30">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Github className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Guía de Despliegue en GitHub Pages y Neon</h2>
              <p className="text-xs text-slate-400">Paso a paso para publicar tu sitio 24/7 y conectar tu base de datos</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-300 text-xs">
          
          {/* PASO 1: GitHub Pages */}
          <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center space-x-2 text-indigo-400 font-bold text-sm">
              <Github className="w-4 h-4" />
              <span>1. Activar Despliegue en GitHub Pages (Gratis e Ilimitado 24/7)</span>
            </div>
            <ol className="list-decimal list-inside space-y-1.5 text-slate-300 leading-relaxed pl-1">
              <li>Crea un nuevo repositorio en GitHub llamado <code className="bg-slate-800 px-1.5 py-0.5 rounded text-indigo-300">buzon-quejas</code>.</li>
              <li>Ejecuta los siguientes comandos en tu consola terminal:</li>
            </ol>
            <div className="relative">
              <pre className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 font-mono text-[11px] text-emerald-400 overflow-x-auto">
                {gitCommands}
              </pre>
              <button
                onClick={() => copyToClipboard(gitCommands, 1)}
                className="absolute right-2 top-2 p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                {copiedIndex === 1 ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-slate-400 text-[11px]">
              👉 Una vez subido a GitHub, ve a la pestaña <b>Settings</b> -&gt; <b>Pages</b> -&gt; en Source elige <b>GitHub Actions</b>. ¡Tu sitio estará listo en 1 minuto!
            </p>
          </div>

          {/* PASO 2: Neon DB */}
          <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center space-x-2 text-cyan-400 font-bold text-sm">
              <Database className="w-4 h-4" />
              <span>2. Crear Tabla en Neon PostgreSQL</span>
            </div>
            <p className="text-slate-300">
              Ingresa a <a href="https://console.neon.tech" target="_blank" rel="noreferrer" className="text-cyan-400 underline font-semibold">console.neon.tech</a>, abre el <b>SQL Editor</b> y ejecuta este código SQL:
            </p>
            <div className="relative">
              <pre className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 font-mono text-[11px] text-cyan-300 max-h-36 overflow-y-auto">
                {sqlScript}
              </pre>
              <button
                onClick={() => copyToClipboard(sqlScript, 2)}
                className="absolute right-2 top-2 p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                {copiedIndex === 2 ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-slate-400 text-[11px]">
              Copia la cadena de conexión HTTPS / Postgres de Neon y configúrala en tu archivo <code className="bg-slate-800 px-1.5 py-0.5 rounded text-indigo-300">.env</code> como <code className="bg-slate-800 px-1.5 py-0.5 rounded text-indigo-300">VITE_NEON_DATABASE_URL</code>.
            </p>
          </div>

          {/* PASO 3: Correos con Web3Forms */}
          <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center space-x-2 text-amber-400 font-bold text-sm">
              <Mail className="w-4 h-4" />
              <span>3. Notificaciones por Correo Electrónico (Web3Forms)</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Para recibir notificaciones por correo en la bandeja del administrador al recibir una queja, ingresa gratis a <a href="https://web3forms.com" target="_blank" rel="noreferrer" className="text-amber-400 underline font-semibold">Web3Forms.com</a> con tu correo y obtén tu Access Key.
            </p>
            <p className="text-slate-400 text-[11px]">
              Esa clave se configura en <code className="bg-slate-800 px-1.5 py-0.5 rounded text-amber-300">VITE_WEB3FORMS_ACCESS_KEY</code> en las variables de entorno.
            </p>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/90 text-right">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition shadow-lg shadow-indigo-600/30"
          >
            Entendido
          </button>
        </div>

      </div>
    </div>
  );
};
