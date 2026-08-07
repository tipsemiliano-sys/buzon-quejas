import React, { useState } from 'react';
import { X, Save, Calendar, ExternalLink, MessageSquare, AlertTriangle, ShieldAlert, Lightbulb, HeartHandshake, Paperclip } from 'lucide-react';
import { Report, ReportStatus } from '../types';

interface ReportDetailModalProps {
  report: Report;
  onClose: () => void;
  onUpdateStatus: (folio: string, newStatus: ReportStatus, responseText?: string) => Promise<void>;
}

const ALL_STATUSES: ReportStatus[] = ['Pendiente', 'En Revisión', 'En Proceso', 'Resuelto', 'Archivado'];

export const ReportDetailModal: React.FC<ReportDetailModalProps> = ({
  report,
  onClose,
  onUpdateStatus,
}) => {
  const [estado, setEstado] = useState<ReportStatus>(report.estado);
  const [respuestaAdmin, setRespuestaAdmin] = useState<string>(report.respuesta_admin || '');
  const [saving, setSaving] = useState<boolean>(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdateStatus(report.folio, estado, respuestaAdmin);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const getTypeIcon = (tipo: string) => {
    switch (tipo) {
      case 'queja': return <AlertTriangle className="w-4 h-4 text-rose-600" />;
      case 'sugerencia': return <Lightbulb className="w-4 h-4 text-amber-600" />;
      case 'felicitacion': return <HeartHandshake className="w-4 h-4 text-emerald-600" />;
      case 'etica': return <ShieldAlert className="w-4 h-4 text-purple-600" />;
      default: return <AlertTriangle className="w-4 h-4 text-indigo-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl border border-slate-200">
        
        {/* Header Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-xs">
              {getTypeIcon(report.tipo)}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-sm font-bold text-indigo-600">{report.folio}</span>
                <span className="text-xs uppercase font-bold text-slate-500">({report.tipo})</span>
              </div>
              <span className="text-xs text-slate-500 font-medium">{report.categoria}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-800 text-sm">
          
          {/* Asunto */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">{report.asunto}</h3>
            <p className="text-xs text-slate-500 font-medium flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5 text-indigo-600 mr-1" />
              <span>Registrado el {new Date(report.fecha_creacion).toLocaleString('es-MX')}</span>
            </p>
          </div>

          {/* Contenido Completo */}
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">Descripción del Reporte</span>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-slate-800 whitespace-pre-line leading-relaxed text-sm">
              {report.descripcion}
            </div>
          </div>

          {/* Adjunto / Evidencia si existe */}
          {report.adjunto && report.adjunto.trim() !== '' && (
            <div className="bg-indigo-50/80 p-4 rounded-2xl border border-indigo-200 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2.5 text-indigo-950 font-bold">
                <Paperclip className="w-4 h-4 text-indigo-600" />
                <span>Documento / Evidencia Adjunta</span>
              </div>
              <a
                href={report.adjunto}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center space-x-1.5 shadow-xs transition"
              >
                <span>Abrir / Descargar Evidencia</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {/* Selector de Cambiar Estado */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <label className="block text-xs font-bold uppercase text-indigo-700 tracking-wider">
              1. Actualizar Estado del Caso
            </label>
            <div className="flex flex-wrap gap-2">
              {ALL_STATUSES.map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setEstado(st)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition border ${
                    estado === st
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Campo para Respuesta / Nota Oficial del Administrador */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase text-indigo-700 tracking-wider flex items-center space-x-1.5">
              <MessageSquare className="w-4 h-4" />
              <span>2. Respuesta Pública u Observación para el Usuario</span>
            </label>
            <textarea
              rows={4}
              value={respuestaAdmin}
              onChange={(e) => setRespuestaAdmin(e.target.value)}
              placeholder="Escribe aquí la respuesta oficial o actualización que el empleado podrá leer de forma anónima al consultar su folio..."
              className="w-full bg-white border border-slate-300 rounded-2xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition"
            ></textarea>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
          <span className="text-xs text-slate-500 font-medium italic">
            🔒 Registro inmutable y auditables. No se permite la eliminación de reportes.
          </span>

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-medium transition"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition flex items-center space-x-2"
            >
              {saving ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Guardar Cambios</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
