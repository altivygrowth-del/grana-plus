import React, { useEffect, useState } from 'react';
import { FinancialProvider } from './context/FinancialContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { CarteiraView } from './components/CarteiraView';
import { MovimentacoesView } from './components/MovimentacoesView';
import { MetasView } from './components/MetasView';
import { PlanejamentoView } from './components/PlanejamentoView';
import { IaFinanceiraView } from './components/IaFinanceiraView';
import { CartoesView } from './components/CartoesView';
import { ConfiguracoesView } from './components/ConfiguracoesView';
import { RelatoriosView } from './components/RelatoriosView';
import { PatrimonioView } from './components/PatrimonioView';
import { AddTransactionModal } from './components/AddTransactionModal';
import { OnboardingView } from './components/OnboardingView';
import { AuthLayout } from './components/auth/AuthLayout';
import { UpdatePasswordModal } from './components/auth/UpdatePasswordModal';
import { useUserStore } from './store/userStore';

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);

  const {
    user,
    isAuthenticated,
    isLoadingAuth,
    initAuth,
    setAuthSession
  } = useUserStore();

  useEffect(() => {
    initAuth();

    // Check if coming back from password reset link
    if (window.location.hash.includes('type=recovery') || window.location.search.includes('type=recovery')) {
      setIsResetPasswordOpen(true);
    }
  }, [initAuth]);

  // Loading Session State
  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-[#165037] flex flex-col items-center justify-center text-white p-4 selection:bg-[#4CAF6A]">
        <div className="flex items-center gap-1.5 mb-6 animate-pulse">
          <span className="text-3xl sm:text-4xl font-black tracking-tight font-serif italic text-white">Grana</span>
          <span className="text-3xl sm:text-4xl font-black text-[#4CAF6A]">+</span>
        </div>
        <div className="w-8 h-8 border-3 border-emerald-500/20 border-t-[#4CAF6A] rounded-full animate-spin" />
        <p className="text-xs text-emerald-200/80 font-medium mt-4">Carregando autenticação...</p>
      </div>
    );
  }

  // 1. Unauthenticated Route Protection -> Show Login / Register / Forgot Password
  if (!isAuthenticated) {
    let initialScreen: 'login' | 'register' | 'forgot-password' = 'login';
    const path = window.location.pathname.toLowerCase();

    if (path.includes('/register') || path.includes('register')) {
      initialScreen = 'register';
    } else if (path.includes('/forgot') || path.includes('forgot')) {
      initialScreen = 'forgot-password';
    }

    return (
      <>
        <AuthLayout
          initialScreen={initialScreen}
          onAuthSuccess={(authUser, profile) => {
            // Updated session handled by Supabase subscription and setAuthSession
          }}
        />
        <UpdatePasswordModal
          isOpen={isResetPasswordOpen}
          onClose={() => setIsResetPasswordOpen(false)}
        />
      </>
    );
  }

  // 2. Authenticated but Onboarding Not Completed -> Show Onboarding
  if (!user.isOnboarded) {
    return (
      <FinancialProvider>
        <OnboardingView onComplete={() => {
          // Onboarding completes and sets isOnboarded = true in userStore
        }} />
        <UpdatePasswordModal
          isOpen={isResetPasswordOpen}
          onClose={() => setIsResetPasswordOpen(false)}
        />
      </FinancialProvider>
    );
  }

  // 3. Authenticated & Onboarded -> Show Main Financial App
  return (
    <FinancialProvider>
      <div className="min-h-screen bg-[#F6F8FA] text-slate-800 font-sans selection:bg-[#4CAF6A] selection:text-white antialiased">
        <div className="flex">
          {/* Sidebar */}
          <Sidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0 min-h-screen">
            {/* Header */}
            <Header toggleMobileSidebar={() => setIsSidebarOpen(prev => !prev)} />

            {/* Page View Container */}
            <main className="flex-1 px-4 lg:px-8 py-6 max-w-7xl w-full mx-auto">
              {activeTab === 'dashboard' && <DashboardView />}
              {activeTab === 'carteira' && <CarteiraView />}
              {(activeTab === 'movimentacoes' || activeTab === 'transactions') && <MovimentacoesView />}
              {activeTab === 'metas' && <MetasView />}
              {(activeTab === 'planejamento' || activeTab === 'planning') && <PlanejamentoView />}
              {(activeTab === 'ia-financeira' || activeTab === 'ia' || activeTab === 'insights') && <IaFinanceiraView />}
              {(activeTab === 'cartoes' || activeTab === 'cards') && <CartoesView />}
              {(activeTab === 'configuracoes' || activeTab === 'settings' || activeTab === 'config') && <ConfiguracoesView />}
              {(activeTab === 'relatorios' || activeTab === 'reports') && <RelatoriosView />}
              {(activeTab === 'patrimonio' || activeTab === 'wealth' || activeTab === 'assets') && <PatrimonioView />}
              {activeTab !== 'dashboard' && activeTab !== 'carteira' && activeTab !== 'transactions' && activeTab !== 'movimentacoes' && activeTab !== 'metas' && activeTab !== 'planejamento' && activeTab !== 'planning' && activeTab !== 'ia-financeira' && activeTab !== 'ia' && activeTab !== 'insights' && activeTab !== 'cartoes' && activeTab !== 'cards' && activeTab !== 'configuracoes' && activeTab !== 'settings' && activeTab !== 'config' && activeTab !== 'relatorios' && activeTab !== 'reports' && activeTab !== 'patrimonio' && activeTab !== 'wealth' && activeTab !== 'assets' && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center my-12">
                  <h3 className="text-lg font-bold text-white mb-2">Módulo: {activeTab.toUpperCase()}</h3>
                  <p className="text-sm text-slate-400">
                    O módulo selecionado está configurado e pronto para os próximos passos de desenvolvimento do produto Grana+.
                  </p>
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className="mt-4 bg-emerald-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs hover:bg-emerald-400 transition-colors cursor-pointer"
                  >
                    Voltar para a Visão Geral
                  </button>
                </div>
              )}
            </main>
          </div>
        </div>

        {/* Modal for adding transactions */}
        <AddTransactionModal />

        {/* Modal for password reset if coming from token link */}
        <UpdatePasswordModal
          isOpen={isResetPasswordOpen}
          onClose={() => setIsResetPasswordOpen(false)}
        />
      </div>
    </FinancialProvider>
  );
}
