import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useUserStore, FinancialGoalItem } from '../store/userStore';
import { formatCurrency } from '../lib/formatters';
import { GoalContributionModal } from './GoalContributionModal';
import { goalsService } from '../services/goals/goals.service';
import { GoalContributionItem } from '../services/goals/goals.types';
import { 
  Target, 
  CheckCircle2, 
  PiggyBank, 
  Compass, 
  Plus, 
  Edit3, 
  Trash2, 
  MoreVertical, 
  X, 
  Check, 
  Plane, 
  Shield, 
  Car, 
  Home, 
  GraduationCap, 
  Heart, 
  Palmtree, 
  Gift,
  Calendar,
  Sparkles,
  TrendingUp,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  History,
  Wallet
} from 'lucide-react';

export const GOAL_ICONS = [
  { id: 'Target', label: 'Objetivo Geral', icon: Target },
  { id: 'Plane', label: 'Viagem', icon: Plane },
  { id: 'Shield', label: 'Reserva', icon: Shield },
  { id: 'Car', label: 'Veículo', icon: Car },
  { id: 'Home', label: 'Casa', icon: Home },
  { id: 'GraduationCap', label: 'Estudo', icon: GraduationCap },
  { id: 'Heart', label: 'Saúde', icon: Heart },
  { id: 'Palmtree', label: 'Lazer', icon: Palmtree },
  { id: 'Gift', label: 'Presente', icon: Gift },
];

export const GOAL_COLORS = [
  { name: 'Verde Grana+', hex: '#1E6B4B', bg: 'bg-emerald-50 text-[#1E6B4B] border-emerald-100' },
  { name: 'Azul', hex: '#3B82F6', bg: 'bg-blue-50 text-blue-600 border-blue-100' },
  { name: 'Âmbar', hex: '#F59E0B', bg: 'bg-amber-50 text-amber-600 border-amber-100' },
  { name: 'Roxo', hex: '#8A05BE', bg: 'bg-purple-50 text-[#8A05BE] border-purple-100' },
  { name: 'Rosa', hex: '#EC4899', bg: 'bg-pink-50 text-pink-600 border-pink-100' },
];

export const getGoalIconComponent = (iconName?: string) => {
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

// Helper for date calculations
function calculateGoalMetrics(goal: FinancialGoalItem) {
  const current = goal.currentAmount || 0;
  const target = goal.targetAmount || 1;
  const percentage = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
  const remaining = Math.max(0, target - current);
  const isCompleted = current >= target;

  let daysRemaining: number | null = null;
  let monthsRemaining = 12;
  let statusText = 'No prazo';
  let statusBadgeClass = 'bg-emerald-50 text-[#1E6B4B] border-emerald-200';

  if (goal.deadline && goal.deadline !== 'A definir') {
    let targetDate: Date | null = null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(goal.deadline)) {
      targetDate = new Date(goal.deadline + 'T23:59:59');
    } else if (/^\d{2}\/\d{4}$/.test(goal.deadline)) {
      const [m, y] = goal.deadline.split('/');
      targetDate = new Date(parseInt(y), parseInt(m) - 1, 28);
    } else {
      const parsed = Date.parse(goal.deadline);
      if (!isNaN(parsed)) targetDate = new Date(parsed);
    }

    if (targetDate && !isNaN(targetDate.getTime())) {
      const diffTime = targetDate.getTime() - new Date().getTime();
      daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      monthsRemaining = Math.max(1, Math.ceil(daysRemaining / 30));
    }
  }

  // Automatic Status determination
  if (isCompleted) {
    statusText = 'Concluída';
    statusBadgeClass = 'bg-emerald-100 text-[#1E6B4B] border-emerald-300 font-extrabold';
  } else if (daysRemaining !== null && daysRemaining < 0) {
    statusText = 'Atrasada';
    statusBadgeClass = 'bg-rose-50 text-rose-700 border-rose-200';
  } else if (percentage >= 50 && (daysRemaining === null || daysRemaining > 60)) {
    statusText = 'Adiantada';
    statusBadgeClass = 'bg-blue-50 text-blue-700 border-blue-200';
  } else {
    statusText = 'No prazo';
    statusBadgeClass = 'bg-emerald-50 text-[#1E6B4B] border-emerald-200';
  }

  // Suggested monthly deposit
  const suggestedMonthly = remaining > 0 ? Math.ceil(remaining / Math.max(1, monthsRemaining)) : 0;

  // Pace / Forecast calculation
  let forecastText = '';
  if (isCompleted) {
    forecastText = 'Meta 100% atingida!';
  } else if (current === 0) {
    forecastText = 'Aguardando 1º aporte';
  } else {
    // Estimate pace based on average or current savings
    const estimatedPaceMonthly = Math.max(200, current / 2); // default smooth estimate
    const estMonths = Math.ceil(remaining / estimatedPaceMonthly);
    if (estMonths <= 1) {
      forecastText = 'Conclusão em ~1 mês no ritmo atual';
    } else if (estMonths < 12) {
      forecastText = `Conclusão em ~${estMonths} meses no ritmo atual`;
    } else {
      const estYears = (estMonths / 12).toFixed(1);
      forecastText = `Conclusão em ~${estYears} anos no ritmo atual`;
    }
  }

  return {
    percentage,
    remaining,
    isCompleted,
    daysRemaining,
    monthsRemaining,
    suggestedMonthly,
    statusText,
    statusBadgeClass,
    forecastText
  };
}

