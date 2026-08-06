import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ComplaintForm } from './components/ComplaintForm';
import { FolioLookup } from './components/FolioLookup';
import { AdminLogin } from './components/AdminLogin';
import { AdminDashboard } from './components/AdminDashboard';
import { GitHubInstructionsModal } from './components/GitHubInstructionsModal';
import { ShieldCheck, Heart, Github } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<'create' | 'lookup' | 'admin'>('create');
  const [selectedLookupFolio, setSelectedLookupFolio] = useState<string>('');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);

  useEffect(() => {
    const authSaved = localStorage.getItem('admin_authenticated');
    if (authSaved === 'true') {
      setIsAdminLoggedIn(true);
    }
  }, []);

  const handleSuccessCreated = (folio: string) => {
    setSelectedLookupFolio(folio);
  };

  const handleGoToLookup = (folio: string) => {
    setSelectedLookupFolio(folio);
    setActiveTab('lookup');
  };

  const handleLogoutAdmin = () => {
    localStorage.removeItem('admin_authenticated');
    setIsAdminLoggedIn(false);
    setActiveTab('create');
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      
      {/* Elementos visuales de iluminación de fondo */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[128px] pointer-events-none"></div>
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-[128px] pointer-events-none"></div>

      {/* Header Principal */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isAdminLoggedIn={isAdminLoggedIn}
        onOpenHelpModal={() => setShowHelpModal(true)}
      />

      {/* Contenido Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 z-10">
        
        {activeTab === 'create' && (
          <div className="animate-fade-in">
            <ComplaintForm
              onSuccessCreated={handleSuccessCreated}
              onGoToLookup={handleGoToLookup}
            />
          </div>
        )}

        {activeTab === 'lookup' && (
          <div className="animate-fade-in">
            <FolioLookup initialFolio={selectedLookupFolio} />
          </div>
        )}

        {activeTab === 'admin' && (
          <div className="animate-fade-in">
            {isAdminLoggedIn ? (
              <AdminDashboard onLogout={handleLogoutAdmin} />
            ) : (
              <AdminLogin onLoginSuccess={() => setIsAdminLoggedIn(true)} />
            )}
          </div>
        )}

      </main>

      {/* Footer Elegante */}
      <footer className="glass-panel border-t border-slate-800/80 py-6 mt-12 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span>Sistema Anónimo de Quejas y Sugerencias Corporativas &copy; {new Date().getFullYear()}</span>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowHelpModal(true)}
              className="text-slate-400 hover:text-indigo-300 transition flex items-center space-x-1"
            >
              <Github className="w-3.5 h-3.5" />
              <span>Desplegado en GitHub Pages</span>
            </button>
            <span className="text-slate-700">•</span>
            <span className="text-slate-500">Conectado a Neon DB</span>
          </div>
        </div>
      </footer>

      {/* Modal de Ayuda y Despliegue en GitHub */}
      {showHelpModal && (
        <GitHubInstructionsModal onClose={() => setShowHelpModal(false)} />
      )}

    </div>
  );
}

export default App;
