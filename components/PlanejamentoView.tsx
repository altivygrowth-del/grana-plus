import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useUserStore } from '../store/userStore';
import { formatCurrency } from '../lib/formatters';
import { 
  Compass, 
  Target, 
  PiggyBank, 
  Calendar, 
  TrendingUp, 
  Sparkles, 
  Lightbulb, 
  Clock, 
  Sliders, 
  CheckCircle2, 
  ArrowRight,
  Plane,
  Shield,
  Car,
  Home,
  GraduationCap,
  Heart,
  Palmtree,
  Gift,
  AlertCircle
} from 'lucide-react';

const MONTH_NAMES_PT = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export const getGoalIcon = (iconName?: string) => {
  switch (iconName) {
    case 'Plane': return Plane;
    case 'Shield': return Shield;
    case 'Car': return Car;
    case 'Home': return Home;
    case 'GraduationCap': return GraduationCap;
    case 'Heart': return Heart;
    case 'Palmtree': return Palmtree;
    case 'Gift': return Gift;
    default: return Target;
  }
};

function getMonthsUntil(deadlineStr?: string): number {
  if (!deadlineStr || deadlineStr.toLowerCase() === 'a definir') {
    return 12; // default 12 months horizon
  }

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const str = deadlineStr.trim().toLowerCase();

  // MM/YYYY
  const slashMatch = str.match(/(\d{1,2})\/(\d{4})/);
  if (slashMatch) {
    const targetMonth = parseInt(slashMatch[1], 10) - 1;
    const targetYear = parseInt(slashMatch[2], 10);
    const months = (targetYear - currentYear) * 12 + (targetMonth - currentMonth);
    return months > 0 ? months : 1;
  }

  // Month name + year
  let targetMonth = currentMonth;
  let targetYear = currentYear;

  for (let i = 0; i < MONTH_NAMES_PT.length; i++) {
    if (str.includes(MONTH_NAMES_PT[i].toLowerCase())) {
      targetMonth = i;
      break;
    }
  }

  const yearMatch = str.match(/\d{4}/);
  if (yearMatch) {
    targetYear = parseInt(yearMatch[0], 10);
  }

  const months = (targetYear - currentYear) * 12 + (targetMonth - currentMonth);
  return months > 0 ? months : 1;
}

function formatFutureDate(monthsFromNow: number): string {
  if (!isFinite(monthsFromNow) || monthsFromNow <= 0) return 'Concluído!';
  const now = new Date();
  const futureDate = new Date(now.getFullYear(), now.getMonth() + Math.round(monthsFromNow), 1);
  const mName = MONTH_NAMES_PT[futureDate.getMonth()];
  const yName = futureDate.getFullYear();
  return `${mName} de ${yName}`;
}

