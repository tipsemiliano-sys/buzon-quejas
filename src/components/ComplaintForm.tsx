import React, { useState } from 'react';
import { Send, ShieldAlert, Sparkles, CheckCircle2, Copy, FileText, AlertTriangle, Lightbulb, HeartHandshake, Lock, Info } from 'lucide-react';
import confetti from 'canvas-confetti';
import { NewReportInput, Report, ReportType, UrgencyLevel } from '../types';
import { createReport } from '../services/storageService';
import { sendAdminNotificationEmail } from '../services/emailService';

interface ComplaintFormProps {
  onSuccessCreated: (folio: string) => void;
  onGoToLookup: (folio: string) => void;
}

const CATEGORIES = [
  'Ambiente y Clima Laboral',
  'Infraestructura, Equipos y Herramientas',
  'Procesos y Procedimientos',
  'Trato, Comunicación y Liderazgo',
  'Salud, Seguridad e Higiene',
  'Acoso, Discriminación o Ética',
  'Otro tema'
];

export const ComplaintForm: React.FC<ComplaintFormProps> = ({ onSuccessCreated, onGoToLookup }) => {
  const [tipo, setTipo] = useState<ReportType>('queja');
  const [categoria, setCategoria] = useState<string>(CATEGORIES[0]);
  const [urgencia, setUrgencia] = useState<UrgencyLevel>('media');
  const [asunto, setAsunto] = useState<string>('');
  const [descripcion, setDescripcion] = useState<string>('');
  const [adjuntoUrl, setAdjuntoUrl] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(false);
  const [submittedReport, setSubmittedReport] = useState<Report | null>(null);
  const [emailStatus, setEmailStatus] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!asunto.trim() || !descripcion.trim()) return;

    setLoading(true);

    try {
      const inputData: NewReportInput = {
        tipo,
        categoria,
        urgencia,
        asunto: asunto.trim(),
        descripcion: descripcion.trim(),
        adjunto: adjuntoUrl.trim() || undefined,
      };

      // 1. Guardar reporte en Neon PostgreSQL o LocalStorage
      const created = await createReport(inputData);

      // 2. Enviar correo de notificación al administrador
      const emailRes = await sendAdminNotificationEmail(created);
      setEmailStatus(emailRes.message);

      // 3. Disparar animación de confeti por éxito
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // Ignorar si confetti falla
      }

      setSubmittedReport(created);
      onSuccessCreated(created.folio);
    } catch (err) {
      console.error('Error al guardar reporte:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyFolio = () => {
    if (submittedReport) {
      navigator.clipboard.writeText(submittedReport.folio);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // PANTALLA DE ÉXITO TRAS ENVIAR
  if (submittedReport) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in py-8">
        <div className="glass-panel p-8 rounded-3xl border border-indigo-500/30 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl"></div>
          
          <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-5 border border-emerald-500/30 glow-emerald">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <h2 className="text-2xl font-extrabold text-white mb-2">¡Reporte Enviado con Éxito!</h2>
          <p className="text-slate-300 text-sm max-w-md mx-auto mb-6">
            Tu contribución ha sido registrada de forma 100% anónima. Guarda tu código de folio único para darle seguimiento posterior.
          </p>

          {/* Tarjeta del Folio */}
          <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-700/70 max-w-md mx-auto mb-6 relative">
            <span className="text-xs uppercase font-semibold text-slate-400 tracking-wider">Tu Folio de Seguimiento</span>
            <div className="flex items-center justify-center space-x-3 my-2">
              <span className="font-mono text-3xl font-bold tracking-widest text-indigo-400 select-all">
                {submittedReport.folio}
              </span>
              <button
                onClick={handleCopyFolio}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                title="Copiar Folio"
              >
                {copied ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
            {copied && <span className="text-xs text-emerald-400 font-medium">¡Copiado al portapapeles!</span>}
          </div>

          {/* Estado de notificación de correo */}
          <div className="text-xs text-slate-400 bg-slate-900/50 p-3.5 rounded-xl border border-slate-800/80 mb-6 max-w-md mx-auto flex items-start space-x-2 text-left">
            <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <span>{emailStatus}</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onGoToLookup(submittedReport.folio)}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/30 transition flex items-center justify-center space-x-2"
            >
              <span>Ver Estado de mi Folio</span>
            </button>

            <button
              onClick={() => {
                setSubmittedReport(null);
                setAsunto('');
                setDescripcion('');
                setAdjuntoUrl('');
              }}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition"
            >
              Realizar Otro Envío
            </button>
          </div>
        </div>
      </div>
    );
  }

  // FORMULARIO PRINCIPAL DE REGISTRO
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Banner Informativo de Garantía de Anonimato */}
      <div className="glass-panel p-5 rounded-2xl border border-indigo-500/20 flex items-start space-x-4">
        <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl shrink-0 mt-0.5">
          <Lock className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            Anonimato 100% Garantizado
            <span className="text-xs font-normal text-indigo-300 bg-indigo-950/80 px-2.5 py-0.5 rounded-full border border-indigo-800/60">Sin Registro</span>
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            No guardamos tu dirección IP, correo, ni ningún dato personal. Esta plataforma está diseñada exclusivamente para libre expresión y mejora continua en el ambiente laboral.
          </p>
        </div>
      </div>

      {/* Tarjeta del Formulario */}
      <form onSubmit={handleSubmit} className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6 shadow-xl">
        
        {/* Selector de Tipo de Reporte */}
        <div>
          <label className="block text-sm font-semibold text-slate-200 mb-3">
            1. ¿Qué deseas enviar hoy?
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            
            <button
              type="button"
              onClick={() => setTipo('queja')}
              className={`p-4 rounded-2xl border flex flex-col items-center justify-center text-center transition-all ${
                tipo === 'queja'
                  ? 'bg-rose-500/15 border-rose-500/60 text-rose-300 shadow-md shadow-rose-950/40'
                  : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
            >
              <AlertTriangle className="w-6 h-6 mb-2 text-rose-400" />
              <span className="text-xs font-bold">Queja</span>
            </button>

            <button
              type="button"
              onClick={() => setTipo('sugerencia')}
              className={`p-4 rounded-2xl border flex flex-col items-center justify-center text-center transition-all ${
                tipo === 'sugerencia'
                  ? 'bg-amber-500/15 border-amber-500/60 text-amber-300 shadow-md shadow-amber-950/40'
                  : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
            >
              <Lightbulb className="w-6 h-6 mb-2 text-amber-400" />
              <span className="text-xs font-bold">Sugerencia</span>
            </button>

            <button
              type="button"
              onClick={() => setTipo('felicitacion')}
              className={`p-4 rounded-2xl border flex flex-col items-center justify-center text-center transition-all ${
                tipo === 'felicitacion'
                  ? 'bg-emerald-500/15 border-emerald-500/60 text-emerald-300 shadow-md shadow-emerald-950/40'
                  : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
            >
              <HeartHandshake className="w-6 h-6 mb-2 text-emerald-400" />
              <span className="text-xs font-bold">Felicitación</span>
            </button>

            <button
              type="button"
              onClick={() => setTipo('etica')}
              className={`p-4 rounded-2xl border flex flex-col items-center justify-center text-center transition-all ${
                tipo === 'etica'
                  ? 'bg-purple-500/15 border-purple-500/60 text-purple-300 shadow-md shadow-purple-950/40'
                  : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
            >
              <ShieldAlert className="w-6 h-6 mb-2 text-purple-400" />
              <span className="text-xs font-bold">Ética / Acoso</span>
            </button>

          </div>
        </div>

        {/* Categoría y Nivel de Urgencia */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Categoría
            </label>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat} className="bg-slate-900 text-slate-100">
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Nivel de Urgencia
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['baja', 'media', 'alta', 'critica'] as UrgencyLevel[]).map((level) => {
                const colors: Record<UrgencyLevel, string> = {
                  baja: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
                  media: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
                  alta: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
                  critica: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
                };
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setUrgencia(level)}
                    className={`py-2 px-1 text-center rounded-xl border text-xs font-bold uppercase transition ${
                      urgencia === level
                        ? `${colors[level]} ring-2 ring-indigo-500`
                        : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {level}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Asunto */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Asunto o Título Corto *
          </label>
          <input
            type="text"
            required
            maxLength={120}
            value={asunto}
            onChange={(e) => setAsunto(e.target.value)}
            placeholder="Ejemplo: Falla en la iluminación del estacionamiento norte"
            className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
        </div>

        {/* Descripción Detallada */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Descripción Detallada *
          </label>
          <textarea
            required
            rows={5}
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Explica detalladamente la situación, contexto, fechas o aspectos relevantes que ayuden a comprender el caso..."
            className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          ></textarea>
        </div>

        {/* Enlace o Evidencia Opcional */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Enlace o Evidencia de Soporte (Opcional)
          </label>
          <input
            type="url"
            value={adjuntoUrl}
            onChange={(e) => setAdjuntoUrl(e.target.value)}
            placeholder="Ejemplo: https://drive.google.com/file/... o enlace a imagen de prueba"
            className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
          <p className="text-[11px] text-slate-500 mt-1">Puedes incluir un enlace seguro de Google Drive, OneDrive o servicio de imágenes.</p>
        </div>

        {/* Botón de Envío */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading || !asunto.trim() || !descripcion.trim()}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold shadow-xl shadow-indigo-600/25 transition disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <span className="flex items-center space-x-2">
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                <span>Procesando y Notificando...</span>
              </span>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Enviar de Forma Anónima</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
};
