import React from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Wallet, Sparkles } from 'lucide-react';
import { formatCurrency } from '../lib/formatters';
import { useUserStore } from '../store/userStore';

interface DinheiroLivreCardProps {
  freeAmount?: number;
}

export const DinheiroLivreCard: React.FC<DinheiroLivreCardProps> = ({ 
  freeAmount 
}) => {
  const { t } = useTranslation('dashboard');
  const user = useUserStore((state) => state.user);

  const totalBalance = Number(user.currentBalance) || 0;

  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysRemaining = Math.max(1, daysInMonth - now.getDate() + 1);

  const calculatedFree = totalBalance > 0
    ? Math.round((totalBalance / daysRemaining) * 100) / 100
    : 0;

  const displayFreeAmount = freeAmount !== undefined ? freeAmount : calculatedFree;

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#12422D] via-[#165037] to-[#1D6345] text-white rounded-[32px] p-8 lg:p-10 shadow-2xl shadow-emerald-950/20 border border-emerald-600/30 transition-all duration-300 hover:shadow-emerald-900/30 animate-fade-in-up">
      {/* Soft Ambient Background Lighting */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#4CAF6A]/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-300/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8 lg:gap-12 min-h-[175px]">
        {/* Left Info Column */}
        <div className="flex flex-col justify-between space-y-4 lg:space-y-5">
          {/* Header Tag with glowing border */}
          <div>
            <span className="inline-flex items-center gap-1.5 bg-[#0A2D1E]/90 text-[#6BE191] text-[11px] font-extrabold tracking-widest uppercase px-3.5 py-1.5 rounded-full border border-emerald-400/40 shadow-sm shadow-emerald-950/50">
              <Sparkles className="w-3.5 h-3.5 text-[#52C478] animate-pulse" />
              {t('freeMoney', 'DINHEIRO LIVRE™')}
            </span>
          </div>

          {/* Value Block */}
          <div className="space-y-1">
            <p className="text-xs sm:text-sm font-normal text-emerald-100/90 tracking-wide">
              {t('youCanSpendToday', 'Hoje você pode gastar')}
            </p>
            <div className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-none drop-shadow-xs">
              {formatCurrency(displayFreeAmount)}
            </div>
          </div>

          {/* Confirmation Badge */}
          <div className="flex items-center gap-2 text-[#52C478] text-xs sm:text-sm font-semibold pt-1">
            <div className="w-5 h-5 rounded-full bg-[#52C478]/20 flex items-center justify-center border border-[#52C478]/40 shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#62D288]" />
            </div>
            <span className="tracking-wide text-emerald-200">{t('withoutAffectingGoals', 'sem comprometer suas metas')}</span>
          </div>
        </div>

        {/* Right Semicircle Speedometer Gauge Visual */}
        <div className="relative flex items-center justify-center shrink-0 self-center md:self-auto pt-2 md:pt-0">
          <div className="relative w-52 h-28 overflow-hidden flex items-end justify-center">
            {/* Dark Track Background Arc */}
            <div className="w-48 h-48 rounded-full border-[16px] border-[#0A2619]/95 rotate-[-45deg] absolute" />
            
            {/* Active Thick Gradient Arc with glow */}
            <div className="w-48 h-48 rounded-full border-[16px] border-transparent border-t-[#52C478] border-r-[#3B9E5A] rotate-[-45deg] transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(82,196,120,0.3)] animate-gauge" />

            {/* Center Speedometer Wallet Button */}
            <div className="absolute bottom-1 w-14 h-14 rounded-full bg-white text-[#165037] flex items-center justify-center shadow-2xl border border-emerald-100 transition-transform duration-300 hover:scale-110 cursor-pointer">
              <Wallet className="w-7 h-7 stroke-[2.2] text-[#165037]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


