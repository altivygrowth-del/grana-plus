import React, { useState } from 'react';
import { useUserStore } from '../store/userStore';
import { 
  Wallet, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  CreditCard, 
  Plus, 
  Building2, 
  Car, 
  Home, 
  Plane, 
  TrendingUp, 
  FileText,
  ShieldCheck,
  Check
} from 'lucide-react';

interface OnboardingViewProps {
  onComplete: () => void;
}

interface FinancialGoalOption {
  id: string;
  label: string;
  icon: string;
}

const GOAL_OPTIONS: FinancialGoalOption[] = [
  { id: 'emergency', label: 'Reserva de Emergência', icon: '🏦' },
  { id: 'car', label: 'Comprar um Carro', icon: '🚗' },
  { id: 'house', label: 'Comprar uma Casa', icon: '🏠' },
  { id: 'travel', label: 'Viajar', icon: '✈️' },
  { id: 'invest', label: 'Investir Melhor', icon: '📈' },
  { id: 'other', label: 'Outro Objetivo', icon: '📝' },
];

export const OnboardingView: React.FC<OnboardingViewProps> = ({ onComplete }) => {
  const [step, setStep] = useState<number>(1);

  // Form states
  const [monthlyIncome, setMonthlyIncome] = useState<string>('');
  const [currentBalance, setCurrentBalance] = useState<string>('');
  const [selectedGoal, setSelectedGoal] = useState<string>('emergency');
  const [usesCreditCard, setUsesCreditCard] = useState<boolean | null>(null);
  const [addedCards, setAddedCards] = useState<string[]>([]);
  const [newCardName, setNewCardName] = useState<string>('');
  const [isAddingCardInput, setIsAddingCardInput] = useState<boolean>(false);

  // Currency Formatter helper for input
  const formatCurrencyInput = (value: string) => {
    // Remove all non-digits
    const cleanValue = value.replace(/\D/g, '');
    if (!cleanValue) return '';
    
    const numberValue = parseFloat(cleanValue) / 100;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(numberValue);
  };

  const handleIncomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrencyInput(e.target.value);
    setMonthlyIncome(formatted);
  };

  const handleBalanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrencyInput(e.target.value);
    setCurrentBalance(formatted);
  };

  const handleAddCard = () => {
    if (newCardName.trim()) {
      setAddedCards(prev => [...prev, newCardName.trim()]);
      setNewCardName('');
      setIsAddingCardInput(false);
    } else {
      setAddedCards(prev => [...prev, 'Nubank']);
    }
  };

  const setOnboardingData = useUserStore((state) => state.setOnboardingData);

  const parseCurrencyValue = (val: string): number => {
    if (!val) return 0;
    const clean = val.replace(/[^\d,]/g, '').replace(',', '.');
    const parsed = parseFloat(clean);
    return isNaN(parsed) ? 0 : parsed;
  };

  const handleNext = () => {
    if (step < 6) {
      setStep(prev => prev + 1);
    } else {
      const incomeNum = parseCurrencyValue(monthlyIncome) || 5000;
      const balanceNum = parseCurrencyValue(currentBalance) || 8500;

      setOnboardingData({
        monthlyIncome: incomeNum,
        currentBalance: balanceNum,
        financialGoal: selectedGoal,
        hasCreditCard: usesCreditCard === true,
        cardNames: addedCards
      });

      onComplete();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(prev => prev - 1);
    }
  };

  // Progress percentage
  const progressPercentage = Math.round((step / 6) * 100);

  return (
    <div className="min-h-screen bg-[#F6F8FA] flex flex-col justify-between py-8 px-4 font-sans selection:bg-[#4CAF6A] selection:text-white">
      {/* Header with Brand */}
      <header className="max-w-[520px] w-full mx-auto flex flex-col items-center justify-center pt-2 pb-6">
        <div className="flex items-center justify-center gap-2.5 mb-6">
          <div className="w-11 h-11 rounded-2xl bg-[#1E6B4B] text-white flex items-center justify-center shadow-md shadow-emerald-950/10">
            <Wallet className="w-6 h-6 stroke-[2.2]" />
          </div>
          <span className="text-2xl font-black text-slate-900 tracking-tight">
            Grana<span className="text-[#4CAF6A]">+</span>
          </span>
        </div>

        {/* Progress bar container */}
        <div className="w-full space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>Passo {step} de 6</span>
            <span>{progressPercentage}% concluído</span>
          </div>
          <div className="w-full bg-slate-200/70 h-2 rounded-full overflow-hidden p-0.5">
            <div 
              className="bg-gradient-to-r from-[#1E6B4B] to-[#4CAF6A] h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </header>

      {/* Main Form Card */}
      <main className="max-w-[520px] w-full mx-auto bg-white rounded-[32px] p-6 sm:p-8 lg:p-10 shadow-[0_16px_40px_rgba(0,0,0,0.03)] border border-slate-100/90 relative my-auto animate-fade-in-up">
        {/* TELA 1: BOAS-VINDAS */}
        {step === 1 && (
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-[#EAF5EE] text-[#1E6B4B] flex items-center justify-center shadow-xs border border-emerald-100/80">
              <Sparkles className="w-8 h-8 stroke-[2]" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Bem-vindo ao Grana+ 👋
              </h1>
              <p className="text-sm sm:text-base text-slate-500 leading-relaxed max-w-sm mx-auto font-normal">
                Vamos configurar sua conta. Isso leva menos de 2 minutos.
              </p>
            </div>

            <button
              onClick={handleNext}
              className="w-full mt-4 bg-[#1E6B4B] hover:bg-[#165037] text-white font-bold py-4 px-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 text-base group"
            >
              <span>Começar</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        )}

        {/* TELA 2: QUANTO VOCÊ RECEBE POR MÊS? */}
        {step === 2 && (
          <div className="flex flex-col space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Quanto você recebe por mês?
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed">
                Utilizamos essa informação para calcular seu planejamento financeiro.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Renda Mensal
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={monthlyIncome}
                  onChange={handleIncomeChange}
                  placeholder="Ex.: R$ 5.000,00"
                  className="w-full px-5 py-4 rounded-2xl border border-slate-200 text-slate-900 font-bold text-xl sm:text-2xl focus:border-[#4CAF6A] focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all placeholder:text-slate-300 placeholder:font-normal"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4">
              <button
                type="button"
                onClick={handleBack}
                className="w-1/3 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold py-3.5 px-4 rounded-2xl transition-all cursor-pointer text-sm flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar</span>
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="w-2/3 bg-[#1E6B4B] hover:bg-[#165037] text-white font-bold py-3.5 px-6 rounded-2xl shadow-sm hover:shadow transition-all cursor-pointer text-sm flex items-center justify-center gap-2 group"
              >
                <span>Continuar</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        )}

        {/* TELA 3: QUANTO VOCÊ POSSUI HOJE? */}
        {step === 3 && (
          <div className="flex flex-col space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Quanto você possui hoje?
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed">
                Considere todo o dinheiro disponível em suas contas.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Saldo disponível
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={currentBalance}
                  onChange={handleBalanceChange}
                  placeholder="Ex.: R$ 8.500,00"
                  className="w-full px-5 py-4 rounded-2xl border border-slate-200 text-slate-900 font-bold text-xl sm:text-2xl focus:border-[#4CAF6A] focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all placeholder:text-slate-300 placeholder:font-normal"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4">
              <button
                type="button"
                onClick={handleBack}
                className="w-1/3 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold py-3.5 px-4 rounded-2xl transition-all cursor-pointer text-sm flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar</span>
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="w-2/3 bg-[#1E6B4B] hover:bg-[#165037] text-white font-bold py-3.5 px-6 rounded-2xl shadow-sm hover:shadow transition-all cursor-pointer text-sm flex items-center justify-center gap-2 group"
              >
                <span>Continuar</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        )}

        {/* TELA 4: QUAL É SEU PRINCIPAL OBJETIVO FINANCEIRO? */}
        {step === 4 && (
          <div className="flex flex-col space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Qual é seu principal objetivo financeiro?
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed">
                Apenas uma opção pode ficar selecionada.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {GOAL_OPTIONS.map((option) => {
                const isSelected = selectedGoal === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setSelectedGoal(option.id)}
                    className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all text-left cursor-pointer ${
                      isSelected
                        ? 'border-[#4CAF6A] bg-emerald-50/70 ring-2 ring-[#4CAF6A]/20 shadow-2xs'
                        : 'border-slate-200/80 bg-white hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-2xl shrink-0">{option.icon}</span>
                    <span className={`text-xs sm:text-sm font-semibold flex-1 ${isSelected ? 'text-emerald-950 font-bold' : 'text-slate-800'}`}>
                      {option.label}
                    </span>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-[#4CAF6A] shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-3 pt-3">
              <button
                type="button"
                onClick={handleBack}
                className="w-1/3 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold py-3.5 px-4 rounded-2xl transition-all cursor-pointer text-sm flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar</span>
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="w-2/3 bg-[#1E6B4B] hover:bg-[#165037] text-white font-bold py-3.5 px-6 rounded-2xl shadow-sm hover:shadow transition-all cursor-pointer text-sm flex items-center justify-center gap-2 group"
              >
                <span>Continuar</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        )}

        {/* TELA 5: VOCÊ UTILIZA CARTÕES DE CRÉDITO? */}
        {step === 5 && (
          <div className="flex flex-col space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Você utiliza cartões de crédito?
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed">
                Isso ajuda a planejar melhor seu limite e próximos vencimentos.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setUsesCreditCard(false)}
                className={`py-4 px-4 rounded-2xl border text-center font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                  usesCreditCard === false
                    ? 'border-[#4CAF6A] bg-emerald-50/80 text-emerald-950 ring-2 ring-[#4CAF6A]/20 shadow-2xs'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                Não utilizo
              </button>
              <button
                type="button"
                onClick={() => {
                  setUsesCreditCard(true);
                  if (addedCards.length === 0) {
                    setAddedCards(['Nubank']);
                  }
                }}
                className={`py-4 px-4 rounded-2xl border text-center font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                  usesCreditCard === true
                    ? 'border-[#4CAF6A] bg-emerald-50/80 text-emerald-950 ring-2 ring-[#4CAF6A]/20 shadow-2xs'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                Sim, utilizo
              </button>
            </div>

            {/* If Sim, show button "+ Adicionar cartão" */}
            {usesCreditCard === true && (
              <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 animate-fade-in-up">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Meus Cartões
                  </span>
                  <span className="text-xs text-slate-400">
                    {addedCards.length} adicionado(s)
                  </span>
                </div>

                {addedCards.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {addedCards.map((card, idx) => (
                      <div 
                        key={idx}
                        className="inline-flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 shadow-2xs"
                      >
                        <CreditCard className="w-3.5 h-3.5 text-[#8A05BE]" />
                        <span>{card}</span>
                      </div>
                    ))}
                  </div>
                )}

                {isAddingCardInput ? (
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      value={newCardName}
                      onChange={(e) => setNewCardName(e.target.value)}
                      placeholder="Nome do banco / cartão (Ex: Inter)"
                      className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium outline-none focus:border-[#4CAF6A]"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={handleAddCard}
                      className="bg-[#1E6B4B] text-white px-3 py-2 rounded-xl text-xs font-bold hover:bg-[#165037] cursor-pointer"
                    >
                      Adicionar
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsAddingCardInput(true)}
                    className="w-full py-2.5 px-4 rounded-xl border border-dashed border-emerald-300 text-[#1E6B4B] hover:bg-emerald-50/50 font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Adicionar cartão</span>
                  </button>
                )}
              </div>
            )}

            <div className="flex items-center gap-3 pt-3">
              <button
                type="button"
                onClick={handleBack}
                className="w-1/3 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold py-3.5 px-4 rounded-2xl transition-all cursor-pointer text-sm flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar</span>
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="w-2/3 bg-[#1E6B4B] hover:bg-[#165037] text-white font-bold py-3.5 px-6 rounded-2xl shadow-sm hover:shadow transition-all cursor-pointer text-sm flex items-center justify-center gap-2 group"
              >
                <span>Continuar</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        )}

        {/* TELA 6: TUDO PRONTO! 🎉 */}
        {step === 6 && (
          <div className="flex flex-col items-center text-center space-y-6">
            {/* Animated glowing success badge */}
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-[#EAF5EE] text-[#1E6B4B] flex items-center justify-center shadow-md border border-emerald-200/80">
                <CheckCircle2 className="w-10 h-10 stroke-[2.2] text-[#4CAF6A]" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#4CAF6A] text-white flex items-center justify-center text-xs font-bold animate-bounce shadow-xs">
                ✨
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Tudo pronto! 🎉
              </h2>
              <h3 className="text-lg font-bold text-slate-800">
                Seu Grana+ está preparado.
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed max-w-sm mx-auto">
                Agora você já pode acessar seu painel financeiro.
              </p>
            </div>

            {/* Quick Summary Pill preview */}
            <div className="w-full bg-slate-50 rounded-2xl p-4 border border-slate-100 text-left space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Resumo da Configuração
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                  <span className="text-slate-400 text-[11px] block">Renda Mês</span>
                  <span className="font-bold text-slate-900">{monthlyIncome || 'R$ 5.000,00'}</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                  <span className="text-slate-400 text-[11px] block">Saldo Atual</span>
                  <span className="font-bold text-slate-900">{currentBalance || 'R$ 8.500,00'}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleNext}
              className="w-full bg-[#1E6B4B] hover:bg-[#165037] text-white font-bold py-4 px-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 text-base group"
            >
              <span>Entrar no Dashboard</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-4">
        <p className="text-xs text-slate-400">
          Grana+ • Inteligência Financeira Descomplicada
        </p>
      </footer>
    </div>
  );
};
