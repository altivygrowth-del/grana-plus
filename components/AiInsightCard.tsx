import React from 'react';
import { 
  Bot, 
  ArrowRight, 
  AlertTriangle, 
  Trophy, 
  TrendingUp, 
  CreditCard, 
  CheckCircle2, 
  Target, 
  Shield, 
  Lightbulb, 
  Sparkles 
} from 'lucide-react';
import { useUserStore } from '../store/userStore';
import { getHighestPriorityInsight, FinancialInsight } from '../services/financialInsights';

export const getInsightIconComponent = (iconName: string) => {
  switch (iconName) {
    case 'AlertTriangle': return AlertTriangle;
    case 'Trophy': return Trophy;
    case 'TrendingUp': return TrendingUp;
    case 'CreditCard': return CreditCard;
    case 'CheckCircle2': return CheckCircle2;
    case 'Target': return Target;
    case 'Shield': return Shield;
    case 'Lightbulb': return Lightbulb;
    case 'Sparkles': return Sparkles;
    default: return Bot;
  }
};

export const getTypeBadgeStyle = (tipo: FinancialInsight['tipo']) => {
  switch (tipo) {
    case 'alerta':
      return {
        badgeBg: 'bg-rose-50 text-rose-700 border-rose-100',
        iconBg: 'bg-rose-50 text-rose-600 border-rose-100',
        label: 'Alerta'
      };
    case 'conquista':
      return {
        badgeBg: 'bg-emerald-50 text-[#1E6B4B] border-emerald-100',
        iconBg: 'bg-emerald-50 text-[#1E6B4B] border-emerald-100',
        label: 'Conquista'
      };
    case 'economia':
      return {
        badgeBg: 'bg-amber-50 text-amber-700 border-amber-100',
        iconBg: 'bg-amber-50 text-amber-600 border-amber-100',
        label: 'Economia'
      };
    case 'oportunidade':
      return {
        badgeBg: 'bg-blue-50 text-blue-700 border-blue-100',
        iconBg: 'bg-blue-50 text-blue-600 border-blue-100',
        label: 'Oportunidade'
      };
    default:
      return {
        badgeBg: 'bg-purple-50 text-[#8A05BE] border-purple-100',
        iconBg: 'bg-purple-50 text-[#8A05BE] border-purple-100',
        label: 'Informação'
      };
  }
};

export const AiInsightCard: React.FC = () => {
  const store = useUserStore();
  const topInsight = getHighestPriorityInsight(store);
  const IconComponent = getInsightIconComponent(topInsight.icone);
  const style = getTypeBadgeStyle(topInsight.tipo);

  return (
    <div className="bg-white rounded-[28px] p-6 lg:p-7 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-slate-100/90 flex flex-col justify-between h-full transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_36px_rgba(0,0,0,0.05)] animate-fade-in-up">
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase block">
            INSIGHT DO DIA
          </span>
          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${style.badgeBg}`}>
            {style.label}
          </span>
        </div>

        <div className="flex items-start gap-3.5 my-2">
          {/* Avatar Icon Badge */}
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border shadow-2xs ${style.iconBg}`}>
            <IconComponent className="w-5 h-5 stroke-[2]" />
          </div>

          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-900 leading-tight">
              {topInsight.titulo}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              {topInsight.descricao}
            </p>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100/60 mt-3">
        <p className="text-[11px] font-semibold text-[#1E6B4B]">
          💡 Dica: {topInsight.acaoSugerida}
        </p>
      </div>
    </div>
  );
};



