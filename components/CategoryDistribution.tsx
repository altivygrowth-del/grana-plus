import React from 'react';
import { useFinancial } from '../context/FinancialContext';
import { formatCurrency } from '../lib/formatters';
import { PieChart, ArrowUpRight } from 'lucide-react';

export const CategoryDistribution: React.FC = () => {
  const { budgets } = useFinancial();

  const currentMonthName = new Date().toLocaleDateString('pt-BR', { month: 'long' });
  const formattedMonth = currentMonthName.charAt(0).toUpperCase() + currentMonthName.slice(1);

  const categoriesWithinLimit = budgets.filter((b) => b.spent <= b.budgeted).length;
  const withinLimitPercent = budgets.length > 0 ? Math.round((categoriesWithinLimit / budgets.length) * 100) : 100;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 lg:p-6 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <PieChart className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-white text-base">Orçamento por Categoria</h3>
          </div>
          <span className="text-xs font-semibold text-emerald-400 hover:underline cursor-pointer flex items-center">
            Ver Todos <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
          </span>
        </div>

        <p className="text-xs text-slate-400 mb-5">
          Acompanhamento do teto de gastos definido para o mês de {formattedMonth}
        </p>

        <div className="space-y-4">
          {budgets.map((item) => {
            const percentage = Math.min(100, Math.round((item.spent / item.budgeted) * 100));
            const isOverBudget = item.spent > item.budgeted;

            return (
              <div key={item.category} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-slate-200 font-semibold">{item.category}</span>
                  <div className="text-right">
                    <span className={isOverBudget ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                      {formatCurrency(item.spent)}
                    </span>
                    <span className="text-slate-500 font-normal"> / {formatCurrency(item.budgeted)}</span>
                  </div>
                </div>

                {/* Progress bar container */}
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    style={{ width: `${percentage}%` }}
                    className={`h-full rounded-full transition-all duration-500 ${
                      isOverBudget
                        ? 'bg-rose-500'
                        : percentage > 80
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                  />
                </div>

                <div className="flex justify-between items-center text-[11px] text-slate-400">
                  <span>{percentage}% utilizado</span>
                  <span>Disponível: {formatCurrency(Math.max(0, item.budgeted - item.spent))}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
        <span>Total Orçado: {formatCurrency(budgets.reduce((acc, b) => acc + b.budgeted, 0))}</span>
        <span className="font-semibold text-emerald-400">{withinLimitPercent}% no limite</span>
      </div>
    </div>
  );
};