export const MetasView: React.FC = () => {
  const { t } = useTranslation('goals');
  const goals = useUserStore((state) => state.goals);
  const isLoadingGoals = useUserStore((state) => state.isLoadingGoals);
  const createGoal = useUserStore((state) => state.createGoal);
  const updateGoal = useUserStore((state) => state.updateGoal);
  const deleteGoal = useUserStore((state) => state.deleteGoal);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<FinancialGoalItem | null>(null);

  // Contribution Modal state
  const [isContributionModalOpen, setIsContributionModalOpen] = useState(false);
  const [selectedContributionGoal, setSelectedContributionGoal] = useState<FinancialGoalItem | null>(null);

  // History Drawer state per goal
  const [expandedHistoryGoalId, setExpandedHistoryGoalId] = useState<string | null>(null);
  const [goalContributionsHistory, setGoalContributionsHistory] = useState<Record<string, GoalContributionItem[]>>({});
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Active Menu Dropdown ID
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('Target');
  const [selectedColor, setSelectedColor] = useState('#1E6B4B');

  // Load history when expanding
  useEffect(() => {
    if (expandedHistoryGoalId) {
      setIsLoadingHistory(true);
      goalsService.getContributions(expandedHistoryGoalId).then(({ data }) => {
        setGoalContributionsHistory((prev) => ({
          ...prev,
          [expandedHistoryGoalId]: data || []
        }));
        setIsLoadingHistory(false);
      });
    }
  }, [expandedHistoryGoalId]);

  // Summary Calculations
  const totalGoalsCount = goals.length;
  const completedGoalsCount = goals.filter((g) => g.currentAmount >= g.targetAmount).length;
  const totalAccumulated = goals.reduce((sum, g) => sum + g.currentAmount, 0);

  // Find next goal closest to completion (< 100%)
  const activeGoals = goals.filter((g) => g.currentAmount < g.targetAmount);
  const sortedByClosest = [...activeGoals].sort((a, b) => {
    const pctA = a.targetAmount > 0 ? a.currentAmount / a.targetAmount : 0;
    const pctB = b.targetAmount > 0 ? b.currentAmount / b.targetAmount : 0;
    return pctB - pctA;
  });
  const nextGoal = sortedByClosest[0] || goals[0];

  // Open Modal for Create
  const handleOpenCreateModal = () => {
    setEditingGoal(null);
    setTitle('');
    setTargetAmount('');
    setCurrentAmount('0');
    setDeadline('');
    setSelectedIcon('Target');
    setSelectedColor('#1E6B4B');
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEditModal = (goal: FinancialGoalItem) => {
    setEditingGoal(goal);
    setTitle(goal.title);
    setTargetAmount(goal.targetAmount.toString());
    setCurrentAmount(goal.currentAmount.toString());
    setDeadline(goal.deadline || '');
    setSelectedIcon(goal.icon || 'Target');
    setSelectedColor(goal.color || '#1E6B4B');
    setActiveMenuId(null);
    setIsModalOpen(true);
  };

  // Open Contribution Modal
  const handleOpenContributionModal = (goal: FinancialGoalItem) => {
    setSelectedContributionGoal(goal);
    setIsContributionModalOpen(true);
  };

  // Handle Save (Create or Edit)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedTarget = parseFloat(targetAmount.replace(',', '.'));
    const parsedCurrent = parseFloat((currentAmount || '0').replace(',', '.'));

    if (!title.trim()) {
      alert('Por favor, informe o nome da meta.');
      return;
    }

    if (isNaN(parsedTarget) || parsedTarget <= 0) {
      alert('Por favor, informe um valor objetivo válido.');
      return;
    }

    if (editingGoal) {
      await updateGoal(editingGoal.id, {
        title: title.trim(),
        targetAmount: parsedTarget,
        currentAmount: isNaN(parsedCurrent) ? 0 : parsedCurrent,
        deadline: deadline.trim() || 'A definir',
        icon: selectedIcon,
        color: selectedColor
      });
    } else {
      await createGoal({
        title: title.trim(),
        targetAmount: parsedTarget,
        currentAmount: isNaN(parsedCurrent) ? 0 : parsedCurrent,
        deadline: deadline.trim() || 'A definir',
        icon: selectedIcon,
        color: selectedColor
      });
    }

    setIsModalOpen(false);
  };

  // Handle Delete
  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta meta?')) {
      await deleteGoal(id);
      setActiveMenuId(null);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in-up pb-24 relative">
      
      {/* 1. HEADER */}
      <div className="bg-white rounded-[28px] p-6 lg:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-slate-100/90 transition-all duration-300 hover:shadow-[0_14px_36px_rgba(0,0,0,0.05)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                {t('planningHeader', 'PLANEJAMENTO E OBJETIVOS')}
              </span>
              <span className="inline-flex items-center gap-1 bg-emerald-50 text-[#1E6B4B] text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-100">
                <Sparkles className="w-3 h-3 text-[#4CAF6A]" />
                {t('smartGoals', 'Inteligente')}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {t('title', 'Metas Financeiras')}
            </h1>
            <p className="text-xs sm:text-sm font-normal text-slate-500 mt-0.5">
              {t('subtitle', 'Acompanhe seus objetivos com cálculo de aportes, previsão e ritmo automático.')}
            </p>
          </div>

          <div>
            <button
              onClick={handleOpenCreateModal}
              className="w-full sm:w-auto bg-[#1E6B4B] hover:bg-[#165037] text-white font-bold py-3 px-5 rounded-2xl shadow-xs hover:shadow transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 text-xs sm:text-sm active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>+ {t('addGoal', 'Nova Meta')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. RESUMO (4 CARDS CALCULADOS AUTOMATICAMENTE) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        
        {/* Total de Metas */}
        <div className="bg-white rounded-[24px] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-slate-100/90">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total de Metas
            </span>
            <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <Target className="w-5 h-5 stroke-[2]" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {totalGoalsCount} {totalGoalsCount === 1 ? 'Meta' : 'Metas'}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Objetivos em acompanhamento
          </p>
        </div>

        {/* Metas Concluídas */}
        <div className="bg-white rounded-[24px] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-slate-100/90">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Metas Concluídas
            </span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-[#1E6B4B] flex items-center justify-center border border-emerald-100">
              <CheckCircle2 className="w-5 h-5 stroke-[2]" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 tracking-tight">
            {completedGoalsCount} de {totalGoalsCount}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Alcançados com sucesso
          </p>
        </div>

        {/* Valor Acumulado */}
        <div className="bg-white rounded-[24px] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-slate-100/90">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Valor Acumulado
            </span>
            <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <PiggyBank className="w-5 h-5 stroke-[2]" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {formatCurrency(totalAccumulated)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Soma guardada em todas as metas
          </p>
        </div>

        {/* Próxima Meta */}
        <div className="bg-white rounded-[24px] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-slate-100/90">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Próxima Meta
            </span>
            <div className="w-9 h-9 rounded-2xl bg-purple-50 text-[#8A05BE] flex items-center justify-center border border-purple-100">
              <Compass className="w-5 h-5 stroke-[2]" />
            </div>
          </div>
          {nextGoal ? (
            <div>
              <div className="text-lg font-bold text-slate-900 tracking-tight truncate">
                {nextGoal.title}
              </div>
              <p className="text-xs font-semibold text-[#1E6B4B] mt-0.5">
                {nextGoal.targetAmount > 0 
                  ? `${Math.min(100, Math.round((nextGoal.currentAmount / nextGoal.targetAmount) * 100))}% atingido`
                  : '0%'}
              </p>
            </div>
          ) : (
            <div className="text-sm font-semibold text-slate-400 mt-1">
              Nenhuma meta
            </div>
          )}
        </div>

      </div>

      {/* 3. LISTA DE METAS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-base font-semibold text-slate-900">
            Seus Objetivos
          </h2>
          <span className="text-xs font-normal text-slate-400">
            {goals.length} {goals.length === 1 ? 'meta cadastrada' : 'metas cadastradas'}
          </span>
        </div>

        {/* LOADING SKELETON */}
        {isLoadingGoals ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-[28px] p-6 border border-slate-100 space-y-4 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-slate-100 rounded-2xl"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-slate-100 rounded w-2/3"></div>
                    <div className="h-3 bg-slate-100 rounded w-1/3"></div>
                  </div>
                </div>
                <div className="h-3 bg-slate-100 rounded-full w-full"></div>
                <div className="h-10 bg-slate-100 rounded-2xl w-full"></div>
              </div>
            ))}
          </div>
        ) : goals.length === 0 ? (
          /* EMPTY STATE (Com ilustração elegante) */
          <div className="bg-white rounded-[28px] p-12 text-center border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.02)] space-y-4">
            <div className="w-20 h-20 rounded-full bg-emerald-50 text-[#1E6B4B] flex items-center justify-center mx-auto border border-emerald-100/80 shadow-xs">
              <Target className="w-10 h-10 stroke-[1.5]" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-extrabold text-slate-900">
                Comece criando sua primeira meta.
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto font-normal">
                Defina seus objetivos financeiros para organizar suas economias, calcular aportes mensais e acompanhar sua evolução em tempo real.
              </p>
            </div>
            <button
              onClick={handleOpenCreateModal}
              className="mt-2 bg-[#1E6B4B] hover:bg-[#165037] text-white font-bold py-3 px-6 rounded-2xl text-xs sm:text-sm transition-all cursor-pointer inline-flex items-center gap-2 shadow-md shadow-emerald-900/10 active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Criar Minha Primeira Meta</span>
            </button>
          </div>
        ) : (
          /* GRID DE CARDS INTELIGENTES DE METAS */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {goals.map((goal) => {
              const GoalIcon = getGoalIconComponent(goal.icon);
              const metrics = calculateGoalMetrics(goal);
              const currentColor = goal.color || '#1E6B4B';
              const isHistoryExpanded = expandedHistoryGoalId === goal.id;
              const contributions = goalContributionsHistory[goal.id] || [];

              return (
                <div
                  key={goal.id}
                  className="bg-white rounded-[28px] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-slate-100/90 flex flex-col justify-between transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_36px_rgba(0,0,0,0.05)] relative group"
                >
                  <div>
                    {/* Top Header of Card */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs text-white"
                          style={{ backgroundColor: currentColor }}
                        >
                          <GoalIcon className="w-6 h-6 stroke-[2]" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold text-slate-900 group-hover:text-[#1E6B4B] transition-colors">
                              {goal.title}
                            </h3>
                          </div>

                          {/* Status Badge */}
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-[10px] px-2.5 py-0.5 rounded-full border font-bold ${metrics.statusBadgeClass}`}>
                              {metrics.statusText}
                            </span>
                            <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {goal.deadline || 'A definir'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Menu Options Button */}
                      <div className="relative">
                        <button
                          onClick={() => setActiveMenuId(activeMenuId === goal.id ? null : goal.id)}
                          className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                          title="Opções"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>

                        {/* Dropdown Popover */}
                        {activeMenuId === goal.id && (
                          <div className="absolute right-0 top-8 w-36 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-20 animate-fade-in-up">
                            <button
                              onClick={() => handleOpenEditModal(goal)}
                              className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                              <span>Editar</span>
                            </button>
                            <button
                              onClick={() => handleDelete(goal.id)}
                              className="w-full text-left px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                              <span>Excluir</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar & Percentages */}
                    <div className="space-y-2.5 my-3">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-slate-500">Progresso Atingido</span>
                        <span className={`font-extrabold ${metrics.isCompleted ? 'text-emerald-600' : 'text-slate-900'}`}>
                          {metrics.percentage}% {metrics.isCompleted && '🎉 Concluída!'}
                        </span>
                      </div>

                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          style={{ width: `${metrics.percentage}%`, backgroundColor: currentColor }}
                          className="h-full rounded-full transition-all duration-700 ease-out"
                        />
                      </div>

                      {/* Values Grid */}
                      <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-100 text-center my-2">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase block">
                            ALCANÇADO
                          </span>
                          <span className="text-xs font-extrabold text-slate-900">
                            {formatCurrency(goal.currentAmount)}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase block">
                            RESTANTE
                          </span>
                          <span className="text-xs font-extrabold text-amber-600">
                            {formatCurrency(metrics.remaining)}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase block">
                            OBJETIVO
                          </span>
                          <span className="text-xs font-extrabold text-[#1E6B4B]">
                            {formatCurrency(goal.targetAmount)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* PAINEL DE INTELIGÊNCIA: SUGESTÃO E PREVISÃO */}
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 space-y-2 my-3 text-xs">
                      {/* Sugestão de aporte mensal */}
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium flex items-center gap-1.5">
                          <TrendingUp className="w-3.5 h-3.5 text-[#1E6B4B]" />
                          Guardar por mês:
                        </span>
                        <span className="font-extrabold text-[#1E6B4B]">
                          {metrics.isCompleted ? 'R$ 0,00' : formatCurrency(metrics.suggestedMonthly)}
                        </span>
                      </div>

                      {/* Previsão de conclusão */}
                      <div className="flex items-center justify-between border-t border-slate-100/80 pt-1.5">
                        <span className="text-slate-500 font-medium flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-blue-600" />
                          Previsão:
                        </span>
                        <span className="font-bold text-slate-700 text-[11px]">
                          {metrics.forecastText}
                        </span>
                      </div>
                    </div>

                    {/* DRAWER / SEÇÃO HISTÓRICO DE APORTES */}
                    {isHistoryExpanded && (
                      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 my-3 text-xs space-y-2 animate-fade-in">
                        <div className="flex items-center justify-between font-bold text-slate-800 border-b border-slate-200 pb-1.5">
                          <span className="flex items-center gap-1">
                            <History className="w-3.5 h-3.5 text-emerald-600" />
                            Últimos Aportes
                          </span>
                          <button
                            onClick={() => setExpandedHistoryGoalId(null)}
                            className="text-[10px] text-slate-400 hover:text-slate-700"
                          >
                            Fechar
                          </button>
                        </div>

                        {isLoadingHistory ? (
                          <p className="text-slate-400 text-center py-2 text-[11px]">Carregando histórico...</p>
                        ) : contributions.length === 0 ? (
                          <p className="text-slate-400 text-center py-2 text-[11px]">Nenhum aporte registrado ainda.</p>
                        ) : (
                          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                            {contributions.map((c) => (
                              <div key={c.id} className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-xl border border-slate-100 text-[11px]">
                                <div>
                                  <span className="font-bold text-slate-800 block">{c.notes || 'Aporte'}</span>
                                  <span className="text-[10px] text-slate-400">{c.date}</span>
                                </div>
                                <span className="font-extrabold text-[#1E6B4B]">
                                  + {formatCurrency(c.amount)}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                  </div>

                  {/* Actions Footer */}
                  <div className="pt-3 border-t border-slate-100 mt-2 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setExpandedHistoryGoalId(isHistoryExpanded ? null : goal.id)}
                      className="flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                    >
                      <History className="w-3.5 h-3.5" />
                      <span>{isHistoryExpanded ? 'Ocultar Histórico' : 'Histórico'}</span>
                    </button>

                    <button
                      onClick={() => handleOpenContributionModal(goal)}
                      className="flex items-center gap-1 px-4 py-2 rounded-full bg-[#1E6B4B] hover:bg-[#165037] text-white text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
                    >
                      <PiggyBank className="w-3.5 h-3.5" />
                      <span>+ Fazer Aporte</span>
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. MODAL (+ Nova Meta / Editar Meta) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-[32px] max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative animate-scale-up">
            
            {/* Header Modal */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">
                  {editingGoal ? 'Editar Meta' : 'Nova Meta Financeira'}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Preencha os dados do seu objetivo financeiro.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              
              {/* Nome da Meta */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1 uppercase tracking-wider">
                  Nome da Meta *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Viagem Europa, Novo Carro, Reserva..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-900 focus:bg-white focus:border-[#1E6B4B] focus:ring-2 focus:ring-[#1E6B4B]/20 outline-none transition-all"
                />
              </div>

              {/* Grid: Valor Objetivo e Valor Inicial */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1 uppercase tracking-wider">
                    Valor Objetivo (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    placeholder="15000"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 focus:bg-white focus:border-[#1E6B4B] focus:ring-2 focus:ring-[#1E6B4B]/20 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1 uppercase tracking-wider">
                    Valor Atual (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0"
                    value={currentAmount}
                    onChange={(e) => setCurrentAmount(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 focus:bg-white focus:border-[#1E6B4B] focus:ring-2 focus:ring-[#1E6B4B]/20 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Previsão de Conclusão / Data Objetivo */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1 uppercase tracking-wider">
                  Data Objetivo (Prazo Final)
                </label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white focus:border-[#1E6B4B] focus:ring-2 focus:ring-[#1E6B4B]/20 outline-none transition-all"
                />
              </div>

              {/* Seleção de Ícone */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2 uppercase tracking-wider">
                  Ícone
                </label>
                <div className="flex flex-wrap gap-2">
                  {GOAL_ICONS.map((item) => {
                    const IconComp = item.icon;
                    const isSelected = selectedIcon === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelectedIcon(item.id)}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#1E6B4B] text-white border-[#1E6B4B] shadow-xs'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                        title={item.label}
                      >
                        <IconComp className="w-5 h-5" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Seleção de Cor */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2 uppercase tracking-wider">
                  Cor
                </label>
                <div className="flex items-center gap-3">
                  {GOAL_COLORS.map((c) => {
                    const isSelected = selectedColor === c.hex;
                    return (
                      <button
                        key={c.hex}
                        type="button"
                        onClick={() => setSelectedColor(c.hex)}
                        className={`w-8 h-8 rounded-full transition-transform cursor-pointer flex items-center justify-center ${
                          isSelected ? 'scale-110 ring-2 ring-offset-2 ring-slate-400' : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                      >
                        {isSelected && <Check className="w-4 h-4 text-white stroke-[3]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Botões: Cancelar / Salvar */}
              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-4 rounded-2xl text-xs sm:text-sm transition-all cursor-pointer text-center"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#1E6B4B] hover:bg-[#165037] text-white font-bold py-3 px-4 rounded-2xl text-xs sm:text-sm shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>Salvar</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Modal Aportes */}
      <GoalContributionModal
        isOpen={isContributionModalOpen}
        onClose={() => setIsContributionModalOpen(false)}
        goal={selectedContributionGoal}
      />

    </div>
  );
};
