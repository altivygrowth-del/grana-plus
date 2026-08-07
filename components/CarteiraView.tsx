import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useUserStore, Account } from '../store/userStore';
import { 
  Building2, 
  Landmark, 
  Banknote, 
  TrendingUp, 
  Plus, 
  RefreshCw, 
  ShieldCheck,
  PieChart as PieChartIcon,
  Wallet,
  Edit3,
  Trash2,
  X,
  Check,
  AlertCircle
} from 'lucide-react';

export const CarteiraView: React.FC = () => {
  const { t } = useTranslation('wallet');
  const accounts = useUserStore((state) => state.accounts);
  const isLoadingAccounts = useUserStore((state) => state.isLoadingAccounts);
  const accountsError = useUserStore((state) => state.accountsError);
  const fetchAccounts = useUserStore((state) => state.fetchAccounts);
  const createAccount = useUserStore((state) => state.createAccount);
  const updateAccount = useUserStore((state) => state.updateAccount);
  const deleteAccount = useUserStore((state) => state.deleteAccount);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formInstitution, setFormInstitution] = useState('');
  const [formType, setFormType] = useState('Conta Corrente');
  const [formBalance, setFormBalance] = useState('');
  const [formColor, setFormColor] = useState('#1E6B4B');
  const [formIcon, setFormIcon] = useState('Building2');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<Account | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch accounts on mount
  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const totalBalance = accounts.reduce((acc, curr) => acc + curr.balance, 0);

  // Icon mapping helper
  const getAccountIcon = (iconName?: string, name: string = '', type: string = '') => {
    if (iconName === 'Landmark') return Landmark;
    if (iconName === 'TrendingUp') return TrendingUp;
    if (iconName === 'Banknote') return Banknote;
    if (iconName === 'Wallet') return Wallet;
    if (iconName === 'Building2') return Building2;

    const lowerName = name.toLowerCase();
    const lowerType = type.toLowerCase();

    if (lowerName.includes('brasil') || lowerName.includes('itaú') || lowerName.includes('bradesco') || lowerType.includes('banco')) return Landmark;
    if (lowerType.includes('reserva') || lowerType.includes('invest')) return TrendingUp;
    if (lowerType.includes('dinheiro') || lowerName.includes('dinheiro') || lowerType.includes('carteira')) return Banknote;
    return Building2;
  };

  // Find account with highest balance
  const sortedAccounts = [...accounts].sort((a, b) => b.balance - a.balance);
  const topAccount = sortedAccounts[0] || null;

  // Real-time updates list derived from actual accounts
  const updates = accounts.slice(0, 3).map((acc, index) => {
    const times = ['Hoje', 'Ontem', 'Há 2 dias'];
    return {
      id: `up-${acc.id}`,
      time: times[index] || 'Hoje',
      description: `Saldo ${acc.name} atualizado`,
      detail: `Posição atual: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(acc.balance)}`
    };
  });

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val);
  };

  const openCreateModal = () => {
    setModalMode('create');
    setSelectedAccountId(null);
    setFormName('');
    setFormInstitution('');
    setFormType('Conta Corrente');
    setFormBalance('0');
    setFormColor('#1E6B4B');
    setFormIcon('Building2');
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (acc: Account) => {
    setModalMode('edit');
    setSelectedAccountId(acc.id);
    setFormName(acc.name);
    setFormInstitution(acc.institution || acc.name);
    setFormType(acc.type);
    setFormBalance(acc.balance.toString());
    setFormColor(acc.color || '#1E6B4B');
    setFormIcon(acc.icon || 'Building2');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formName.trim()) {
      setFormError('Por favor, informe o nome da conta.');
      return;
    }

    const numBalance = parseFloat(formBalance.replace(',', '.'));
    if (isNaN(numBalance)) {
      setFormError('Por favor, informe um saldo válido.');
      return;
    }

    setIsSubmitting(true);

    const accountPayload = {
      name: formName.trim(),
      institution: formInstitution.trim() || formName.trim(),
      type: formType,
      balance: numBalance,
      color: formColor,
      icon: formIcon,
      bgColor: getBgColorFromHex(formColor)
    };

    let result;
    if (modalMode === 'create') {
      result = await createAccount(accountPayload);
    } else if (selectedAccountId) {
      result = await updateAccount(selectedAccountId, accountPayload);
    }

    setIsSubmitting(false);

    if (result?.error) {
      setFormError(result.error);
    } else {
      setIsModalOpen(false);
    }
  };

  const openDeleteModal = (acc: Account) => {
    setAccountToDelete(acc);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!accountToDelete) return;
    setIsDeleting(true);
    const result = await deleteAccount(accountToDelete.id);
    setIsDeleting(false);

    if (result?.error) {
      alert(`Erro ao excluir: ${result.error}`);
    } else {
      setIsDeleteModalOpen(false);
      setAccountToDelete(null);
    }
  };

  const getBgColorFromHex = (hex: string) => {
    const col = hex.toLowerCase();
    if (col.includes('8a05be') || col.includes('purple')) return 'bg-purple-50 text-[#8A05BE] border-purple-100';
    if (col.includes('2563eb') || col.includes('blue')) return 'bg-blue-50 text-blue-600 border-blue-100';
    if (col.includes('f59e0b') || col.includes('amber')) return 'bg-amber-50 text-amber-600 border-amber-100';
    if (col.includes('ec7000') || col.includes('orange')) return 'bg-orange-50 text-orange-600 border-orange-100';
    if (col.includes('e11d48') || col.includes('rose')) return 'bg-rose-50 text-rose-600 border-rose-100';
    return 'bg-emerald-50 text-[#1E6B4B] border-emerald-100';
  };

  const COLOR_OPTIONS = [
    { hex: '#1E6B4B', name: 'Verde Grana+' },
    { hex: '#8A05BE', name: 'Roxo Nubank' },
    { hex: '#2563EB', name: 'Azul BB / Caixa' },
    { hex: '#EC7000', name: 'Laranja Itaú / Inter' },
    { hex: '#F59E0B', name: 'Amarelo Ouro' },
    { hex: '#E11D48', name: 'Vermelho Bradesco' },
    { hex: '#0284C7', name: 'Azul Claro XP' },
  ];

  const ICON_OPTIONS = [
    { id: 'Building2', label: 'Banco / Edifício', IconComponent: Building2 },
    { id: 'Landmark', label: 'Instituição', IconComponent: Landmark },
    { id: 'Banknote', label: 'Dinheiro', IconComponent: Banknote },
    { id: 'TrendingUp', label: 'Investimento', IconComponent: TrendingUp },
    { id: 'Wallet', label: 'Carteira', IconComponent: Wallet },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in-up pb-8">
      {/* Error Alert */}
      {accountsError && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-2xl text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{accountsError}</span>
          </div>
          <button onClick={() => fetchAccounts()} className="font-bold underline text-rose-800 cursor-pointer">
            Tentar novamente
          </button>
        </div>
      )}

      {/* 1. Resumo da Carteira (Card Principal) */}
      <div className="bg-white rounded-[28px] p-6 lg:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-slate-100/90 transition-all duration-300 hover:shadow-[0_14px_36px_rgba(0,0,0,0.05)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                {t('financialSummary', 'RESUMO FINANCEIRO')}
              </span>
              <span className="inline-flex items-center gap-1 bg-emerald-50 text-[#1E6B4B] text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-100">
                <ShieldCheck className="w-3 h-3 text-[#4CAF6A]" />
                {t('unifiedView', 'Visão Unificada')}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {t('title', 'Carteira')}
            </h1>
            <p className="text-xs sm:text-sm font-normal text-slate-500 mt-0.5">
              {t('subtitle', 'Onde seu dinheiro está hoje.')}
            </p>
          </div>

          {/* Botão de Ação Principal */}
          <div>
            <button
              onClick={openCreateModal}
              className="w-full sm:w-auto bg-[#1E6B4B] hover:bg-[#165037] text-white font-bold py-3 px-5 rounded-2xl shadow-xs hover:shadow transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 text-xs sm:text-sm"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>{t('addAccount', 'Adicionar Conta')}</span>
            </button>
          </div>
        </div>

        {/* Informações de Saldo e Contas */}
        {isLoadingAccounts ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
            <div className="space-y-2">
              <div className="h-3 w-20 bg-slate-100 rounded animate-pulse" />
              <div className="h-8 w-36 bg-slate-200/80 rounded-lg animate-pulse" />
              <div className="h-3 w-40 bg-slate-100 rounded animate-pulse" />
            </div>
            <div className="space-y-2 sm:border-l sm:border-slate-100 sm:pl-6">
              <div className="h-3 w-28 bg-slate-100 rounded animate-pulse" />
              <div className="h-8 w-24 bg-slate-200/80 rounded-lg animate-pulse" />
              <div className="h-3 w-32 bg-slate-100 rounded animate-pulse" />
            </div>
            <div className="space-y-2 lg:border-l lg:border-slate-100 lg:pl-6">
              <div className="h-3 w-28 bg-slate-100 rounded animate-pulse" />
              <div className="h-8 w-40 bg-slate-200/80 rounded-lg animate-pulse" />
              <div className="h-3 w-36 bg-slate-100 rounded animate-pulse" />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-400 block">
                Saldo Total
              </span>
              <div className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
                {formatCurrency(totalBalance)}
              </div>
              <p className="text-[11px] font-normal text-slate-400 pt-1 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#4CAF6A]" />
                Soma de todas as suas posições ativas
              </p>
            </div>

            <div className="space-y-1 sm:border-l sm:border-slate-100 sm:pl-6">
              <span className="text-xs font-semibold text-slate-400 block">
                Quantidade de Contas
              </span>
              <div className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
                {accounts.length} {accounts.length === 1 ? 'Conta' : 'Contas'}
              </div>
              <p className="text-[11px] font-normal text-slate-400 pt-1">
                {accounts.filter(a => a.balance > 0).length} ativas com saldo
              </p>
            </div>

            <div className="space-y-1 lg:border-l lg:border-slate-100 lg:pl-6 col-span-1 sm:col-span-2 lg:col-span-1">
              <span className="text-xs font-semibold text-slate-400 block">
                Maior Concentração
              </span>
              {topAccount ? (
                <>
                  <div className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: topAccount.color || '#1E6B4B' }} />
                    <span className="truncate">{topAccount.name}</span>
                    <span className="text-slate-500 font-medium text-sm">
                      ({totalBalance > 0 ? Math.round((topAccount.balance / totalBalance) * 100) : 100}%)
                    </span>
                  </div>
                  <p className="text-[11px] font-normal text-slate-400 pt-1">
                    {formatCurrency(topAccount.balance)} em {topAccount.type}
                  </p>
                </>
              ) : (
                <>
                  <div className="text-lg font-bold text-slate-400">Nenhuma conta</div>
                  <p className="text-[11px] font-normal text-slate-400 pt-1">Cadastre sua primeira conta</p>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Grid Principal: Lista de Contas (Esq) + Distribuição & Atualizações (Dir) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* 2. Lista de Contas (Cols 1 to 7) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-base font-semibold text-slate-900">
              Minhas Contas
            </h2>
            <span className="text-xs font-normal text-slate-400">
              {accounts.length} {accounts.length === 1 ? 'instituição cadastrada' : 'instituições cadastradas'}
            </span>
          </div>

          {isLoadingAccounts ? (
            /* Skeleton Loading State */
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-[24px] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-slate-100/90 flex items-center justify-between animate-pulse">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-slate-100 shrink-0" />
                    <div className="space-y-2">
                      <div className="h-4 w-28 bg-slate-200 rounded" />
                      <div className="h-3 w-20 bg-slate-100 rounded" />
                    </div>
                  </div>
                  <div className="space-y-2 text-right">
                    <div className="h-4 w-20 bg-slate-200 rounded ml-auto" />
                    <div className="h-3 w-12 bg-slate-100 rounded ml-auto" />
                  </div>
                </div>
              ))}
            </div>
          ) : accounts.length === 0 ? (
            /* Empty State Elegante */
            <div className="bg-white rounded-[28px] p-8 lg:p-12 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-slate-100/90 text-center flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-[#1E6B4B] border border-emerald-100/80 flex items-center justify-center shadow-xs">
                <Wallet className="w-8 h-8 stroke-[1.8]" />
              </div>

              <div className="max-w-md space-y-1">
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                  Você ainda não possui contas cadastradas.
                </h3>
                <p className="text-xs text-slate-500 font-normal leading-relaxed">
                  Cadastre suas contas bancárias para acompanhar seu saldo total e distribuição financeira em tempo real.
                </p>
              </div>

              <button
                onClick={openCreateModal}
                className="mt-2 inline-flex items-center gap-2 bg-[#1E6B4B] hover:bg-[#165037] text-white font-bold py-3 px-6 rounded-2xl text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar primeira conta</span>
              </button>
            </div>
          ) : (
            /* Lista Dinâmica de Contas */
            <div className="space-y-3">
              {accounts.map((acc) => {
                const Icon = getAccountIcon(acc.icon, acc.name, acc.type);
                const pct = totalBalance > 0 ? Math.round((acc.balance / totalBalance) * 100) : 0;
                return (
                  <div
                    key={acc.id}
                    className="bg-white rounded-[24px] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-slate-100/90 flex items-center justify-between transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_36px_rgba(0,0,0,0.05)] group"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${acc.bgColor || 'bg-emerald-50 text-[#1E6B4B] border-emerald-100'} shadow-2xs`}>
                        <Icon className="w-5.5 h-5.5 stroke-[2]" />
                      </div>

                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-slate-900 group-hover:text-[#1E6B4B] transition-colors truncate">
                          {acc.name}
                        </h3>
                        <p className="text-xs font-normal text-slate-400 mt-0.5 truncate">
                          {acc.institution && acc.institution !== acc.name ? `${acc.institution} • ` : ''}{acc.type}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 pl-2">
                      <div className="text-right">
                        <span className="text-base font-bold text-slate-900 tracking-tight block">
                          {formatCurrency(acc.balance)}
                        </span>
                        <span className="text-[11px] font-normal text-slate-400">
                          {pct}% do total
                        </span>
                      </div>

                      {/* Botões de Ação para Editar e Excluir */}
                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEditModal(acc)}
                          className="p-1.5 text-slate-400 hover:text-[#1E6B4B] hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                          title="Editar Conta"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(acc)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                          title="Excluir Conta"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Coluna Direita: Distribuição & Últimas Atualizações (Cols 8 to 12) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* 3. Distribuição Financeira */}
          <div className="bg-white rounded-[28px] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-slate-100/90 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_36px_rgba(0,0,0,0.05)]">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase block">
                DISTRIBUIÇÃO FINANCEIRA
              </span>
              <PieChartIcon className="w-4 h-4 text-slate-400" />
            </div>

            <h3 className="text-sm font-semibold text-slate-900 mb-4">
              Alocação do Saldo Por Conta
            </h3>

            {/* Visual Bars Breakdown */}
            {isLoadingAccounts ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="space-y-1.5 animate-pulse">
                    <div className="h-3 bg-slate-100 rounded w-full" />
                    <div className="h-2 bg-slate-100 rounded-full w-full" />
                  </div>
                ))}
              </div>
            ) : accounts.length === 0 ? (
              <p className="text-xs text-slate-400 font-normal py-4 text-center">
                Sem dados de distribuição para exibir.
              </p>
            ) : (
              <div className="space-y-3.5">
                {accounts.map((acc) => {
                  const pct = totalBalance > 0 ? Math.round((acc.balance / totalBalance) * 100) : 0;
                  return (
                    <div key={acc.id} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-800 flex items-center gap-1.5 truncate pr-2">
                          <span 
                            className="w-2.5 h-2.5 rounded-full inline-block shrink-0" 
                            style={{ backgroundColor: acc.color || '#1E6B4B' }} 
                          />
                          <span className="truncate">{acc.name}</span>
                        </span>
                        <span className="font-normal text-slate-500 shrink-0">
                          {formatCurrency(acc.balance)} <strong className="font-bold text-slate-800">({pct}%)</strong>
                        </span>
                      </div>

                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-700 ease-out"
                          style={{ 
                            width: `${pct}%`,
                            backgroundColor: acc.color || '#1E6B4B' 
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 5. Últimas Atualizações */}
          <div className="bg-white rounded-[28px] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-slate-100/90 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_36px_rgba(0,0,0,0.05)]">
            <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase mb-3 block">
              ÚLTIMAS ATUALIZAÇÕES
            </span>

            {updates.length === 0 ? (
              <p className="text-xs text-slate-400 py-2">Nenhuma atualização recente.</p>
            ) : (
              <div className="space-y-3 pt-1">
                {updates.map((up) => (
                  <div key={up.id} className="flex items-start gap-3 py-2 border-b border-slate-50 last:border-0">
                    <div className="w-7 h-7 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center shrink-0 mt-0.5">
                      <RefreshCw className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                          {up.time}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-900 mt-1">
                        {up.description}
                      </p>
                      <p className="text-[11px] font-normal text-slate-400 mt-0.5">
                        {up.detail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Modal para Adicionar / Editar Conta */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-[28px] max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 p-1 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#1E6B4B] flex items-center justify-center shrink-0 font-bold">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {modalMode === 'create' ? 'Adicionar Nova Conta' : 'Editar Conta'}
                </h3>
                <p className="text-xs text-slate-400">
                  {modalMode === 'create' 
                    ? 'Preencha os dados da sua instituição financeira' 
                    : 'Atualize os dados e o saldo da sua conta'}
                </p>
              </div>
            </div>

            {formError && (
              <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveAccount} className="space-y-4">
              {/* Nome da Conta */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nome da Conta *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Nubank, Banco do Brasil, Reserva"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#1E6B4B] focus:border-transparent transition-all"
                  required
                />
              </div>

              {/* Instituição */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Instituição Financeira
                </label>
                <input
                  type="text"
                  placeholder="Ex: Nubank, Itaú, XP, Mercado Pago"
                  value={formInstitution}
                  onChange={(e) => setFormInstitution(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#1E6B4B] focus:border-transparent transition-all"
                />
              </div>

              {/* Tipo de Conta */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tipo de Conta
                </label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#1E6B4B] focus:border-transparent bg-white transition-all cursor-pointer"
                >
                  <option value="Conta Corrente">Conta Corrente</option>
                  <option value="Conta Poupança">Conta Poupança</option>
                  <option value="Reserva de Emergência">Reserva de Emergência</option>
                  <option value="Investimentos">Investimentos</option>
                  <option value="Carteira Física">Carteira Física (Dinheiro)</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>

              {/* Saldo Inicial / Atual */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Saldo (R$) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formBalance}
                  onChange={(e) => setFormBalance(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1E6B4B] focus:border-transparent transition-all"
                  required
                />
              </div>

              {/* Seleção de Cor */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Cor da Conta
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {COLOR_OPTIONS.map((col) => (
                    <button
                      key={col.hex}
                      type="button"
                      onClick={() => setFormColor(col.hex)}
                      className="w-7 h-7 rounded-full transition-transform cursor-pointer relative flex items-center justify-center hover:scale-110"
                      style={{ backgroundColor: col.hex }}
                      title={col.name}
                    >
                      {formColor === col.hex && (
                        <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Seleção de Ícone */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Ícone
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {ICON_OPTIONS.map(({ id, IconComponent }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setFormIcon(id)}
                      className={`p-2.5 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                        formIcon === id
                          ? 'border-[#1E6B4B] bg-emerald-50 text-[#1E6B4B] ring-2 ring-emerald-500/20'
                          : 'border-slate-200 text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Botões do Modal */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-[#1E6B4B] hover:bg-[#165037] text-white font-bold rounded-xl text-xs shadow-xs hover:shadow transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Salva...</span>
                    </>
                  ) : (
                    <span>{modalMode === 'create' ? 'Salvar Conta' : 'Atualizar Conta'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {isDeleteModalOpen && accountToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-[28px] max-w-sm w-full p-6 shadow-2xl border border-slate-100 relative text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-100">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-slate-900 mb-1">
              Excluir conta?
            </h3>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Tem certeza que deseja excluir a conta <strong className="text-slate-800">{accountToDelete.name}</strong>? Esta ação não poderá ser desfeita no Supabase.
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setAccountToDelete(null);
                }}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-xs transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Excluindo...</span>
                  </>
                ) : (
                  <span>Excluir</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
