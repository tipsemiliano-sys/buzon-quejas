import React from 'react';
import { ShieldCheck, Send, Search, Lock } from 'lucide-react';


interface HeaderProps {
  activeTab: 'create' | 'lookup' | 'admin';
  setActiveTab: (tab: 'create' | 'lookup' | 'admin') => void;
  isAdminLoggedIn: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isAdminLoggedIn,
}) => {

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* Logo & Branding */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('create')}>
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 p-0.5 shadow-md shadow-indigo-600/20">
              <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold tracking-tight text-slate-900">
                  Buzón Anónimo
                </h1>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1.5"></span>
                  Online 24/7
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Canal confidencial de quejas y sugerencias</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 p-1 bg-slate-100/90 rounded-2xl border border-slate-200">
            <button
              onClick={() => setActiveTab('create')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === 'create'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                }`}
            >
              <Send className="w-4 h-4" />
              <span>Realizar Envío</span>
            </button>

            <button
              onClick={() => setActiveTab('lookup')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === 'lookup'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                }`}
            >
              <Search className="w-4 h-4" />
              <span>Consultar Folio</span>
            </button>

            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === 'admin'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                }`}
            >
              <Lock className="w-4 h-4" />
              <span>Administración</span>
              {isAdminLoggedIn && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 ml-1"></span>
              )}
            </button>
          </nav>


          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center justify-around py-2.5 border-t border-slate-200">
            <button
              onClick={() => setActiveTab('create')}
              className={`flex flex-col items-center py-1 px-3 text-xs font-medium rounded-lg ${activeTab === 'create' ? 'text-indigo-600 font-bold' : 'text-slate-500'
                }`}
            >
              <Send className="w-4 h-4 mb-1" />
              <span>Envío</span>
            </button>
            <button
              onClick={() => setActiveTab('lookup')}
              className={`flex flex-col items-center py-1 px-3 text-xs font-medium rounded-lg ${activeTab === 'lookup' ? 'text-indigo-600 font-bold' : 'text-slate-500'
                }`}
            >
              <Search className="w-4 h-4 mb-1" />
              <span>Consultar</span>
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex flex-col items-center py-1 px-3 text-xs font-medium rounded-lg ${activeTab === 'admin' ? 'text-indigo-600 font-bold' : 'text-slate-500'
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
