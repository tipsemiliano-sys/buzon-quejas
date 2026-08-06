import React from 'react';
import { Inbox, Clock, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';
import { Report } from '../types';

interface StatsOverviewProps {
  reports: Report[];
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ reports }) => {
  const total = reports.length;
  const pendientes = reports.filter(r => r.estado === 'Pendiente').length;
  const enProceso = reports.filter(r => r.estado === 'En Revisión' || r.estado === 'En Proceso').length;
  const resueltos = reports.filter(r => r.estado === 'Resuelto').length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      
      {/* Total */}
      <div className="glass-card p-5 rounded-2xl flex items-center justify-between border-l-4 border-l-indigo-500">
        <div>
          <span className="text-xs uppercase font-semibold text-slate-400">Total de Casos</span>
          <p className="text-2xl font-extrabold text-white mt-1">{total}</p>
        </div>
        <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
          <Inbox className="w-6 h-6" />
        </div>
      </div>

      {/* Pendientes */}
      <div className="glass-card p-5 rounded-2xl flex items-center justify-between border-l-4 border-l-amber-500">
        <div>
          <span className="text-xs uppercase font-semibold text-slate-400">Pendientes</span>
          <p className="text-2xl font-extrabold text-amber-400 mt-1">{pendientes}</p>
        </div>
        <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
          <Clock className="w-6 h-6" />
        </div>
      </div>

      {/* En Proceso */}
      <div className="glass-card p-5 rounded-2xl flex items-center justify-between border-l-4 border-l-blue-500">
        <div>
          <span className="text-xs uppercase font-semibold text-slate-400">En Atención</span>
          <p className="text-2xl font-extrabold text-blue-400 mt-1">{enProceso}</p>
        </div>
        <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
          <Layers className="w-6 h-6" />
        </div>
      </div>

      {/* Resueltos */}
      <div className="glass-card p-5 rounded-2xl flex items-center justify-between border-l-4 border-l-emerald-500">
        <div>
          <span className="text-xs uppercase font-semibold text-slate-400">Resueltos</span>
          <p className="text-2xl font-extrabold text-emerald-400 mt-1">{resueltos}</p>
        </div>
        <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
          <CheckCircle2 className="w-6 h-6" />
        </div>
      </div>

    </div>
  );
};
