import React, { useState } from 'react';
import { LoginView } from './LoginView';
import { RegisterView } from './RegisterView';
import { ForgotPasswordView } from './ForgotPasswordView';
import { UserProfileData } from '../../services/auth/auth.types';
import { ShieldCheck, TrendingUp, Wallet, Sparkles, Menu, X, Check } from 'lucide-react';

interface AuthLayoutProps {
  initialScreen?: 'login' | 'register' | 'forgot-password';
  onAuthSuccess: (user: any, profile: UserProfileData | null) => void;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  initialScreen = 'login',
  onAuthSuccess
}) => {
  const [screen, setScreen] = useState<'login' | 'register' | 'forgot-password'>(initialScreen);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [infoModal, setInfoModal] = useState<'recursos' | 'precos' | 'sobre' | null>(null);

  return (
    <div className="min-h-screen w-full bg-white bg-[radial-gradient(80%_50%_at_50%_0%,rgba(30,107,75,0.06)_0%,rgba(255,255,255,0)_100%)] flex flex-col justify-between selection:bg-[#4CAF6A] selection:text-white relative font-sans antialiased text-slate-800">
      
      {/* Top Institutional Header */}
      <header className="w-full max-w-7xl mx-auto px-6 sm:px-8 py-5 flex items-center justify-between border-b border-slate-100/80 bg-white/80 backdrop-blur-md sticky top-0 z-40 transition-all duration-200">
        {/* Brand Logo */}
        <div 
          onClick={() => setScreen('login')}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-[#165037] flex items-center justify-center text-white font-black text-lg shadow-xs group-hover:scale-105 transition-all duration-200">
            G+
          </div>
          <div className="flex items-center">
            <span className="text-2xl font-black tracking-tight text-slate-900 font-serif italic">Grana</span>
            <span className="text-2xl font-black text-[#4CAF6A]">+</span>
          </div>
        </div>

        {/* Desktop Institutional Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-600">
          <button
            onClick={() => setInfoModal('recursos')}
            className="hover:text-[#1E6B4B] transition-colors duration-200 cursor-pointer"
          >
            Recursos
          </button>
          <button
            onClick={() => setInfoModal('precos')}
            className="hover:text-[#1E6B4B] transition-colors duration-200 cursor-pointer"
          >
            Preços
          </button>
          <button
            onClick={() => setInfoModal('sobre')}
            className="hover:text-[#1E6B4B] transition-colors duration-200 cursor-pointer"
          >
            Sobre
          </button>
        </nav>

        {/* Right Actions */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={() => setScreen('login')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer ${
              screen === 'login'
                ? 'text-[#1E6B4B] bg-emerald-50 border border-emerald-200/60'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100/60'
            }`}
          >
            Entrar
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          aria-label="Abrir menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 p-6 space-y-4 shadow-lg animate-fadeIn z-30">
          <div className="flex flex-col gap-3 text-sm font-semibold text-slate-700">
            <button
              onClick={() => { setInfoModal('recursos'); setMobileMenuOpen(false); }}
              className="text-left py-2 hover:text-[#1E6B4B] transition-colors"
            >
              Recursos
            </button>
            <button
              onClick={() => { setInfoModal('precos'); setMobileMenuOpen(false); }}
              className="text-left py-2 hover:text-[#1E6B4B] transition-colors"
            >
              Preços
            </button>
            <button
              onClick={() => { setInfoModal('sobre'); setMobileMenuOpen(false); }}
              className="text-left py-2 hover:text-[#1E6B4B] transition-colors"
            >
              Sobre
            </button>
          </div>
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <button
              onClick={() => { setScreen('login'); setMobileMenuOpen(false); }}
              className="w-full py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Entrar
            </button>
          </div>
        </div>
      )}

      {/* Main Container Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10 my-auto">
        <div className="w-full max-w-5xl bg-white border border-slate-200/90 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.06)] overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[600px] transition-all duration-200">
          
          {/* Left Hero Side Banner - Forest Green (#165037) */}
          <div className="lg:col-span-5 bg-[#165037] text-white p-7 sm:p-8 flex flex-col justify-between relative overflow-hidden hidden md:flex">
            {/* Background Aesthetic Blur circles */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#23825C]/30 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-[#4CAF6A]/20 rounded-full blur-3xl pointer-events-none" />

            {/* HERO SECTION */}
            <div className="relative z-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-emerald-200 text-[11px] font-bold mb-4 backdrop-blur-xs">
                <Sparkles className="w-3.5 h-3.5 text-[#4CAF6A]" />
                <span>Gestão Financeira em Tempo Real</span>
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-[23px] font-black text-white leading-snug tracking-tight mb-3">
                Descubra quanto você pode gastar hoje sem comprometer seus objetivos.
              </h1>
              <p className="text-xs text-emerald-100/80 leading-relaxed font-normal">
                O Grana+ analisa sua vida financeira em tempo real e ajuda você a tomar decisões melhores todos os dias.
              </p>
            </div>

            {/* BENEFÍCIOS (Cards ~10% menores, altura reduzida, espaçamento levemente maior, hover ~4px) */}
            <div className="space-y-4 my-6 relative z-10">
              {/* Card 1 */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-[#113E2B]/90 border border-emerald-800/50 hover:-translate-y-1 transition-all duration-200 ease-out cursor-default shadow-xs hover:shadow-md hover:border-emerald-700/60 group">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0">
                  <Wallet className="w-4 h-4 text-[#4CAF6A]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white group-hover:text-emerald-200 transition-colors duration-200">Controle Unificado</p>
                  <p className="text-[10.5px] text-emerald-200/75 leading-tight">Gestão de todas as suas movimentações e carteiras.</p>
                </div>
              </div>

              {/* Card 2 */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-[#113E2B]/90 border border-emerald-800/50 hover:-translate-y-1 transition-all duration-200 ease-out cursor-default shadow-xs hover:shadow-md hover:border-emerald-700/60 group">
                <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-4 h-4 text-[#FF7034]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white group-hover:text-emerald-200 transition-colors duration-200">Relatórios & Metas</p>
                  <p className="text-[10.5px] text-emerald-200/75 leading-tight">Projeção de caixa e alcance de objetivos financeiros.</p>
                </div>
              </div>

              {/* Card 3 */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-[#113E2B]/90 border border-emerald-800/50 hover:-translate-y-1 transition-all duration-200 ease-out cursor-default shadow-xs hover:shadow-md hover:border-emerald-700/60 group">
                <div className="w-8 h-8 rounded-lg bg-emerald-400/20 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4 text-emerald-300" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white group-hover:text-emerald-200 transition-colors duration-200">Segurança de Nível Bancário</p>
                  <p className="text-[10.5px] text-emerald-200/75 leading-tight">Autenticação oficial com isolamento RLS por usuário.</p>
                </div>
              </div>
            </div>

            {/* Footer note */}
            <div className="relative z-10 text-[11px] text-emerald-200/60 font-medium">
              Grana+ &copy; 2026 • Plataforma de Gestão Financeira
            </div>
          </div>

          {/* Right Form Container Side (+15% visual area) */}
          <div className="lg:col-span-7 p-8 sm:p-12 lg:p-14 flex items-center justify-center bg-white">
            {screen === 'login' && (
              <LoginView
                onSuccess={onAuthSuccess}
                onNavigateRegister={() => setScreen('register')}
                onNavigateForgotPassword={() => setScreen('forgot-password')}
              />
            )}

            {screen === 'register' && (
              <RegisterView
                onSuccess={onAuthSuccess}
                onNavigateLogin={() => setScreen('login')}
              />
            )}

            {screen === 'forgot-password' && (
              <ForgotPasswordView
                onNavigateLogin={() => setScreen('login')}
              />
            )}
          </div>
        </div>
      </main>

      {/* Institutional Info Modals */}
      {infoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative">
            <button
              onClick={() => setInfoModal(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {infoModal === 'recursos' && (
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[#1E6B4B] text-xs font-bold mb-3">
                  <Sparkles className="w-3.5 h-3.5 text-[#4CAF6A]" />
                  <span>Recursos do Grana+</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Tudo que você precisa em um só lugar</h3>
                <p className="text-xs text-slate-500 mb-6">
                  Descubra os módulos completos desenvolvidos para dar clareza às suas finanças pessoais.
                </p>
                <div className="space-y-3 text-xs text-slate-700">
                  <div className="p-3 bg-slate-50 rounded-xl flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-[#4CAF6A] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-slate-900">Análise de Gastos em Tempo Real</p>
                      <p className="text-slate-500">Saiba exatamente quanto pode gastar no dia a dia sem sair do orçamento.</p>
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-[#4CAF6A] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-slate-900">Controle de Cartões e Metas</p>
                      <p className="text-slate-500">Acompanhe faturas, limites, datas de vencimento e objetivos futuros.</p>
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-[#4CAF6A] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-slate-900">Assistente com Inteligência Financeira</p>
                      <p className="text-slate-500">Insights automáticos para otimizar suas economias e investimentos.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {infoModal === 'precos' && (
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[#1E6B4B] text-xs font-bold mb-3">
                  <Sparkles className="w-3.5 h-3.5 text-[#4CAF6A]" />
                  <span>Planos Transparentes</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Comece 100% Grátis</h3>
                <p className="text-xs text-slate-500 mb-6">
                  Crie sua conta sem cartão de crédito e tenha acesso imediato a todas as ferramentas essenciais.
                </p>
                <div className="p-4 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl text-center">
                  <p className="text-2xl font-black text-[#1E6B4B]">R$ 0 <span className="text-xs font-medium text-slate-500">/mês</span></p>
                  <p className="text-xs text-slate-600 font-semibold mt-1">Plano Grana+ Starter</p>
                  <p className="text-[11px] text-slate-500 mt-2">Inclui lançamentos ilimitados, relatórios gráficos e assistente financeiro.</p>
                  <button
                    onClick={() => { setInfoModal(null); setScreen('register'); }}
                    className="mt-4 w-full py-2.5 bg-[#1E6B4B] hover:bg-[#165037] text-white text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer shadow-sm"
                  >
                    Criar Conta Gratuita Agora
                  </button>
                </div>
              </div>
            )}

            {infoModal === 'sobre' && (
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[#1E6B4B] text-xs font-bold mb-3">
                  <Sparkles className="w-3.5 h-3.5 text-[#4CAF6A]" />
                  <span>Sobre o Grana+</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Engenharia Financeira de Alto Nível</h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  O Grana+ nasceu para transformar a relação das pessoas com o dinheiro, unindo design de ponta, segurança bancária e tecnologia inteligente em uma única plataforma intuitiva.
                </p>
                <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 space-y-1">
                  <p>✔ Criptografia end-to-end</p>
                  <p>✔ Isolamento RLS por usuário via Supabase PostgreSQL</p>
                  <p>✔ Interface otimizada para Desktop e Mobile</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer copyright */}
      <footer className="py-4 text-center text-xs text-slate-400 font-normal">
        Grana+ Tecnologia Financeira &copy; 2026 • Todos os direitos reservados
      </footer>
    </div>
  );
};

