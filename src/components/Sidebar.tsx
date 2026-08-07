import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  LayoutDashboard, 
  Wallet,
  ArrowLeftRight, 
  CreditCard,
  Target,
  Compass,
  Landmark,
  Bot,
  BarChart3,
  Settings, 
  X,
  LogOut
} from 'lucide-react';
import { useUserStore } from '../store/userStore';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onClose, 
  activeTab, 
  setActiveTab 
}) => {
  const { t } = useTranslation('sidebar');
  const user = useUserStore((state) => state.user);
  const isLoadingAuth = useUserStore((state) => state.isLoadingAuth);
  const logout = useUserStore((state) => state.logout);

  const menuItems = [
    { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { id: 'carteira', label: t('carteira'), icon: Wallet },
    { id: 'movimentacoes', label: t('movimentacoes'), icon: ArrowLeftRight },
    { id: 'cartoes', label: t('cartoes'), icon: CreditCard },
    { id: 'metas', label: t('metas'), icon: Target },
    { id: 'planejamento', label: t('planejamento'), icon: Compass },
    { id: 'patrimonio', label: t('patrimonio'), icon: Landmark },
    { id: 'ia-financeira', label: t('iaFinanceira'), icon: Bot },
    { id: 'relatorios', label: t('relatorios'), icon: BarChart3 },
    { id: 'configuracoes', label: t('configuracoes'), icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container - Deep Forest Green (#165037) */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-[#165037] text-white flex flex-col justify-between transition-transform duration-300 ease-in-out shrink-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-5 overflow-y-auto">
          {/* Logo Brand Header */}
          <div className="flex items-center justify-between mb-8 px-2">
            <div className="flex items-center gap-1.5">
              <span className="text-2xl font-black tracking-tight text-white font-serif italic">Grana</span>
              <span className="text-2xl font-black text-[#4CAF6A]">+</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-emerald-200/70 hover:text-white rounded-xl hover:bg-emerald-900/40 lg:hidden transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    onClose();
                  }}
                  className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-2xl font-medium text-xs sm:text-sm transition-all duration-200 text-left cursor-pointer ${
                    isActive
                      ? 'bg-[#23825C] text-white font-bold shadow-xs translate-x-1'
                      : 'text-emerald-100/80 hover:text-white hover:bg-[#1B5E41] hover:translate-x-1'
                  }`}
                >
                  <Icon className={`w-4 h-4 sm:w-4.5 sm:h-4.5 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-emerald-200/70'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Footer Profile Card */}
        {isLoadingAuth ? (
          <div className="p-4 m-3 bg-[#113E2B] border border-emerald-800/40 rounded-2xl flex items-center gap-3 animate-pulse">
            <div className="w-9 h-9 rounded-full bg-emerald-800/60 shrink-0" />
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="h-3 w-24 bg-emerald-800/60 rounded" />
              <div className="h-2.5 w-16 bg-emerald-800/40 rounded" />
            </div>
          </div>
        ) : (
          <div className="p-4 m-3 bg-[#113E2B] border border-emerald-800/40 rounded-2xl flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 rounded-full bg-[#23825C] text-white font-bold text-sm flex items-center justify-center ring-2 ring-emerald-500/30 shrink-0 overflow-hidden">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name || 'Usuário'} className="w-full h-full object-cover" />
                ) : (
                  user?.name ? user.name.trim().charAt(0).toUpperCase() : 'U'
                )}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate">{user?.name || 'Usuário'}</p>
                <p className="text-[10px] text-[#FF8A4C] font-semibold truncate">{user?.email || 'Plano Grana+'}</p>
              </div>
            </div>
            <button
              onClick={() => logout()}
              className="p-2 text-emerald-300 hover:text-rose-300 hover:bg-emerald-900/60 rounded-xl transition-colors cursor-pointer shrink-0"
              title={t('logout')}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </aside>
    </>
  );
};

