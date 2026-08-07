import React from 'react';
import { ArrowRight, Target } from 'lucide-react';
import { formatCurrency } from '../lib/formatters';
import { useUserStore } from '../store/userStore';

export const FinancialGoals: React.FC = () => {
  const storeGoals = useUserStore((state) => state.goals);
  const displayGoals = storeGoals.slice(0, 3);

  return (
    <div className="bg-white rounded-[28px] p-6 lg:p-7 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-slate-100/90 flex flex-col justify-between h-full transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_36px_rgba(0,0,0,0.05)] animate-fade-in-up">
      <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase mb-3 block">
        METAS
      </span>

      <div className="space-y-4 my-auto pt-1">
        {displayGoals.length === 0 ? (
          <div className="text-center py-4">
            <Target className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-400 font-medium">Nenhuma meta cadastrada</p>
          </div>
        ) : (
          displayGoals.map((goal) => {
            const percentage = goal.targetAmount > 0 
              ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100))
              : 0;

            return (
              <div key={goal.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-900">
                  <span>{goal.title}</span>
                  <span className="text-[11px] font-semibold text-slate-500">
                    {percentage}%
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    style={{ width: `${percentage}%` }}
                    className="h-full bg-[#4CAF6A] rounded-full transition-all duration-700 ease-out"
                  />
                </div>

                <div className="flex justify-between items-center text-[11px] font-normal text-slate-400 pt-0.5">
                  <span>{formatCurrency(goal.currentAmount)}</span>
                  <span>de {formatCurrency(goal.targetAmount)}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="pt-3">
        <span className="text-xs font-semibold text-slate-500">
          {storeGoals.length} {storeGoals.length === 1 ? 'meta ativa' : 'metas ativas'}
        </span>
      </div>
    </div>
  );
};


