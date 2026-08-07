import React from 'react';
import { Inbox, Clock, CheckCircle2, Layers } from 'lucide-react';
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
      <div className="bg-white p-5 rounded-2xl flex items-center justify-between border-l-4 border-l-indigo-600 border border-slate-200 shadow-sm">
        <div>
          <span className="text-xs uppercase font-bold text-slate-500">Total de Casos</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{total}</p>
        </div>
        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
          <Inbox className="w-6 h-6" />
        </div>
      </div>

      {/* Pendientes */}
      <div className="bg-white p-5 rounded-2xl flex items-center justify-between border-l-4 border-l-amber-500 border border-slate-200 shadow-sm">
        <div>
          <span className="text-xs uppercase font-bold text-slate-500">Pendientes</span>
          <p className="text-2xl font-extrabold text-amber-600 mt-1">{pendientes}</p>
        </div>
        <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
          <Clock className="w-6 h-6" />
        </div>
      </div>

      {/* En Proceso */}
      <div className="bg-white p-5 rounded-2xl flex items-center justify-between border-l-4 border-l-blue-500 border border-slate-200 shadow-sm">
        <div>
          <span className="text-xs uppercase font-bold text-slate-500">En Atención</span>
          <p className="text-2xl font-extrabold text-blue-600 mt-1">{enProceso}</p>
        </div>
        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
          <Layers className="w-6 h-6" />
        </div>
      </div>

      {/* Resueltos */}
      <div className="bg-white p-5 rounded-2xl flex items-center justify-between border-l-4 border-l-emerald-500 border border-slate-200 shadow-sm">
        <div>
          <span className="text-xs uppercase font-bold text-slate-500">Resueltos</span>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">{resueltos}</p>
        </div>
        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
          <CheckCircle2 className="w-6 h-6" />
        </div>
      </div>

    </div>
  );
};
