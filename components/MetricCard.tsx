import React from 'react';
import { LucideIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatCurrency } from '../lib/formatters';

interface MetricCardProps {
  title: string;
  value: number;
  type: 'currency' | 'percentage';
  changePercent: number;
  isPositiveGood?: boolean;
  icon: LucideIcon;
  subtitle?: string;
  accentColor?: 'emerald' | 'indigo' | 'rose' | 'amber';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  type,
  changePercent,
  isPositiveGood = true,
  icon: Icon,
  subtitle,
  accentColor = 'emerald',
}) => {
  const isPositive = changePercent >= 0;
  const isGoodTrend = isPositiveGood ? isPositive : !isPositive;

  const colorStyles = {
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 hover:border-slate-700/80 transition-all shadow-sm">
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="text-xs font-medium text-slate-400 tracking-wide uppercase">
          {title}
        </span>
        <div className={`p-2 rounded-xl border ${colorStyles[accentColor]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mb-2">
        <div className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
          {type === 'currency' ? formatCurrency(value) : `${value.toFixed(1)}%`}
        </div>
      </div>

      <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/60">
        <div className="flex items-center gap-1">
          <span
            className={`flex items-center font-semibold ${
              isGoodTrend ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {isPositive ? (
              <ArrowUpRight className="w-3.5 h-3.5" />
            ) : (
              <ArrowDownRight className="w-3.5 h-3.5" />
            )}
            {Math.abs(changePercent)}%
          </span>
          <span className="text-slate-400 font-normal">vs mês anterior</span>
        </div>
        {subtitle && <span className="text-slate-400 font-medium">{subtitle}</span>}
      </div>
    </div>
  );
};
