import React from 'react';
import { ShieldCheck, Send, Search, Lock, Github, Database } from 'lucide-react';
import { isNeonConfigured } from '../config/neon';

interface HeaderProps {
  activeTab: 'create' | 'lookup' | 'admin';
  setActiveTab: (tab: 'create' | 'lookup' | 'admin') => void;
  isAdminLoggedIn: boolean;
  onOpenHelpModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isAdminLoggedIn,
  onOpenHelpModal,
}) => {
  return (
    <header className="sticky top-0 z-40 glass-panel border-b border-slate-800/80 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Branding */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('create')}>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold tracking-tight text-white bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-indigo-200">
                  Buzón Anónimo
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1.5"></span>
                  Online 24/7
                </span>
              </div>
              <p className="text-xs text-slate-400">Canal confidencial de quejas y sugerencias</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 p-1 bg-slate-900/90 rounded-xl border border-slate-800/80">
            <button
              onClick={() => setActiveTab('create')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === 'create'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>Realizar Envío</span>
            </button>

            <button
              onClick={() => setActiveTab('lookup')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === 'lookup'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Consultar Folio</span>
            </button>

            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === 'admin'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>Administración</span>
              {isAdminLoggedIn && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 ml-1"></span>
              )}
            </button>
          </nav>

          {/* Action buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onOpenHelpModal}
              className="flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-700/60 transition shadow-sm"
              title="Guía de despliegue en GitHub y Neon DB"
            >
              <Github className="w-4 h-4 text-indigo-400" />
              <span className="hidden sm:inline">Guía GitHub / DB</span>
            </button>

            {/* Indicator of Database Status */}
            <div 
              className={`hidden lg:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border ${
                isNeonConfigured 
                  ? 'bg-cyan-950/40 text-cyan-400 border-cyan-800/50' 
                  : 'bg-amber-950/40 text-amber-400 border-amber-800/50'
              }`}
              title={isNeonConfigured ? 'Conectado a Neon PostgreSQL' : 'Modo Demostración Local (Sin Neon)'}
            >
              <Database className="w-3.5 h-3.5" />
              <span>{isNeonConfigured ? 'Neon Active' : 'Demo Local'}</span>
            </div>
          </div>

        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center justify-around py-2.5 border-t border-slate-800/60">
          <button
            onClick={() => setActiveTab('create')}
            className={`flex flex-col items-center py-1 px-3 text-xs font-medium rounded-lg ${
              activeTab === 'create' ? 'text-indigo-400' : 'text-slate-400'
            }`}
          >
            <Send className="w-4 h-4 mb-1" />
            <span>Envío</span>
          </button>
          <button
            onClick={() => setActiveTab('lookup')}
            className={`flex flex-col items-center py-1 px-3 text-xs font-medium rounded-lg ${
              activeTab === 'lookup' ? 'text-indigo-400' : 'text-slate-400'
            }`}
          >
            <Search className="w-4 h-4 mb-1" />
            <span>Consultar</span>
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            className={`flex flex-col items-center py-1 px-3 text-xs font-medium rounded-lg ${
              activeTab === 'admin' ? 'text-indigo-400' : 'text-slate-400'
            }`}
          >
            <Lock className="w-4 h-4 mb-1" />
            <span>Admin</span>
          </button>
        </div>

      </div>
    </header>
  );
};