export const PlanejamentoView: React.FC = () => {
  const { t } = useTranslation('planning');
  const goals = useUserStore((state) => state.goals);

  // Calculate base planning stats for all goals
  const calculatedPlans = useMemo(() => {
    return goals.map((goal) => {
      const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
      const monthsLeft = getMonthsUntil(goal.deadline);
      const monthlyNeeded = remaining > 0 ? remaining / monthsLeft : 0;
      const progressPct = goal.targetAmount > 0 
        ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100))
        : 0;

      return {
        ...goal,
        remaining,
        monthsLeft,
        monthlyNeeded,
        progressPct,
        isCompleted: progressPct >= 100
      };
    });
  }, [goals]);

  // Overall Base Summary Totals
  const totalTarget = useMemo(() => goals.reduce((acc, g) => acc + g.targetAmount, 0), [goals]);
  const totalAccumulated = useMemo(() => goals.reduce((acc, g) => acc + g.currentAmount, 0), [goals]);
  const totalRemaining = Math.max(0, totalTarget - totalAccumulated);
  
  const totalMonthlyNeeded = useMemo(() => {
    return calculatedPlans.reduce((acc, p) => acc + p.monthlyNeeded, 0);
  }, [calculatedPlans]);

  const overallProgressPct = totalTarget > 0 
    ? Math.min(100, Math.round((totalAccumulated / totalTarget) * 100))
    : 0;

  // Max months left among active goals
  const maxMonthsLeft = useMemo(() => {
    const activePlans = calculatedPlans.filter(p => !p.isCompleted);
    if (activePlans.length === 0) return 0;
    return Math.max(...activePlans.map(p => p.monthsLeft));
  }, [calculatedPlans]);

  const baseCompletionDate = formatFutureDate(maxMonthsLeft);

  // Simulation State: "Quanto consigo guardar por mês?"
  const [simulatedMonthlyInput, setSimulatedMonthlyInput] = useState<string>('');

  // Default simulated value if user hasn't typed anything
  const simulatedMonthlyVal = useMemo(() => {
    if (simulatedMonthlyInput !== '') {
      const parsed = parseFloat(simulatedMonthlyInput.replace(',', '.'));
      return isNaN(parsed) || parsed < 0 ? 0 : parsed;
    }
    return Math.round(totalMonthlyNeeded || 1000);
  }, [simulatedMonthlyInput, totalMonthlyNeeded]);

  // Calculations derived from simulation
  const simulatedMonthsNeeded = useMemo(() => {
    if (totalRemaining <= 0) return 0;
    if (simulatedMonthlyVal <= 0) return 999;
    return totalRemaining / simulatedMonthlyVal;
  }, [totalRemaining, simulatedMonthlyVal]);

  const simulatedCompletionDate = useMemo(() => {
    if (totalRemaining <= 0) return 'Concluído!';
    if (simulatedMonthlyVal <= 0) return 'Tempo indeterminado';
    return formatFutureDate(simulatedMonthsNeeded);
  }, [totalRemaining, simulatedMonthlyVal, simulatedMonthsNeeded]);

  // Diff in months between simulation and base plan
  const baseMonthsNeeded = maxMonthsLeft > 0 ? maxMonthsLeft : 1;
  const monthDifference = Math.round(baseMonthsNeeded - simulatedMonthsNeeded);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in-up pb-24 relative">
      
      {/* 1. CARD SUPERIOR */}
      <div className="bg-white rounded-[28px] p-6 lg:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-slate-100/90 transition-all duration-300 hover:shadow-[0_14px_36px_rgba(0,0,0,0.05)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                {t('strategy', 'ESTRATÉGIA FINANCEIRA')}
              </span>
              <span className="inline-flex items-center gap-1 bg-emerald-50 text-[#1E6B4B] text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-100">
                <Compass className="w-3 h-3 text-[#4CAF6A]" />
                {t('actionPlan', 'Plano de Ação')}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {t('title', 'Planejamento Financeiro')}
            </h1>
            <p className="text-xs sm:text-sm font-normal text-slate-500 mt-0.5">
              {t('subtitle', 'Seu plano para alcançar seus objetivos.')}
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-3">
            <div className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                {t('overallProgress', 'Progresso Geral')}
              </span>
              <span className="text-sm font-extrabold text-[#1E6B4B]">
                {overallProgressPct}% {t('ofWay', 'do caminho')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. RESUMO (4 INDICADORES CALCULADOS AUTOMATICAMENTE) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        
        {/* Economia mensal necessária */}
        <div className="bg-white rounded-[24px] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-slate-100/90 transition-all duration-300 hover:shadow-[0_14px_36px_rgba(0,0,0,0.05)]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Economia Mensal Necessária
            </span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-[#1E6B4B] flex items-center justify-center border border-emerald-100">
              <TrendingUp className="w-5 h-5 stroke-[2]" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {formatCurrency(totalMonthlyNeeded)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Valor necessário por mês
          </p>
        </div>

        {/* Tempo restante */}
        <div className="bg-white rounded-[24px] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-slate-100/90 transition-all duration-300 hover:shadow-[0_14px_36px_rgba(0,0,0,0.05)]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Tempo Restante
            </span>
            <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <Clock className="w-5 h-5 stroke-[2]" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {maxMonthsLeft > 0 ? `${maxMonthsLeft} ${maxMonthsLeft === 1 ? 'mês' : 'meses'}` : 'Concluído'}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Para atingir todos os objetivos
          </p>
        </div>

        {/* Valor já acumulado */}
        <div className="bg-white rounded-[24px] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-slate-100/90 transition-all duration-300 hover:shadow-[0_14px_36px_rgba(0,0,0,0.05)]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Valor Já Acumulado
            </span>
            <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <PiggyBank className="w-5 h-5 stroke-[2]" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#1E6B4B] tracking-tight">
            {formatCurrency(totalAccumulated)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Guardados em metas ativas
          </p>
        </div>

        {/* Previsão de conclusão */}
        <div className="bg-white rounded-[24px] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-slate-100/90 transition-all duration-300 hover:shadow-[0_14px_36px_rgba(0,0,0,0.05)]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Previsão de Conclusão
            </span>
            <div className="w-9 h-9 rounded-2xl bg-purple-50 text-[#8A05BE] flex items-center justify-center border border-purple-100">
              <Calendar className="w-5 h-5 stroke-[2]" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight capitalize truncate">
            {baseCompletionDate}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Prazo projetado no plano atual
          </p>
        </div>

      </div>

      {/* INSIGHTS BANNER */}
      <div className="bg-gradient-to-r from-emerald-900 to-[#165037] rounded-[28px] p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-6">
          <Sparkles className="w-48 h-48 text-white" />
        </div>
        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-400/20 text-emerald-300 text-[10px] font-bold px-3 py-1 rounded-full border border-emerald-400/30 uppercase tracking-wider flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-300" />
              Insights do Seu Planejamento
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-emerald-200 uppercase tracking-wider">Progresso Atual</h4>
                <p className="text-sm font-medium text-white/90 mt-0.5">
                  Você já completou <span className="font-extrabold text-emerald-300">{overallProgressPct}%</span> do caminho total dos seus objetivos ({formatCurrency(totalAccumulated)} de {formatCurrency(totalTarget)}).
                </p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-amber-200 uppercase tracking-wider">Otimização de Tempo</h4>
                <p className="text-sm font-medium text-white/90 mt-0.5">
                  {simulatedMonthlyVal > totalMonthlyNeeded ? (
                    <>
                      Se guardar <span className="font-extrabold text-amber-300">{formatCurrency(simulatedMonthlyVal - totalMonthlyNeeded)}</span> a mais por mês, você alcançará suas metas <span className="font-extrabold text-amber-300">{Math.max(1, monthDifference)} {Math.max(1, monthDifference) === 1 ? 'mês' : 'meses'} antes</span>.
                    </>
                  ) : (
                    <>
                      Economizando <span className="font-extrabold text-emerald-300">{formatCurrency(totalMonthlyNeeded)}</span>/mês, você atinge 100% de todas as metas até <span className="font-extrabold text-emerald-300">{baseCompletionDate}</span>.
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. SIMULAÇÃO */}
      <div className="bg-white rounded-[28px] p-6 lg:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-slate-100/90 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-[#1E6B4B]" />
              <h2 className="text-lg font-bold text-slate-900">
                Simulador de Aporte Mensal
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Ajuste o valor mensal e veja o impacto no tempo restante e na data de conclusão sem alterar seus dados reais.
            </p>
          </div>

          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl px-3.5 py-1.5 text-xs font-semibold text-[#1E6B4B] inline-flex items-center gap-1.5 self-start sm:self-auto">
            <Sparkles className="w-3.5 h-3.5 text-[#4CAF6A]" />
            <span>Simulação em tempo real</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* Unico Campo Editavel */}
          <div className="lg:col-span-5 bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-2">
            <label className="text-xs font-extrabold text-slate-700 block uppercase tracking-wider">
              Quanto consigo guardar por mês? (R$)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-extrabold text-slate-400 text-base">
                R$
              </span>
              <input
                type="number"
                step="50"
                min="0"
                placeholder={totalMonthlyNeeded.toString()}
                value={simulatedMonthlyInput}
                onChange={(e) => setSimulatedMonthlyInput(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-2xl pl-12 pr-4 py-3 text-lg font-extrabold text-slate-900 focus:border-[#1E6B4B] focus:ring-2 focus:ring-[#1E6B4B]/20 outline-none transition-all shadow-xs"
              />
            </div>
            <div className="flex justify-between items-center text-[11px] text-slate-400 pt-1">
              <span>Recomendado: {formatCurrency(totalMonthlyNeeded)}/mês</span>
              <button
                onClick={() => setSimulatedMonthlyInput(Math.round(totalMonthlyNeeded).toString())}
                className="text-[#1E6B4B] font-bold hover:underline cursor-pointer"
              >
                Usar sugerido
              </button>
            </div>
          </div>

          {/* Resultado da Simulação */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Novo Tempo Restante */}
            <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-5 flex flex-col justify-between">
              <span className="text-xs font-bold text-[#1E6B4B] uppercase tracking-wider">
                Novo Tempo Restante
              </span>
              <div className="my-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {simulatedMonthsNeeded > 0 && isFinite(simulatedMonthsNeeded)
                    ? `${Math.ceil(simulatedMonthsNeeded)} ${Math.ceil(simulatedMonthsNeeded) === 1 ? 'mês' : 'meses'}`
                    : '0 meses'}
                </span>
              </div>
              <span className="text-[11px] text-slate-500">
                {monthDifference > 0 
                  ? `⚡ ${monthDifference} ${monthDifference === 1 ? 'mês' : 'meses'} mais rápido que o plano base`
                  : monthDifference < 0 
                    ? `⏱️ ${Math.abs(monthDifference)} ${Math.abs(monthDifference) === 1 ? 'mês' : 'meses'} a mais no prazo`
                    : 'Mantém o prazo atual'}
              </span>
            </div>

            {/* Nova Previsão de Conclusão */}
            <div className="bg-purple-50/50 border border-purple-100 rounded-2xl p-5 flex flex-col justify-between">
              <span className="text-xs font-bold text-[#8A05BE] uppercase tracking-wider">
                Nova Previsão de Conclusão
              </span>
              <div className="my-2">
                <span className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight capitalize">
                  {simulatedCompletionDate}
                </span>
              </div>
              <span className="text-[11px] text-slate-500">
                Calculado com base no novo valor mensal
              </span>
            </div>

          </div>

        </div>
      </div>

      {/* 3. LISTA DE PLANEJAMENTOS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-base font-semibold text-slate-900">
            Planos por Meta
          </h2>
          <span className="text-xs font-normal text-slate-400">
            {calculatedPlans.length} {calculatedPlans.length === 1 ? 'plano ativo' : 'planos ativos'}
          </span>
        </div>

        {calculatedPlans.length === 0 ? (
          <div className="bg-white rounded-[28px] p-12 text-center border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.02)]">
            <Target className="w-12 h-12 text-slate-300 mx-auto mb-3 stroke-[1.5]" />
            <h3 className="text-base font-bold text-slate-800">Nenhum planejamento disponível</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Cadastre metas na aba "Metas" para visualizar e acompanhar seus planos detalhados aqui.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {calculatedPlans.map((plan) => {
              const GoalIcon = getGoalIcon(plan.icon);
              const currentColor = plan.color || '#1E6B4B';

              return (
                <div
                  key={plan.id}
                  className="bg-white rounded-[28px] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-slate-100/90 flex flex-col justify-between transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_36px_rgba(0,0,0,0.05)] relative group"
                >
                  {/* Top Header */}
                  <div>
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 text-white shadow-2xs"
                          style={{ backgroundColor: currentColor }}
                        >
                          <GoalIcon className="w-5 h-5 stroke-[2]" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-slate-900 group-hover:text-[#1E6B4B] transition-colors">
                            {plan.title}
                          </h3>
                          <span className="text-[11px] text-slate-400 font-medium">
                            Prazo: {plan.deadline || 'A definir'}
                          </span>
                        </div>
                      </div>

                      {plan.isCompleted ? (
                        <span className="bg-emerald-50 text-[#1E6B4B] text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-100">
                          Concluído
                        </span>
                      ) : (
                        <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2.5 py-1 rounded-full">
                          Em andamento
                        </span>
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5 my-3">
                      <div className="flex justify-between items-center text-xs font-semibold">
                        <span className="text-slate-500">Evolução</span>
                        <span className="text-slate-900 font-bold">{plan.progressPct}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          style={{ width: `${plan.progressPct}%`, backgroundColor: currentColor }}
                          className="h-full rounded-full transition-all duration-700 ease-out"
                        />
                      </div>
                    </div>

                    {/* Meta Breakdown Grid */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                      <div className="bg-slate-50 rounded-xl p-2.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          VALOR OBJETIVO
                        </span>
                        <span className="font-bold text-slate-800">
                          {formatCurrency(plan.targetAmount)}
                        </span>
                      </div>

                      <div className="bg-slate-50 rounded-xl p-2.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          VALOR ATUAL
                        </span>
                        <span className="font-bold text-slate-800">
                          {formatCurrency(plan.currentAmount)}
                        </span>
                      </div>

                      <div className="bg-slate-50 rounded-xl p-2.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          VALOR RESTANTE
                        </span>
                        <span className="font-bold text-slate-800">
                          {formatCurrency(plan.remaining)}
                        </span>
                      </div>

                      <div className="bg-emerald-50/80 rounded-xl p-2.5 border border-emerald-100">
                        <span className="text-[10px] font-bold text-[#1E6B4B] uppercase tracking-wider block">
                          GUARDAR / MÊS
                        </span>
                        <span className="font-extrabold text-[#1E6B4B]">
                          {formatCurrency(plan.monthlyNeeded)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="pt-4 mt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100/60">
                    <span className="flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {plan.isCompleted ? 'Objetivo atingido!' : `${plan.monthsLeft} meses restantes`}
                    </span>
                    <span className="font-semibold text-slate-600">
                      Previsão: {plan.deadline}
                    </span>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
