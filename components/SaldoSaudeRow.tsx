import React from 'react';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../lib/formatters';
import { ShieldCheck } from 'lucide-react';

interface SaldoSaudeRowProps {
  totalBalance?: number;
  healthScore?: number;
}

export const SaldoSaudeRow: React.FC<SaldoSaudeRowProps> = ({ 
  totalBalance = 0,
  healthScore = 0
}) => {
  const { t } = useTranslation('dashboard');

  const getHealthLabel = (score: number) => {
    if (score >= 80) return t('healthExcellent', 'Excelente! Continue assim.');
    if (score >= 60) return t('healthGood', 'Boa! Suas finanças estão no caminho certo.');
    if (score >= 40) return t('healthAttention', 'Atenção! Revise algumas despesas.');
    return t('healthCareful', 'Cuidado! Reorganize suas contas.');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Saldo Atual Card */}
      <div className="bg-white rounded-[28px] p-6 lg:p-7 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-slate-100/90 flex flex-col justify-between transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_36px_rgba(0,0,0,0.05)] animate-fade-in-up">
        <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase mb-3 block">
          {t('totalBalance', 'SALDO ATUAL')}
        </span>

        <div>
          <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {formatCurrency(totalBalance)}
          </div>
          <div className="flex items-center gap-2 text-[11px] font-normal text-slate-400 mt-3">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4CAF6A]" />
            </span>
            <span className="opacity-80">{t('updatedNow', 'Atualizado agora')}</span>
          </div>
        </div>
      </div>

      {/* Saúde Financeira Card */}
      <div className="bg-white rounded-[28px] p-6 lg:p-7 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-slate-100/90 flex flex-col justify-between transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_36px_rgba(0,0,0,0.05)] animate-fade-in-up">
        <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase mb-3 block">
          {t('financialHealth', 'SAÚDE FINANCEIRA')}
        </span>

        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl sm:text-3.5xl font-black text-slate-900 tracking-tight">
              {healthScore}
            </span>
            <span className="text-sm font-semibold text-slate-400">
              /100
            </span>
          </div>

          {/* Thinner, elegant Progress bar */}
          <div className="w-full bg-slate-100 rounded-full h-1.5 my-3.5 overflow-hidden">
            <div 
              className="bg-[#4CAF6A] h-full rounded-full transition-all duration-700 ease-out"
              style={{ width: `${Math.min(100, Math.max(0, healthScore))}%` }}
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
            <ShieldCheck className="w-4 h-4 text-[#4CAF6A]" />
            <span>{getHealthLabel(healthScore)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};


