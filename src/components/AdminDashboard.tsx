import React, { useState, useEffect } from 'react';
import { Download, RefreshCw, LogOut, Filter, Search, Eye, AlertTriangle, Lightbulb, HeartHandshake, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { Report, ReportStatus, ReportType, UrgencyLevel } from '../types';
import { getAllReports, updateReportStatus, deleteReport } from '../services/storageService';
import { StatsOverview } from './StatsOverview';
import { ReportDetailModal } from './ReportDetailModal';

interface AdminDashboardProps {
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filtros
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterTipo, setFilterTipo] = useState<string>('todos');
  const [filterUrgencia, setFilterUrgencia] = useState<string>('todos');
  const [filterEstado, setFilterEstado] = useState<string>('todos');

  // Modal de Detalle
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await getAllReports();
      setReports(data);
    } catch (err) {
      console.error('Error al cargar reportes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleUpdateStatus = async (folio: string, newStatus: ReportStatus, responseText?: string) => {
    await updateReportStatus(folio, newStatus, responseText);
    await fetchReports();
  };

  const handleDeleteReport = async (folio: string) => {
    await deleteReport(folio);
    await fetchReports();
  };

  // Filtrado dinámico
  const filteredReports = reports.filter((r) => {
    const matchesSearch =
      r.folio.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.asunto.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.categoria.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTipo = filterTipo === 'todos' || r.tipo === filterTipo;
    const matchesUrgencia = filterUrgencia === 'todos' || r.urgencia === filterUrgencia;
    const matchesEstado = filterEstado === 'todos' || r.estado === filterEstado;

    return matchesSearch && matchesTipo && matchesUrgencia && matchesEstado;
  });

  // Exportar a CSV
  const handleExportCSV = () => {
    if (filteredReports.length === 0) return;

    const headers = ['Folio', 'Tipo', 'Categoria', 'Urgencia', 'Asunto', 'Estado', 'Fecha Creacion', 'Respuesta Admin'];
    const rows = filteredReports.map((r) => [
      `"${r.folio}"`,
      `"${r.tipo}"`,
      `"${r.categoria}"`,
      `"${r.urgencia}"`,
      `"${r.asunto.replace(/"/g, '""')}"`,
      `"${r.estado}"`,
      `"${new Date(r.fecha_creacion).toLocaleString('es-MX')}"`,
      `"${(r.respuesta_admin || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Buzon_Quejas_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getUrgencyBadge = (urgencia: UrgencyLevel) => {
    const styles: Record<UrgencyLevel, string> = {
      baja: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      media: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      alta: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
      critica: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    };
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border uppercase tracking-wider ${styles[urgencia]}`}>
        {urgencia}
      </span>
    );
  };

  const getStatusBadge = (estado: ReportStatus) => {
    const styles: Record<ReportStatus, string> = {
      'Pendiente': 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      'En Revisión': 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      'En Proceso': 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
      'Resuelto': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      'Archivado': 'bg-slate-500/10 text-slate-400 border-slate-500/30',
    };
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[estado]}`}>
        {estado}
      </span>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-indigo-500/20">
        <div>
          <h2 className="text-2xl font-bold text-white">Panel de Gestión de Quejas y Sugerencias</h2>
          <p className="text-xs text-slate-400 mt-1">Administra los casos, actualiza estados y responde a los colaboradores</p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={fetchReports}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Recargar lista"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center space-x-2"
          >
            <Download className="w-4 h-4 text-indigo-400" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={onLogout}
            className="px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold border border-rose-500/30 transition flex items-center space-x-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>

      {/* Resumen de Métricas */}
      <StatsOverview reports={reports} />

      {/* Barra de Filtros y Búsqueda */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Buscador */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por folio, asunto o categoría..."
              className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-2.5 pl-10 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          </div>

          {/* Filtro por Tipo */}
          <select
            value={filterTipo}
            onChange={(e) => setFilterTipo(e.target.value)}
            className="bg-slate-900/90 border border-slate-700/80 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="todos">Todos los Tipos</option>
            <option value="queja">Quejas</option>
            <option value="sugerencia">Sugerencias</option>
            <option value="felicitacion">Felicitaciones</option>
            <option value="etica">Ética / Acoso</option>
          </select>

          {/* Filtro por Urgencia */}
          <select
            value={filterUrgencia}
            onChange={(e) => setFilterUrgencia(e.target.value)}
            className="bg-slate-900/90 border border-slate-700/80 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="todos">Todas las Urgencias</option>
            <option value="baja">Baja</option>
            <option value="media">Media</option>
            <option value="alta">Alta</option>
            <option value="critica">Crítica</option>
          </select>

          {/* Filtro por Estado */}
          <select
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            className="bg-slate-900/90 border border-slate-700/80 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="todos">Todos los Estados</option>
            <option value="Pendiente">Pendiente</option>
            <option value="En Revisión">En Revisión</option>
            <option value="En Proceso">En Proceso</option>
            <option value="Resuelto">Resuelto</option>
            <option value="Archivado">Archivado</option>
          </select>

        </div>
      </div>

      {/* Tabla Interactiva de Reportes */}
      <div className="glass-panel rounded-3xl overflow-hidden border border-slate-800 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/90 border-b border-slate-800 text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                <th className="py-4 px-5">Folio</th>
                <th className="py-4 px-5">Tipo</th>
                <th className="py-4 px-5">Urgencia</th>
                <th className="py-4 px-5">Asunto & Categoría</th>
                <th className="py-4 px-5">Fecha</th>
                <th className="py-4 px-5">Estado</th>
                <th className="py-4 px-5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <span className="inline-block w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-2"></span>
                    <p className="text-xs">Cargando registros desde Neon DB...</p>
                  </td>
                </tr>
              ) : filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No se encontraron reportes con los criterios seleccionados.
                  </td>
                </tr>
              ) : (
                filteredReports.map((r) => (
                  <tr
                    key={r.folio}
                    onClick={() => setSelectedReport(r)}
                    className="hover:bg-slate-800/40 transition cursor-pointer group"
                  >
                    <td className="py-4 px-5 font-mono font-bold text-indigo-400 group-hover:text-indigo-300">
                      {r.folio}
                    </td>

                    <td className="py-4 px-5 uppercase font-semibold text-slate-300">
                      {r.tipo}
                    </td>

                    <td className="py-4 px-5">
                      {getUrgencyBadge(r.urgencia)}
                    </td>

                    <td className="py-4 px-5 max-w-xs">
                      <p className="font-semibold text-slate-100 truncate">{r.asunto}</p>
                      <span className="text-[11px] text-slate-400">{r.categoria}</span>
                    </td>

                    <td className="py-4 px-5 text-slate-400 text-[11px] whitespace-nowrap">
                      {new Date(r.fecha_creacion).toLocaleDateString('es-MX', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>

                    <td className="py-4 px-5 whitespace-nowrap">
                      {getStatusBadge(r.estado)}
                    </td>

                    <td className="py-4 px-5 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedReport(r);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 transition text-xs font-medium inline-flex items-center space-x-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Gestionar</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Detalle */}
      {selectedReport && (
        <ReportDetailModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onUpdateStatus={handleUpdateStatus}
          onDeleteReport={handleDeleteReport}
        />
      )}

    </div>
  );
};
