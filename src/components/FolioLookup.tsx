import React, { useState } from 'react';
import { Search, Shield, Clock, CheckCircle, MessageSquare, AlertCircle, ExternalLink, Calendar } from 'lucide-react';
import { Report, ReportStatus } from '../types';
import { getReportByFolio } from '../services/storageService';

interface FolioLookupProps {
  initialFolio?: string;
}

const STATUS_STEPS: ReportStatus[] = ['Pendiente', 'En Revisión', 'En Proceso', 'Resuelto'];

export const FolioLookup: React.FC<FolioLookupProps> = ({ initialFolio = '' }) => {
  const [folioInput, setFolioInput] = useState<string>(initialFolio);
  const [report, setReport] = useState<Report | null>(null);
  const [searched, setSearched] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!folioInput.trim()) return;

    setLoading(true);
    setSearched(true);
    try {
      const found = await getReportByFolio(folioInput);
      setReport(found);
    } catch (err) {
      console.error('Error al buscar folio:', err);
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: ReportStatus) => {
    switch (status) {
      case 'Pendiente':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'En Revisión':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'En Proceso':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Resuelto':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Archivado':
        return 'bg-slate-100 text-slate-600 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Buscador de Folio */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl space-y-4 border border-slate-200 shadow-xl">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
            <Search className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Consulta de Estado por Folio</h2>
            <p className="text-xs text-slate-500 font-medium">Ingresa tu código de folio único para verificar los avances de tu caso</p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              required
              value={folioInput}
              onChange={(e) => setFolioInput(e.target.value)}
              placeholder="Ejemplo: QS-2026-X8F92"
              className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3.5 pl-11 text-base text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 font-mono tracking-wider transition"
            />
            <Shield className="w-5 h-5 text-slate-400 absolute left-3.5 top-4" />
          </div>

          <button
            type="submit"
            disabled={loading || !folioInput.trim()}
            className="px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md shadow-indigo-600/20 transition disabled:opacity-50 flex items-center justify-center space-x-2 shrink-0"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <>
                <Search className="w-5 h-5" />
                <span>Consultar Folio</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* RESULTADO DE LA BÚSQUEDA */}
      {searched && (
        <div>
          {report ? (
            <div className="bg-white p-6 sm:p-8 rounded-3xl space-y-6 shadow-xl animate-fade-in border border-slate-200">
              
              {/* Encabezado del reporte */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-5">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Folio:</span>
                    <span className="font-mono text-lg font-bold text-indigo-600">{report.folio}</span>
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900">{report.asunto}</h3>
                </div>

                <span className={`px-3.5 py-1.5 rounded-full text-xs font-bold border uppercase tracking-wider ${getStatusColor(report.estado)}`}>
                  {report.estado}
                </span>
              </div>

              {/* Línea de tiempo de estados */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Progreso del Caso
                </span>

                <div className="grid grid-cols-4 gap-2 pt-2">
                  {STATUS_STEPS.map((step, idx) => {
                    const currentIdx = STATUS_STEPS.indexOf(report.estado);
                    const isCompleted = currentIdx >= idx || report.estado === 'Resuelto';
                    const isCurrent = report.estado === step;

                    return (
                      <div key={step} className="flex flex-col items-center text-center">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition ${
                            isCurrent
                              ? 'bg-indigo-600 text-white ring-4 ring-indigo-600/20 glow-indigo'
                              : isCompleted
                              ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                              : 'bg-white text-slate-400 border border-slate-300'
                          }`}
                        >
                          {isCompleted ? <CheckCircle className="w-4 h-4" /> : idx + 1}
                        </div>
                        <span className={`text-[11px] font-semibold mt-1.5 ${isCurrent ? 'text-indigo-600 font-bold' : isCompleted ? 'text-slate-700' : 'text-slate-400'}`}>
                          {step}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Detalles del reporte */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-slate-500 font-medium">Categoría:</span>
                  <p className="text-sm font-semibold text-slate-900">{report.categoria}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-slate-500 font-medium">Fecha de Registro:</span>
                  <p className="text-sm font-semibold text-slate-900 flex items-center space-x-1.5">
                    <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{new Date(report.fecha_creacion).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </p>
                </div>
              </div>

              {/* Descripción */}
              <div className="space-y-2">
                <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">Detalles de la Solicitud</span>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-slate-800 text-sm whitespace-pre-line leading-relaxed">
                  {report.descripcion}
                </div>
              </div>

              {/* Evidencia si existe */}
              {report.adjunto && report.adjunto.trim() !== '' && (
                <div className="space-y-2 pt-1">
                  <span className="text-xs font-semibold text-slate-500 block">
                    {report.adjunto.includes(',') ? 'Archivos / Evidencias Adjuntas:' : 'Archivo / Evidencia Adjunta:'}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {report.adjunto.split(',').map((url, idx) => {
                      const trimmedUrl = url.trim();
                      if (!trimmedUrl) return null;
                      return (
                        <a
                          key={idx}
                          href={trimmedUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-2 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-xl text-xs font-semibold transition"
                        >
                          <span>Ver Evidencia #{idx + 1}</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Respuesta Oficial del Administrador */}
              <div className="space-y-2 pt-2">
                <span className="text-xs uppercase font-bold text-indigo-700 tracking-wider flex items-center space-x-1.5">
                  <MessageSquare className="w-4 h-4" />
                  <span>Respuesta Oficial de la Empresa</span>
                </span>

                {report.respuesta_admin ? (
                  <div className="bg-indigo-50/80 p-5 rounded-2xl border border-indigo-200 text-indigo-950 text-sm leading-relaxed space-y-2">
                    <p className="whitespace-pre-line">{report.respuesta_admin}</p>
                    <div className="text-[11px] text-indigo-700/80 pt-2 border-t border-indigo-200 flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>Actualizado: {new Date(report.fecha_actualizacion).toLocaleString('es-MX')}</span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-slate-500 text-xs italic">
                    Tu caso se encuentra actualmente en revisión por el equipo encargado. Se publicará una respuesta oficial aquí en cuanto sea analizado.
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="bg-white p-8 rounded-3xl text-center space-y-3 border border-rose-200 shadow-md">
              <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto border border-rose-200">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No se encontró ningún reporte con ese folio</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Verifica que el código ingresado coincida exactamente con el folio entregado (Ej: QS-2026-X8F92).
              </p>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
