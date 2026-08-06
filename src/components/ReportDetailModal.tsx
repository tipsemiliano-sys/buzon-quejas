import React, { useState } from 'react';
import { X, Save, Trash2, Calendar, ExternalLink, MessageSquare, AlertTriangle, ShieldAlert, Lightbulb, HeartHandshake, CheckCircle2 } from 'lucide-react';
import { Report, ReportStatus } from '../types';

interface ReportDetailModalProps {
  report: Report;
  onClose: () => void;
  onUpdateStatus: (folio: string, newStatus: ReportStatus, responseText?: string) => Promise<void>;
  onDeleteReport: (folio: string) => Promise<void>;
}

const ALL_STATUSES: ReportStatus[] = ['Pendiente', 'En Revisión', 'En Proceso', 'Resuelto', 'Archivado'];

export const ReportDetailModal: React.FC<ReportDetailModalProps> = ({
  report,
  onClose,
  onUpdateStatus,
  onDeleteReport,
}) => {
  const [estado, setEstado] = useState<ReportStatus>(report.estado);
  const [respuestaAdmin, setRespuestaAdmin] = useState<string>(report.respuesta_admin || '');
  const [saving, setSaving] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);

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

  const handleDelete = async () => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar permanentemente el reporte ${report.folio}?`)) {
      setDeleting(true);
      try {
        await onDeleteReport(report.folio);
        onClose();
      } catch (err) {
        console.error(err);
      } finally {
        setDeleting(false);
      }
    }
  };

  const getTypeIcon = (tipo: string) => {
    switch (tipo) {
      case 'queja': return <AlertTriangle className="w-4 h-4 text-rose-400" />;
      case 'sugerencia': return <Lightbulb className="w-4 h-4 text-amber-400" />;
      case 'felicitacion': return <HeartHandshake className="w-4 h-4 text-emerald-400" />;
      case 'etica': return <ShieldAlert className="w-4 h-4 text-purple-400" />;
      default: return <AlertTriangle className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="glass-panel w-full max-w-2xl max-h-[90vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl border border-slate-700/80">
        
        {/* Header Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-slate-800 border border-slate-700">
              {getTypeIcon(report.tipo)}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-sm font-bold text-indigo-400">{report.folio}</span>
                <span className="text-xs uppercase font-semibold text-slate-400">({report.tipo})</span>
              </div>
              <span className="text-xs text-slate-400">{report.categoria}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-200 text-sm">
          
          {/* Asunto */}
          <div>
            <h3 className="text-lg font-bold text-white mb-1">{report.asunto}</h3>
            <p className="text-xs text-slate-400 flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5 text-indigo-400 mr-1" />
              <span>Registrado el {new Date(report.fecha_creacion).toLocaleString('es-MX')}</span>
            </p>
          </div>

          {/* Contenido Completo */}
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Descripción del Reporte</span>
            <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 text-slate-200 whitespace-pre-line leading-relaxed">
              {report.descripcion}
            </div>
          </div>

          {/* Adjunto si aplica */}
          {report.adjunto && (
            <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Archivo o Evidencia Adjunta:</span>
              <a
                href={report.adjunto}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-400 hover:underline font-semibold flex items-center space-x-1"
              >
                <span>Abrir Evidencia</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {/* Selector de Cambiar Estado */}
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800/80 space-y-3">
            <label className="block text-xs font-semibold uppercase text-indigo-400 tracking-wider">
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
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Campo para Respuesta / Nota Oficial del Administrador */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase text-indigo-400 tracking-wider flex items-center space-x-1.5">
              <MessageSquare className="w-4 h-4" />
              <span>2. Respuesta Pública u Observación para el Usuario</span>
            </label>
            <textarea
              rows={4}
              value={respuestaAdmin}
              onChange={(e) => setRespuestaAdmin(e.target.value)}
              placeholder="Escribe aquí la respuesta oficial o actualización que el empleado podrá leer de forma anónima al consultar su folio..."
              className="w-full bg-slate-900/90 border border-slate-700/80 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            ></textarea>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900/90">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold border border-rose-500/30 transition flex items-center space-x-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>{deleting ? 'Eliminando...' : 'Eliminar Caso'}</span>
          </button>

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition flex items-center space-x-2"
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
