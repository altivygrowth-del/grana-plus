import React from 'react';
import { CreditCard, Plus } from 'lucide-react';
import { formatCurrency } from '../lib/formatters';
import { useUserStore } from '../store/userStore';

export const CreditCardsCard: React.FC = () => {
  const cards = useUserStore((state) => state.cards);

  if (cards.length === 0) {
    return (
      <div className="bg-white rounded-[28px] p-6 lg:p-7 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-slate-100/90 flex flex-col justify-between h-full transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_36px_rgba(0,0,0,0.05)] animate-fade-in-up">
        <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase mb-3 block">
          USO DOS CARTÕES
        </span>

        <div className="text-center py-6 my-auto">
          <div className="w-10 h-10 rounded-2xl bg-purple-50 text-[#8A05BE] border border-purple-100 flex items-center justify-center mx-auto mb-2">
            <CreditCard className="w-5 h-5 stroke-[2]" />
          </div>
          <p className="text-xs font-bold text-slate-800">Nenhum cartão cadastrado</p>
          <p className="text-[11px] text-slate-400 mt-0.5 font-normal">
            Cadastre um cartão para acompanhar faturas e limites.
          </p>
        </div>

        <div className="pt-3 border-t border-slate-100/60 mt-2">
          <span className="text-xs font-semibold text-slate-500">
            0 cartões ativos
          </span>
        </div>
      </div>
    );
  }

  const primaryCard = cards[0];
  const currentUsage = primaryCard.currentUsage || 0;
  const totalLimit = primaryCard.totalLimit || 0;
  const usagePercentage = totalLimit > 0 ? Math.min(100, Math.round((currentUsage / totalLimit) * 100)) : 0;

  return (
    <div className="bg-white rounded-[28px] p-6 lg:p-7 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-slate-100/90 flex flex-col justify-between h-full transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_36px_rgba(0,0,0,0.05)] animate-fade-in-up">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase block">
          USO DOS CARTÕES
        </span>
        <span className="text-[11px] font-semibold text-[#8A05BE] bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-100/80 truncate max-w-[120px]">
          {primaryCard.name}
        </span>
      </div>

      <div>
        <div className="flex items-baseline gap-1.5 mt-1">
          <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {formatCurrency(currentUsage)}
          </span>
          <span className="text-xs font-normal text-slate-400">
            de {formatCurrency(totalLimit)}
          </span>
        </div>

        {/* Thinner, elegant Usage progress bar */}
        <div className="w-full bg-slate-100 rounded-full h-1.5 my-3.5 overflow-hidden">
          <div 
            className="bg-[#8A05BE] h-full rounded-full transition-all duration-700 ease-out"
            style={{ width: `${usagePercentage}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs font-normal text-slate-500">
          <span><strong className="font-semibold text-slate-700">{usagePercentage}%</strong> do limite utilizado</span>
          <span className="text-slate-400 font-normal">
            {primaryCard.dueDate ? `Vence ${primaryCard.dueDate}` : 'Fatura em aberto'}
          </span>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100/60 mt-2">
        <span className="text-xs font-semibold text-slate-500">
          {cards.length} {cards.length === 1 ? 'cartão cadastrado' : 'cartões cadastrados'}
        </span>
      </div>
    </div>
  );
};
