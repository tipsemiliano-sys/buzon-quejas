import React, { useState, useEffect } from 'react';
import { Download, RefreshCw, LogOut, Search, Eye } from 'lucide-react';
import { Report, ReportStatus, UrgencyLevel } from '../types';
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
      baja: 'bg-blue-50 text-blue-700 border-blue-200',
      media: 'bg-amber-50 text-amber-700 border-amber-200',
      alta: 'bg-orange-50 text-orange-700 border-orange-200',
      critica: 'bg-rose-50 text-rose-700 border-rose-200',
    };
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border uppercase tracking-wider ${styles[urgencia]}`}>
        {urgencia}
      </span>
    );
  };

  const getStatusBadge = (estado: ReportStatus) => {
    const styles: Record<ReportStatus, string> = {
      'Pendiente': 'bg-amber-50 text-amber-700 border-amber-200',
      'En Revisión': 'bg-blue-50 text-blue-700 border-blue-200',
      'En Proceso': 'bg-indigo-50 text-indigo-700 border-indigo-200',
      'Resuelto': 'bg-emerald-50 text-emerald-700 border-emerald-200',
      'Archivado': 'bg-slate-100 text-slate-600 border-slate-200',
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-md">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Panel de Gestión de Quejas y Sugerencias</h2>
          <p className="text-xs text-slate-500 font-medium mt-1">Administra los casos, actualiza estados y responde a los colaboradores</p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={fetchReports}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition"
            title="Recargar lista"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold border border-slate-200 transition flex items-center space-x-2"
          >
            <Download className="w-4 h-4 text-indigo-600" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={onLogout}
            className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold border border-rose-200 transition flex items-center space-x-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>

      {/* Resumen de Métricas */}
      <StatsOverview reports={reports} />

      {/* Barra de Filtros y Búsqueda */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Buscador */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por folio, asunto o categoría..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 pl-10 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          </div>

          {/* Filtro por Tipo */}
          <select
            value={filterTipo}
            onChange={(e) => setFilterTipo(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 font-medium"
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
            className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 font-medium"
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
            className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 font-medium"
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
      <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase font-bold text-slate-500 tracking-wider">
                <th className="py-4 px-5">Folio</th>
                <th className="py-4 px-5">Tipo</th>
                <th className="py-4 px-5">Urgencia</th>
                <th className="py-4 px-5">Asunto & Categoría</th>
                <th className="py-4 px-5">Fecha</th>
                <th className="py-4 px-5">Estado</th>
                <th className="py-4 px-5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <span className="inline-block w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-2"></span>
                    <p className="text-xs font-medium">Cargando registros...</p>
                  </td>
                </tr>
              ) : filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No se encontraron reportes con los criterios seleccionados.
                  </td>
                </tr>
              ) : (
                filteredReports.map((r) => (
                  <tr
                    key={r.folio}
                    onClick={() => setSelectedReport(r)}
                    className="hover:bg-slate-50/80 transition cursor-pointer group"
                  >
                    <td className="py-4 px-5 font-mono font-bold text-indigo-600 group-hover:text-indigo-800">
                      {r.folio}
                    </td>

                    <td className="py-4 px-5 uppercase font-bold text-slate-700">
                      {r.tipo}
                    </td>

                    <td className="py-4 px-5">
                      {getUrgencyBadge(r.urgencia)}
                    </td>

                    <td className="py-4 px-5 max-w-xs">
                      <p className="font-bold text-slate-900 truncate">{r.asunto}</p>
                      <span className="text-[11px] text-slate-500 font-medium">{r.categoria}</span>
                    </td>

                    <td className="py-4 px-5 text-slate-500 text-[11px] whitespace-nowrap font-medium">
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
                        className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition text-xs font-semibold inline-flex items-center space-x-1"
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
