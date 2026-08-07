import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Search, Bell, Sparkles, ChevronDown, LogOut } from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
import { useUserStore } from '../store/userStore';

interface HeaderProps {
  toggleMobileSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ toggleMobileSidebar }) => {
  const { t } = useTranslation('header');
  const { 
    searchQuery, 
    setSearchQuery, 
    setIsAddModalOpen 
  } = useFinancial();

  const user = useUserStore((state) => state.user);
  const isLoadingAuth = useUserStore((state) => state.isLoadingAuth);
  const logout = useUserStore((state) => state.logout);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return t('goodMorning');
    if (hour >= 12 && hour < 18) return t('goodAfternoon');
    return t('goodEvening');
  };

  const displayName = user?.name?.trim() || 'Usuário';
  const firstName = displayName.split(' ')[0] || 'Usuário';
  const userEmail = user?.email || '';

  return (
    <header className="sticky top-0 z-30 bg-[#F6F8FA]/90 backdrop-blur-md px-6 lg:px-10 py-3.5 lg:py-4 flex items-center justify-between gap-4 border-b border-slate-200/40">
      {/* Mobile Menu & Greeting */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleMobileSidebar}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-xl transition-colors"
          aria-label="Abrir menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div>
          {isLoadingAuth || !user.name ? (
            <div className="space-y-1 py-1">
              <div className="h-5 w-36 bg-slate-200/80 rounded-md animate-pulse" />
              <div className="h-3 w-28 bg-slate-200/50 rounded-md animate-pulse" />
            </div>
          ) : (
            <>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                {getGreeting()}, {firstName}! <span className="text-lg">👋</span>
              </h1>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">{t('overviewSubtitle')}</p>
            </>
          )}
        </div>
      </div>

      {/* Search Bar - Premium AI Pill Input */}
      <div className="hidden md:flex items-center flex-1 max-w-lg mx-6">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="w-full bg-white border border-slate-200/70 rounded-full pl-9 pr-9 py-2 text-xs text-slate-700 placeholder:text-slate-400 placeholder:font-normal shadow-[0_2px_8px_rgba(0,0,0,0.02)] focus:outline-none focus:ring-2 focus:ring-[#1E6B4B]/15 focus:border-[#1E6B4B]/50 transition-all"
          />
          <Sparkles className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#4CAF6A]" />
        </div>
      </div>

      {/* Right Controls: Notifications & User Profile */}
      <div className="flex items-center gap-3 relative">
        {/* Notifications Icon with Badge */}
        <button 
          className="relative p-2 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 rounded-full border border-slate-200/70 shadow-[0_2px_6px_rgba(0,0,0,0.02)] transition-all cursor-pointer"
          title={t('notifications')}
        >
          <Bell className="w-4 h-4 text-slate-600" />
          <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-[#FF7034] text-white text-[8px] font-extrabold rounded-full flex items-center justify-center ring-2 ring-white">
            3
          </span>
        </button>

        {/* User Profile Dropdown Button */}
        <div className="relative">
          {isLoadingAuth ? (
            <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse" />
          ) : (
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 pl-1 p-1 rounded-full hover:bg-slate-200/50 transition-colors cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-full bg-[#1E6B4B] text-white font-bold text-xs flex items-center justify-center shadow-xs ring-2 ring-slate-200/80 group-hover:ring-emerald-500/40 transition-all overflow-hidden">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  firstName.charAt(0).toUpperCase()
                )}
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 hidden sm:block transition-colors" />
            </button>
          )}

          {/* Dropdown Menu */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200/80 rounded-2xl shadow-xl py-2 z-50 animate-fadeIn">
              <div className="px-4 py-2.5 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900 truncate">{displayName}</p>
                <p className="text-[11px] text-slate-400 truncate">{userEmail}</p>
              </div>

              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  logout();
                }}
                className="w-full px-4 py-2.5 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>{t('logout')}</span>
              </button>
            </div>
          )}
        </div>

        {/* Quick Add Button */}
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="hidden sm:flex items-center gap-1.5 bg-[#FF7034] hover:bg-[#e05e26] text-white font-bold text-xs px-3.5 py-2 rounded-full transition-all shadow-sm hover:shadow-orange-500/20 active:scale-95 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>{t('addTransaction')}</span>
        </button>
      </div>
    </header>
  );
};



