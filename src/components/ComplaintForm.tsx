import React, { useState } from 'react';
import { Send, ShieldAlert, CheckCircle2, Copy, AlertTriangle, Lightbulb, Lock, Info, Building2, HelpCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { NewReportInput, Report, ReportType, UrgencyLevel } from '../types';
import { createReport } from '../services/storageService';
import { sendAdminNotificationEmail } from '../services/emailService';

interface ComplaintFormProps {
  onSuccessCreated: (folio: string) => void;
  onGoToLookup: (folio: string) => void;
}

const QUEJA_CATEGORIES = [
  'Infraestructura / Herramientas de trabajo (ej. fallas en equipos, instalaciones, insumos)',
  'Procesos y Operación (ej. carga de trabajo, horarios, desorganización)',
  'Clima Laboral y Trato (ej. faltas de respeto, mala comunicación)',
  'Conducta Grave o Ética (ej. acoso, discriminación, incumplimiento de normas)',
  'Otro'
];

const SUGERENCIA_ASPECTOS = [
  'Herramientas o equipo de trabajo',
  'Ambiente y clima laboral',
  'Eficiencia en procesos o tareas',
  'Beneficios, horarios o espacio físico',
  'Otro'
];

const AREAS_EMPRESA = [
  'Ventas',
  'Administración',
  'Operaciones',
  'Mantenimiento',
  'Recursos Humanos',
  'Tecnologías de la Información (TI)',
  'Finanzas / Contabilidad',
  'Atención al Cliente',
  'Logística y Almacén',
  'Otra Área / No Aplica'
];

type QuejaUrgenciaOption = 'Bajo' | 'Medio' | 'Alto';

const QUEJA_URGENCIAS: { id: QuejaUrgenciaOption; label: string; sub: string; urgencyLevel: UrgencyLevel }[] = [
  {
    id: 'Bajo',
    label: 'Bajo',
    sub: 'Es un inconveniente leve pero molesto.',
    urgencyLevel: 'baja'
  },
  {
    id: 'Medio',
    label: 'Medio',
    sub: 'Afecta mi trabajo o el del equipo en el día a día.',
    urgencyLevel: 'media'
  },
  {
    id: 'Alto',
    label: 'Alto',
    sub: 'Requiere atención inmediata (riesgo físico, acoso o afectación grave).',
    urgencyLevel: 'alta'
  }
];

export const ComplaintForm: React.FC<ComplaintFormProps> = ({ onSuccessCreated, onGoToLookup }) => {
  // Sección 1: Selección de Tipo de Registro
  const [tipoRegistro, setTipoRegistro] = useState<'queja' | 'sugerencia'>('queja');

  // Campos Sección Queja
  const [quejaCategoria, setQuejaCategoria] = useState<string>('');
  const [quejaArea, setQuejaArea] = useState<string>('');
  const [quejaDescripcion, setQuejaDescripcion] = useState<string>('');
  const [quejaUrgencia, setQuejaUrgencia] = useState<QuejaUrgenciaOption>('Medio');
  const [quejaPropuesta, setQuejaPropuesta] = useState<string>('');

  // Campos Sección Sugerencia
  const [sugerenciaAspecto, setSugerenciaAspecto] = useState<string>('');
  const [sugerenciaPropuesta, setSugerenciaPropuesta] = useState<string>('');
  const [sugerenciaBeneficios, setSugerenciaBeneficios] = useState<string>('');
  const [sugerenciaRecursos, setSugerenciaRecursos] = useState<string>('');

  // Opcional adjunto
  const [adjuntoUrl, setAdjuntoUrl] = useState<string>('');

  // Estados auxiliares
  const [touched, setTouched] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [submittedReport, setSubmittedReport] = useState<Report | null>(null);
  const [emailStatus, setEmailStatus] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  // Validación estricta
  const isQuejaValid = quejaCategoria.trim() !== '' && quejaDescripcion.trim() !== '' && quejaUrgencia.trim() !== '';
  const isSugerenciaValid = sugerenciaAspecto.trim() !== '' && sugerenciaPropuesta.trim() !== '' && sugerenciaBeneficios.trim() !== '';
  const isFormValid = tipoRegistro === 'queja' ? isQuejaValid : isSugerenciaValid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);

    if (!isFormValid) return;

    setLoading(true);

    try {
      let inputData: NewReportInput;

      if (tipoRegistro === 'queja') {
        const selectedUrgencyObj = QUEJA_URGENCIAS.find(u => u.id === quejaUrgencia);
        const urgencyLevel = selectedUrgencyObj ? selectedUrgencyObj.urgencyLevel : 'media';

        let fullDesc = `Categoría de Incidencia: ${quejaCategoria}\n`;
        if (quejaArea) fullDesc += `Área / Departamento: ${quejaArea}\n`;
        fullDesc += `Nivel de Urgencia / Impacto: ${quejaUrgencia}\n\n`;
        fullDesc += `Descripción Detallada de los Hechos:\n${quejaDescripcion.trim()}`;
        if (quejaPropuesta.trim()) {
          fullDesc += `\n\nPropuesta de Solución (Opcional):\n${quejaPropuesta.trim()}`;
        }

        inputData = {
          tipo: 'queja',
          categoria: quejaCategoria,
          urgencia: urgencyLevel,
          asunto: `Queja: ${quejaCategoria.slice(0, 60)}`,
          descripcion: fullDesc,
          adjunto: adjuntoUrl.trim() || undefined,
        };
      } else {
        let fullDesc = `Aspecto a Mejorar: ${sugerenciaAspecto}\n\n`;
        fullDesc += `Descripción de la Idea / Propuesta:\n${sugerenciaPropuesta.trim()}\n\n`;
        fullDesc += `Beneficios esperados para el equipo/empresa:\n${sugerenciaBeneficios.trim()}`;
        if (sugerenciaRecursos.trim()) {
          fullDesc += `\n\nRecursos o Acciones Necesarios (Opcional):\n${sugerenciaRecursos.trim()}`;
        }

        inputData = {
          tipo: 'sugerencia',
          categoria: sugerenciaAspecto,
          urgencia: 'media',
          asunto: `Sugerencia: ${sugerenciaAspecto.slice(0, 60)}`,
          descripcion: fullDesc,
          adjunto: adjuntoUrl.trim() || undefined,
        };
      }

      // 1. Guardar reporte en Neon o LocalStorage
      const created = await createReport(inputData);

      // 2. Enviar correo de notificación al administrador
      const emailRes = await sendAdminNotificationEmail(created);
      setEmailStatus(emailRes.message);

      // 3. Animación de confeti por éxito
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // Ignorar si confetti no está cargado
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
        <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center shadow-xl relative overflow-hidden">
          
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-5 border border-emerald-200 glow-emerald">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <h2 className="text-2xl font-extrabold text-slate-900 mb-2">¡Reporte Enviado con Éxito!</h2>
          <p className="text-slate-600 text-sm max-w-md mx-auto mb-6">
            Tu contribución ha sido registrada de forma 100% anónima. Guarda tu código de folio único para darle seguimiento posterior.
          </p>

          {/* Tarjeta del Folio */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 max-w-md mx-auto mb-6 relative shadow-inner">
            <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">Tu Folio de Seguimiento</span>
            <div className="flex items-center justify-center space-x-3 my-2">
              <span className="font-mono text-3xl font-bold tracking-widest text-indigo-600 select-all">
                {submittedReport.folio}
              </span>
              <button
                onClick={handleCopyFolio}
                className="p-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 transition"
                title="Copiar Folio"
              >
                {copied ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
            {copied && <span className="text-xs text-emerald-600 font-semibold">¡Copiado al portapapeles!</span>}
          </div>

          {/* Estado de notificación de correo */}
          <div className="text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-200 mb-6 max-w-md mx-auto flex items-start space-x-2 text-left">
            <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <span>{emailStatus}</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onGoToLookup(submittedReport.folio)}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md shadow-indigo-600/20 transition flex items-center justify-center space-x-2"
            >
              <span>Ver Estado de mi Folio</span>
            </button>

            <button
              onClick={() => {
                setSubmittedReport(null);
                setQuejaCategoria('');
                setQuejaArea('');
                setQuejaDescripcion('');
                setQuejaPropuesta('');
                setSugerenciaAspecto('');
                setSugerenciaPropuesta('');
                setSugerenciaBeneficios('');
                setSugerenciaRecursos('');
                setAdjuntoUrl('');
                setTouched(false);
              }}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold transition"
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
      
      {/* Sección 1: Inicio y Bienvenida - Texto de Bienvenida */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md space-y-3">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl shrink-0">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Buzón Confidencial Anónimo</h2>
            <span className="inline-block bg-indigo-100 text-indigo-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full mt-0.5">
              Garantía de Privacidad 100%
            </span>
          </div>
        </div>
        <p className="text-sm text-slate-700 leading-relaxed font-medium bg-slate-50 p-4 rounded-2xl border border-slate-100">
          "Este buzón es estrictamente anónimo. No se recolectan correos, direcciones IP ni nombres. Tu identidad está protegida para fomentar la honestidad y la mejora continua."
        </p>
      </div>

      {/* Tarjeta del Formulario Principal */}
      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl space-y-8 border border-slate-200 shadow-xl">
        
        {/* Pregunta 1: ¿Qué tipo de registro deseas realizar? (Obligatoria) */}
        <div className="space-y-3 pb-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-bold text-slate-900">
              Pregunta 1: ¿Qué tipo de registro deseas realizar? <span className="text-rose-500 font-bold">* (Obligatoria)</span>
            </label>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <button
              type="button"
              onClick={() => {
                setTipoRegistro('queja');
                setTouched(false);
              }}
              className={`p-5 rounded-2xl border-2 text-left transition-all flex items-start space-x-3 ${
                tipoRegistro === 'queja'
                  ? 'bg-rose-50/80 border-rose-500 text-rose-950 shadow-md ring-2 ring-rose-500/20'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100/80'
              }`}
            >
              <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${tipoRegistro === 'queja' ? 'bg-rose-500 text-white' : 'bg-slate-200 text-slate-600'}`}>
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-slate-900">Realizar una Queja</h4>
                <p className="text-xs text-slate-600 mt-1">Ir a la Sección 1: Reporte de problemas, infraestructura, clima o conductas.</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setTipoRegistro('sugerencia');
                setTouched(false);
              }}
              className={`p-5 rounded-2xl border-2 text-left transition-all flex items-start space-x-3 ${
                tipoRegistro === 'sugerencia'
                  ? 'bg-indigo-50/80 border-indigo-600 text-indigo-950 shadow-md ring-2 ring-indigo-500/20'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100/80'
              }`}
            >
              <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${tipoRegistro === 'sugerencia' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                <Lightbulb className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-slate-900">Realizar una Sugerencia</h4>
                <p className="text-xs text-slate-600 mt-1">Ir a la Sección 2: Propuestas de mejora, beneficios, herramientas o eficiencias.</p>
              </div>
            </button>

          </div>
        </div>

        {/* ====================================================== */}
        {/* SECCIÓN 1: BUZÓN DE QUEJAS */}
        {/* ====================================================== */}
        {tipoRegistro === 'queja' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
              <span className="bg-rose-100 text-rose-800 text-xs font-bold px-3 py-1 rounded-full">
                Sección 1: Buzón de Quejas
              </span>
              <span className="text-xs text-slate-500 font-medium">(Al terminar esta sección: Seleccionar "Enviar formulario")</span>
            </div>

            {/* Pregunta 1: Categoría o tipo de incidencia (Obligatoria) */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Pregunta 1: Categoría o tipo de incidencia <span className="text-rose-500 font-bold">* (Obligatoria)</span>
              </label>
              <div className="space-y-2">
                {QUEJA_CATEGORIES.map((cat) => (
                  <label
                    key={cat}
                    className={`flex items-start space-x-3 p-3.5 rounded-xl border transition cursor-pointer ${
                      quejaCategoria === cat
                        ? 'bg-rose-50 border-rose-400 text-slate-900 font-semibold'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="quejaCategoria"
                      required
                      checked={quejaCategoria === cat}
                      onChange={() => setQuejaCategoria(cat)}
                      className="mt-0.5 h-4 w-4 text-rose-600 focus:ring-rose-500 border-slate-300"
                    />
                    <span className="text-xs leading-relaxed">{cat}</span>
                  </label>
                ))}
              </div>
              {touched && !quejaCategoria && (
                <p className="text-xs font-bold text-rose-600 mt-1">⚠️ Debes seleccionar una categoría para continuar.</p>
              )}
            </div>

            {/* Pregunta 2: Área o departamento (Opcional) */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                Pregunta 2: ¿En qué área o departamento ocurre la situación? <span className="text-slate-400 font-normal">(Opcional)</span>
              </label>
              <select
                value={quejaArea}
                onChange={(e) => setQuejaArea(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition"
              >
                <option value="">-- Seleccionar área o departamento (Opcional) --</option>
                {AREAS_EMPRESA.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>
            </div>

            {/* Pregunta 3: Descripción detallada de los hechos (Obligatoria) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Pregunta 3: Descripción detallada de los hechos <span className="text-rose-500 font-bold">* (Obligatoria)</span>
                </label>
              </div>
              
              <div className="bg-amber-50 border border-amber-200 text-amber-900 text-xs p-3 rounded-xl flex items-center space-x-2">
                <HelpCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="font-semibold">Tip: Describe qué sucedió, cuándo o con qué frecuencia ocurre.</span>
              </div>

              <textarea
                required
                rows={5}
                value={quejaDescripcion}
                onChange={(e) => setQuejaDescripcion(e.target.value)}
                placeholder="Escribe aquí los detalles del acontecimiento, fechas aproximadas, frecuencia o detalles relevantes..."
                className={`w-full bg-white border rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition ${
                  touched && !quejaDescripcion.trim()
                    ? 'border-rose-500 focus:ring-rose-500/20'
                    : 'border-slate-300 focus:border-indigo-600 focus:ring-indigo-500/20'
                }`}
              ></textarea>
              {touched && !quejaDescripcion.trim() && (
                <p className="text-xs font-bold text-rose-600">⚠️ La descripción detallada de los hechos es obligatoria.</p>
              )}
            </div>

            {/* Pregunta 4: Nivel de urgencia / Impacto (Obligatoria) */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Pregunta 4: Nivel de urgencia / Impacto <span className="text-rose-500 font-bold">* (Obligatoria)</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {QUEJA_URGENCIAS.map((urg) => (
                  <button
                    key={urg.id}
                    type="button"
                    onClick={() => setQuejaUrgencia(urg.id)}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      quejaUrgencia === urg.id
                        ? urg.id === 'Alto'
                          ? 'bg-rose-50 border-rose-500 text-rose-950 ring-2 ring-rose-500/20'
                          : urg.id === 'Medio'
                          ? 'bg-amber-50 border-amber-500 text-amber-950 ring-2 ring-amber-500/20'
                          : 'bg-blue-50 border-blue-500 text-blue-950 ring-2 ring-blue-500/20'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-extrabold text-sm text-slate-900 flex items-center justify-between">
                      <span>{urg.label}</span>
                      {quejaUrgencia === urg.id && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-snug">{urg.sub}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Pregunta 5: Propuesta para solucionar este problema (Opcional) */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Pregunta 5: ¿Tienes alguna propuesta para solucionar este problema? <span className="text-slate-400 font-normal">(Opcional)</span>
              </label>
              <textarea
                rows={3}
                value={quejaPropuesta}
                onChange={(e) => setQuejaPropuesta(e.target.value)}
                placeholder="Si tienes alguna idea de cómo resolverlo o prevenirlo, compártela aquí..."
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition"
              ></textarea>
            </div>
          </div>
        )}

        {/* ====================================================== */}
        {/* SECCIÓN 2: BUZÓN DE SUGERENCIAS */}
        {/* ====================================================== */}
        {tipoRegistro === 'sugerencia' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
              <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-3 py-1 rounded-full">
                Sección 2: Buzón de Sugerencias
              </span>
            </div>

            {/* Pregunta 1: Aspecto a mejorar (Obligatoria) */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Pregunta 1: ¿Qué aspecto te gustaría mejorar? <span className="text-rose-500 font-bold">* (Obligatoria)</span>
              </label>
              <div className="space-y-2">
                {SUGERENCIA_ASPECTOS.map((asp) => (
                  <label
                    key={asp}
                    className={`flex items-start space-x-3 p-3.5 rounded-xl border transition cursor-pointer ${
                      sugerenciaAspecto === asp
                        ? 'bg-indigo-50 border-indigo-400 text-slate-900 font-semibold'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="sugerenciaAspecto"
                      required
                      checked={sugerenciaAspecto === asp}
                      onChange={() => setSugerenciaAspecto(asp)}
                      className="mt-0.5 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300"
                    />
                    <span className="text-xs leading-relaxed">{asp}</span>
                  </label>
                ))}
              </div>
              {touched && !sugerenciaAspecto && (
                <p className="text-xs font-bold text-rose-600 mt-1">⚠️ Debes seleccionar un aspecto a mejorar.</p>
              )}
            </div>

            {/* Pregunta 2: Describe tu idea o propuesta (Obligatoria) */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Pregunta 2: Describe tu idea o propuesta <span className="text-rose-500 font-bold">* (Obligatoria)</span>
              </label>
              <textarea
                required
                rows={4}
                value={sugerenciaPropuesta}
                onChange={(e) => setSugerenciaPropuesta(e.target.value)}
                placeholder="Describe tu propuesta de forma clara y detallada..."
                className={`w-full bg-white border rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition ${
                  touched && !sugerenciaPropuesta.trim()
                    ? 'border-rose-500 focus:ring-rose-500/20'
                    : 'border-slate-300 focus:border-indigo-600 focus:ring-indigo-500/20'
                }`}
              ></textarea>
              {touched && !sugerenciaPropuesta.trim() && (
                <p className="text-xs font-bold text-rose-600">⚠️ La descripción de tu propuesta es obligatoria.</p>
              )}
            </div>

            {/* Pregunta 3: Beneficios para el equipo o empresa (Obligatoria) */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Pregunta 3: ¿Qué beneficios traerá esta mejora al equipo o a la empresa? <span className="text-rose-500 font-bold">* (Obligatoria)</span>
              </label>
              <textarea
                required
                rows={3}
                value={sugerenciaBeneficios}
                onChange={(e) => setSugerenciaBeneficios(e.target.value)}
                placeholder="Explica qué problemas resuelve, ahorro de tiempo, mejor ambiente o ventajas para el equipo..."
                className={`w-full bg-white border rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition ${
                  touched && !sugerenciaBeneficios.trim()
                    ? 'border-rose-500 focus:ring-rose-500/20'
                    : 'border-slate-300 focus:border-indigo-600 focus:ring-indigo-500/20'
                }`}
              ></textarea>
              {touched && !sugerenciaBeneficios.trim() && (
                <p className="text-xs font-bold text-rose-600">⚠️ Especificar los beneficios de la mejora es obligatorio.</p>
              )}
            </div>

            {/* Pregunta 4: Recursos o acciones necesarios (Opcional) */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Pregunta 4: ¿Qué recursos o acciones crees que se necesitan para aplicarla? <span className="text-slate-400 font-normal">(Opcional)</span>
              </label>
              <textarea
                rows={3}
                value={sugerenciaRecursos}
                onChange={(e) => setSugerenciaRecursos(e.target.value)}
                placeholder="Menciona si se requieren insumos, cambios de software, capacitaciones o apoyo de alguna área..."
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition"
              ></textarea>
            </div>
          </div>
        )}

        {/* Enlace o Evidencia Opcional */}
        <div className="pt-4 border-t border-slate-200">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Enlace o Evidencia de Soporte <span className="text-slate-400 font-normal">(Opcional)</span>
          </label>
          <input
            type="url"
            value={adjuntoUrl}
            onChange={(e) => setAdjuntoUrl(e.target.value)}
            placeholder="Ejemplo: https://drive.google.com/file/... o enlace a imagen de evidencia"
            className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition"
          />
          <p className="text-[11px] text-slate-500 mt-1">Puedes incluir un enlace a Google Drive, OneDrive o servicios de imágenes para sustentar tu envío.</p>
        </div>

        {/* Mensaje de validación general antes de enviar */}
        {touched && !isFormValid && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center space-x-2 font-medium">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Por favor completa todos los campos señalados como <b>(Obligatoria)</b> antes de enviar el formulario.</span>
          </div>
        )}

        {/* Botón de Envío */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 px-6 rounded-2xl text-white font-bold text-base shadow-lg transition flex items-center justify-center space-x-2 ${
              loading
                ? 'bg-slate-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/25 active:scale-[0.99]'
            }`}
          >
            {loading ? (
              <span className="flex items-center space-x-2">
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                <span>Enviando de Forma Anónima...</span>
              </span>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Enviar formulario</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
};
