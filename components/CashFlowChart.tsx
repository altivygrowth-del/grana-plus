import React, { useState } from 'react';
import { formatCurrency } from '../lib/formatters';
import { useUserStore } from '../store/userStore';

const MONTH_NAMES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export const CashFlowChart: React.FC = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const transactions = useUserStore((state) => state.transactions);

  // Generate last 6 months data dynamically from real Supabase transactions
  const now = new Date();
  const monthlyChartData = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthIndex = d.getMonth();
    const year = d.getFullYear();
    const monthLabel = MONTH_NAMES[monthIndex];

    let income = 0;
    let expense = 0;

    transactions.forEach((tx) => {
      if (!tx.date) return;
      const txDate = new Date(tx.date.includes('T') ? tx.date : `${tx.date}T12:00:00`);
      if (txDate.getMonth() === monthIndex && txDate.getFullYear() === year) {
        if (tx.type === 'income') {
          income += tx.amount;
        } else if (tx.type === 'expense') {
          expense += tx.amount;
        }
      }
    });

    monthlyChartData.push({
      month: monthLabel,
      income,
      expense
    });
  }

  const allAmounts = monthlyChartData.flatMap((d) => [d.income, d.expense]);
  const rawMax = Math.max(...allAmounts, 100); // minimum scale
  const maxVal = rawMax * 1.15;

  const totalActivity = monthlyChartData.reduce((acc, d) => acc + d.income + d.expense, 0);

  return (
    <div className="bg-white rounded-[28px] p-6 lg:p-7 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-slate-100/90 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_36px_rgba(0,0,0,0.05)] animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase block">
            FLUXO FINANCEIRO
          </span>
          <h3 className="text-base font-semibold text-slate-900 mt-1">Evolução de Entradas e Saídas</h3>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#4CAF6A] inline-block" />
            <span className="text-slate-600">Entradas</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-slate-300 inline-block" />
            <span className="text-slate-600">Saídas</span>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="relative pt-6 pb-2">
        {totalActivity === 0 && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/80 backdrop-blur-xs rounded-2xl p-4 text-center">
            <p className="text-xs font-bold text-slate-800">Nenhuma movimentação registrada no gráfico</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Cadastre suas receitas e despesas para visualizar o histórico mensal.</p>
          </div>
        )}

        <div className="h-56 flex items-end justify-between gap-3 sm:gap-6 border-b border-slate-100 pb-3">
          {monthlyChartData.map((item, idx) => {
            const incomeHeight = maxVal > 0 ? (item.income / maxVal) * 100 : 0;
            const expenseHeight = maxVal > 0 ? (item.expense / maxVal) * 100 : 0;
            const isHovered = hoveredIndex === idx;

            return (
              <div
                key={item.month}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="relative flex-1 flex flex-col items-center justify-end h-full group cursor-pointer"
              >
                {/* Tooltip */}
                {isHovered && (
                  <div className="absolute -top-16 z-20 bg-slate-900 text-white p-2.5 rounded-xl text-[11px] shadow-xl pointer-events-none min-w-[130px]">
                    <p className="font-bold border-b border-slate-800 pb-1 mb-1">
                      {item.month}
                    </p>
                    <div className="flex justify-between gap-2 text-[#4CAF6A] font-semibold">
                      <span>Entradas:</span>
                      <span>{formatCurrency(item.income)}</span>
                    </div>
                    <div className="flex justify-between gap-2 text-slate-300 font-semibold mt-0.5">
                      <span>Saídas:</span>
                      <span>{formatCurrency(item.expense)}</span>
                    </div>
                  </div>
                )}

                {/* Bars Container */}
                <div className="w-full flex items-end justify-center gap-1.5 sm:gap-2.5 h-full">
                  {/* Income Bar */}
                  <div
                    style={{ height: `${Math.max(4, incomeHeight)}%` }}
                    className={`w-3.5 sm:w-6 rounded-t-lg transition-all duration-300 ${
                      item.income > 0 ? 'bg-[#4CAF6A]' : 'bg-slate-100'
                    } ${isHovered ? 'brightness-110' : 'opacity-95'}`}
                  />
                  {/* Expense Bar */}
                  <div
                    style={{ height: `${Math.max(4, expenseHeight)}%` }}
                    className={`w-3.5 sm:w-6 rounded-t-lg transition-all duration-300 ${
                      item.expense > 0 ? 'bg-slate-300' : 'bg-slate-100'
                    } ${isHovered ? 'bg-slate-400' : 'opacity-80'}`}
                  />
                </div>

                <span className={`text-[11px] mt-2.5 font-semibold transition-colors ${
                  isHovered ? 'text-[#1E6B4B] font-bold' : 'text-slate-400'
                }`}>
                  {item.month}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
