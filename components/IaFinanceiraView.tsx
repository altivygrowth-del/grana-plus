import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useUserStore } from '../store/userStore';
import { generateFinancialInsights, FinancialInsight, InsightPriority } from '../services/financialInsights';
import { getInsightIconComponent, getTypeBadgeStyle } from './AiInsightCard';
import { 
  Bot, 
  Sparkles, 
  AlertTriangle, 
  Trophy, 
  Lightbulb, 
  CheckCircle2, 
  Filter,
  ArrowUpRight,
  ShieldCheck,
  TrendingUp,
  Zap
} from 'lucide-react';

type FilterTab = 'todos' | 'alertas' | 'oportunidades' | 'conquistas';

export const IaFinanceiraView: React.FC = () => {
  const { t } = useTranslation('common');
  const store = useUserStore();
  const [activeFilter, setActiveFilter] = useState<FilterTab>('todos');

  // Generate insights dynamically from Zustand store state
  const insights = useMemo(() => generateFinancialInsights(store), [store]);

  // Priority badge styling
  const getPriorityBadgeStyle = (prioridade: InsightPriority) => {
    switch (prioridade) {
      case 'alta':
        return 'bg-rose-100/80 text-rose-800 border-rose-200 font-extrabold';
      case 'media':
        return 'bg-amber-100/80 text-amber-800 border-amber-200 font-extrabold';
      case 'baixa':
        return 'bg-slate-100 text-slate-600 border-slate-200 font-semibold';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  // Filter logic
  const filteredInsights = useMemo(() => {
    return insights.filter((item) => {
      if (activeFilter === 'alertas') return item.tipo === 'alerta';
      if (activeFilter === 'oportunidades') return item.tipo === 'oportunidade' || item.tipo === 'economia';
      if (activeFilter === 'conquistas') return item.tipo === 'conquista';
      return true; // 'todos'
    });
  }, [insights, activeFilter]);

  // Stats Counters
  const totalCount = insights.length;
  const alertCount = insights.filter((i) => i.tipo === 'alerta' || i.prioridade === 'alta').length;
  const conquistaCount = insights.filter((i) => i.tipo === 'conquista').length;
  const oportunidadeCount = insights.filter((i) => i.tipo === 'oportunidade' || i.tipo === 'economia').length;

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in-up pb-24 relative">
      
      {/* 1. CARD SUPERIOR */}
      <div className="bg-gradient-to-r from-[#165037] via-[#1E6B4B] to-[#23825C] rounded-[28px] p-6 lg:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-8">
          <Bot className="w-64 h-64 text-white" />
        </div>

        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-400/20 text-emerald-200 text-[10px] font-extrabold px-3 py-1 rounded-full border border-emerald-400/30 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Motor de Regras Inteligente
            </span>
            <span className="bg-white/10 text-white/90 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-white/10">
              v1.0 Nativo
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {t('aiTitle', 'IA Financeira Grana+')}
          </h1>
          <p className="text-xs sm:text-sm font-normal text-emerald-100/90 max-w-xl">
            {t('aiSubtitle', 'Análises automáticas do seu orçamento. Identifique gargalos, oportunidades de economia e acompanhe suas conquistas sem complicação.')}
          </p>
        </div>
      </div>

      {/* 2. RESUMO DE INDICADORES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        
        {/* Total de Insights */}
        <div className="bg-white rounded-[24px] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-slate-100/90 transition-all duration-300 hover:shadow-[0_14px_36px_rgba(0,0,0,0.05)]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Insights Gerados
            </span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-[#1E6B4B] flex items-center justify-center border border-emerald-100">
              <Zap className="w-5 h-5 stroke-[2]" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {totalCount} {totalCount === 1 ? 'Análise' : 'Análises'}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Atualizado com base na sua store
          </p>
        </div>

        {/* Alertas Críticos */}
        <div className="bg-white rounded-[24px] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-slate-100/90 transition-all duration-300 hover:shadow-[0_14px_36px_rgba(0,0,0,0.05)]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Alertas de Atenção
            </span>
            <div className="w-9 h-9 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
              <AlertTriangle className="w-5 h-5 stroke-[2]" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-rose-600 tracking-tight">
            {alertCount}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Requerem atenção ou ajuste
          </p>
        </div>

        {/* Conquistas */}
        <div className="bg-white rounded-[24px] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-slate-100/90 transition-all duration-300 hover:shadow-[0_14px_36px_rgba(0,0,0,0.05)]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Conquistas
            </span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-[#1E6B4B] flex items-center justify-center border border-emerald-100">
              <Trophy className="w-5 h-5 stroke-[2]" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 tracking-tight">
            {conquistaCount}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Metas e marcos alcançados
          </p>
        </div>

        {/* Oportunidades */}
        <div className="bg-white rounded-[24px] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-slate-100/90 transition-all duration-300 hover:shadow-[0_14px_36px_rgba(0,0,0,0.05)]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Oportunidades
            </span>
            <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <TrendingUp className="w-5 h-5 stroke-[2]" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {oportunidadeCount}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Dicas para potencializar economias
          </p>
        </div>

      </div>

      {/* 3. FILTROS */}
      <div className="bg-white rounded-[24px] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-slate-100/90 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setActiveFilter('todos')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeFilter === 'todos'
                ? 'bg-[#1E6B4B] text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            Todos ({totalCount})
          </button>

          <button
            onClick={() => setActiveFilter('alertas')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeFilter === 'alertas'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-100/60'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Alertas ({alertCount})</span>
          </button>

          <button
            onClick={() => setActiveFilter('oportunidades')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeFilter === 'oportunidades'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-100/60'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Oportunidades ({oportunidadeCount})</span>
          </button>

          <button
            onClick={() => setActiveFilter('conquistas')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeFilter === 'conquistas'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-100/60'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Conquistas ({conquistaCount})</span>
          </button>
        </div>

        <div className="text-xs text-slate-400 font-medium self-end sm:self-auto shrink-0">
          Ordenado por Prioridade
        </div>
      </div>

      {/* 4. LISTA DE INSIGHTS */}
      <div className="space-y-4">
        {filteredInsights.length === 0 ? (
          <div className="bg-white rounded-[28px] p-12 text-center border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.02)]">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3 stroke-[1.5]" />
            <h3 className="text-base font-bold text-slate-800">Nenhum insight nesta categoria</h3>
            <p className="text-xs text-slate-400 mt-1">
              Sua saúde financeira está em ordem para os critérios selecionados.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredInsights.map((item) => {
              const IconComp = getInsightIconComponent(item.icone);
              const typeStyle = getTypeBadgeStyle(item.tipo);
              const priorityStyle = getPriorityBadgeStyle(item.prioridade);

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-[28px] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-slate-100/90 flex flex-col justify-between transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_36px_rgba(0,0,0,0.05)] relative group"
                >
                  {/* Top Badges Header */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <span className={`text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${typeStyle.badgeBg}`}>
                        {typeStyle.label}
                      </span>

                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${priorityStyle}`}>
                          Prioridade {item.prioridade}
                        </span>
                      </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border shadow-2xs ${typeStyle.iconBg}`}>
                        <IconComp className="w-6 h-6 stroke-[2]" />
                      </div>

                      <div className="space-y-1.5">
                        <h3 className="text-base font-bold text-slate-900 group-hover:text-[#1E6B4B] transition-colors leading-snug">
                          {item.titulo}
                        </h3>
                        <p className="text-xs text-slate-600 leading-relaxed font-normal">
                          {item.descricao}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Suggested Action Box */}
                  <div className="mt-5 pt-4 border-t border-slate-100/80 bg-slate-50/70 -mx-6 -mb-6 p-4 rounded-b-[28px] flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-[#4CAF6A] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Ação Recomendada
                      </span>
                      <p className="text-xs font-semibold text-[#1E6B4B] mt-0.5">
                        {item.acaoSugerida}
                      </p>
                    </div>
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
