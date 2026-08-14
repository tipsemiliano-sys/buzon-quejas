import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Header } from './components/Header';
import { ComplaintForm } from './components/ComplaintForm';
import { FolioLookup } from './components/FolioLookup';
import { ShieldCheck, Database } from 'lucide-react';
import { getSupabase } from './config/supabase';

// Carga diferida (Code Splitting / Lazy Loading) para optimizar el bundle inicial
const AdminLogin = lazy(() =>
  import('./components/AdminLogin').then((module) => ({ default: module.AdminLogin }))
);
const AdminDashboard = lazy(() =>
  import('./components/AdminDashboard').then((module) => ({ default: module.AdminDashboard }))
);

export function App() {
  const [activeTab, setActiveTab] = useState<'create' | 'lookup' | 'admin'>('create');
  const [selectedLookupFolio, setSelectedLookupFolio] = useState<string>('');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;

    // 1. Verificar sesión activa inicial en Supabase Auth
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAdminLoggedIn(Boolean(session));
    });

    // 2. Escuchar cambios en el estado de autenticación (Login, Logout, Token Refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAdminLoggedIn(Boolean(session));
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSuccessCreated = (folio: string) => {
    setSelectedLookupFolio(folio);
  };

  const handleGoToLookup = (folio: string) => {
    setSelectedLookupFolio(folio);
    setActiveTab('lookup');
  };

  const handleLogoutAdmin = async () => {
    const supabase = getSupabase();
    if (supabase) {
      await supabase.auth.signOut();
    }
    setIsAdminLoggedIn(false);
    setActiveTab('create');
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 text-slate-900 selection:bg-indigo-600 selection:text-white">
      
      {/* Elementos visuales de iluminación de fondo en tema claro */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-indigo-200/40 rounded-full blur-[128px] pointer-events-none"></div>
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-cyan-200/40 rounded-full blur-[128px] pointer-events-none"></div>

      {/* Header Principal */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isAdminLoggedIn={isAdminLoggedIn}
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
            <Suspense
              fallback={
                <div className="flex flex-col items-center justify-center py-20 space-y-3">
                  <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs text-slate-500 font-semibold">Cargando módulo de administración...</p>
                </div>
              }
            >
              {isAdminLoggedIn ? (
                <AdminDashboard onLogout={handleLogoutAdmin} />
              ) : (
                <AdminLogin onLoginSuccess={() => setIsAdminLoggedIn(true)} />
              )}
            </Suspense>
          </div>
        )}

      </main>

      {/* Footer Elegante y Claro */}
      <footer className="bg-white/90 border-t border-slate-200 py-6 mt-12 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span className="font-medium">Sistema Anónimo de Quejas y Sugerencias Corporativas &copy; {new Date().getFullYear()}</span>
          </div>

          <div className="flex items-center space-x-2">
            <Database className="w-3.5 h-3.5 text-indigo-600" />
            <span className="text-slate-600 font-medium">Conectado a Supabase Cloud</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default App;

