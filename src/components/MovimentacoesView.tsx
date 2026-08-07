import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useUserStore } from '../store/userStore';
import { Transaction, TransactionType, TransactionCategory } from '../types/financial';
import { formatCurrency } from '../lib/formatters';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Wallet, 
  Plus, 
  Trash2, 
  Edit3, 
  MoreVertical, 
  Utensils, 
  Car, 
  Home, 
  HeartPulse, 
  GraduationCap, 
  Smile, 
  Briefcase, 
  TrendingUp, 
  Tag,
  X,
  Calendar,
  Check,
  Building2,
  FileText,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

const CATEGORIES: TransactionCategory[] = [
  'Alimentação',
  'Transporte',
  'Moradia',
  'Saúde',
  'Educação',
  'Lazer',
  'Salário',
  'Investimentos',
  'Outros'
];

export const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Alimentação':
      return Utensils;
    case 'Transporte':
      return Car;
    case 'Moradia':
      return Home;
    case 'Saúde':
      return HeartPulse;
    case 'Educação':
      return GraduationCap;
    case 'Lazer':
      return Smile;
    case 'Salário':
      return Briefcase;
    case 'Investimentos':
      return TrendingUp;
    default:
      return Tag;
  }
};

export const MovimentacoesView: React.FC = () => {
  const { t } = useTranslation('transactions');
  const transactions = useUserStore((state) => state.transactions);
  const accounts = useUserStore((state) => state.accounts);
  const isLoadingTransactions = useUserStore((state) => state.isLoadingTransactions);
  const transactionsError = useUserStore((state) => state.transactionsError);

  const fetchTransactions = useUserStore((state) => state.fetchTransactions);
  const fetchAccounts = useUserStore((state) => state.fetchAccounts);
  const createTransaction = useUserStore((state) => state.createTransaction);
  const updateTransaction = useUserStore((state) => state.updateTransaction);
  const deleteTransaction = useUserStore((state) => state.deleteTransaction);

  // Fetch real data on mount
  useEffect(() => {
    fetchTransactions();
    fetchAccounts();
  }, [fetchTransactions, fetchAccounts]);

  // Filter state
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Menu Options state (for card dropdown)
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Form Fields
  const [formAccountId, setFormAccountId] = useState<string>('');
  const [formType, setFormType] = useState<TransactionType>('expense');
  const [formAmount, setFormAmount] = useState<string>('');
  const [formCategory, setFormCategory] = useState<TransactionCategory>('Alimentação');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formDate, setFormDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [formNotes, setFormNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Calculations for RESUMO
  const totalIncomes = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const netBalance = totalIncomes - totalExpenses;

  // Filtered transactions
  const filteredTransactions = transactions.filter((tx) => {
    if (filterType === 'income') return tx.type === 'income';
    if (filterType === 'expense') return tx.type === 'expense';
    return true;
  });

  // Sorted most recent first
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateB - dateA;
  });

  // Open Modal for Create
  const handleOpenCreateModal = () => {
    setEditingTransaction(null);
    setFormAccountId(accounts[0]?.id || '');
    setFormType('expense');
    setFormAmount('');
    setFormCategory('Alimentação');
    setFormDescription('');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormNotes('');
    setModalError(null);
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEditModal = (tx: Transaction) => {
    setEditingTransaction(tx);
    setFormAccountId(tx.accountId || accounts[0]?.id || '');
    setFormType(tx.type);
    setFormAmount(tx.amount.toString());
    setFormCategory(tx.category as TransactionCategory);
    setFormDescription(tx.description);
    setFormDate(tx.date || new Date().toISOString().split('T')[0]);
    setFormNotes(tx.notes || '');
    setModalError(null);
    setActiveMenuId(null);
    setIsModalOpen(true);
  };

  // Handle Save (Create or Update)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    const numAmount = parseFloat(formAmount.replace(',', '.'));
    if (isNaN(numAmount) || numAmount <= 0) {
      setModalError('Por favor, informe um valor válido.');
      return;
    }

    if (!formDescription.trim()) {
      setModalError('Por favor, informe uma descrição.');
      return;
    }

    setIsSubmitting(true);

    const txPayload = {
      accountId: formAccountId || undefined,
      type: formType,
      amount: numAmount,
      category: formCategory,
      description: formDescription.trim(),
      date: formDate,
      notes: formNotes.trim() || undefined,
      status: 'completed' as const
    };

    if (editingTransaction) {
      await updateTransaction(editingTransaction.id, txPayload);
    } else {
      await createTransaction(txPayload);
    }

    setIsSubmitting(false);
    setIsModalOpen(false);
  };

  // Handle Delete
  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta movimentação?')) {
      await deleteTransaction(id);
      setActiveMenuId(null);
    }
  };

  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('T')[0].split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  const getAccountName = (accId?: string) => {
    if (!accId) return null;
    const acc = accounts.find(a => a.id === accId);
    return acc ? acc.name : null;
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in-up pb-24 relative">
      
      {/* HEADER TELA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase block mb-1">
            {t('management', 'GESTÃO FINANCEIRA')}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {t('title', 'Movimentações')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {t('subtitle', 'Histórico completo e registro de todas as suas receitas e despesas.')}
          </p>
        </div>

        <div>
          <button
            onClick={handleOpenCreateModal}
            className="w-full sm:w-auto bg-[#1E6B4B] hover:bg-[#165037] text-white font-bold py-3 px-5 rounded-2xl shadow-xs hover:shadow transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 text-xs sm:text-sm"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>{t('newTransaction', 'Adicionar Movimentação')}</span>
          </button>
        </div>
      </div>

      {/* ERROR ALERT */}
      {transactionsError && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-2xl text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{transactionsError}</span>
          </div>
          <button onClick={() => fetchTransactions()} className="font-bold underline text-rose-800 cursor-pointer">
            Tentar novamente
          </button>
        </div>
      )}

      {/* 1. RESUMO (3 CARDS CALCULADOS AUTOMATICAMENTE) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
        {/* Entradas do mês */}
        <div className="bg-white rounded-[24px] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-slate-100/90 transition-all duration-300 hover:shadow-[0_14px_36px_rgba(0,0,0,0.05)]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Entradas do Mês
            </span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-[#1E6B4B] flex items-center justify-center border border-emerald-100">
              <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 tracking-tight">
            {formatCurrency(totalIncomes)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Soma de todas as receitas
          </p>
        </div>

        {/* Saídas do mês */}
        <div className="bg-white rounded-[24px] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-slate-100/90 transition-all duration-300 hover:shadow-[0_14px_36px_rgba(0,0,0,0.05)]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Saídas do Mês
            </span>
            <div className="w-9 h-9 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
              <ArrowDownLeft className="w-5 h-5 stroke-[2.5]" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-rose-600 tracking-tight">
            {formatCurrency(totalExpenses)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Soma de todas as despesas
          </p>
        </div>

        {/* Saldo do mês */}
        <div className="bg-white rounded-[24px] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-slate-100/90 transition-all duration-300 hover:shadow-[0_14px_36px_rgba(0,0,0,0.05)]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Saldo do Mês
            </span>
            <div className="w-9 h-9 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200">
              <Wallet className="w-5 h-5 stroke-[2]" />
            </div>
          </div>
          <div className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${netBalance >= 0 ? 'text-slate-900' : 'text-rose-600'}`}>
            {formatCurrency(netBalance)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Balanço acumulado no período
          </p>
        </div>
      </div>

      {/* 2. FILTROS (3 Opções: Todos, Receitas, Despesas) */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-4">
        <button
          onClick={() => setFilterType('all')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            filterType === 'all'
              ? 'bg-[#1E6B4B] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          Todos ({transactions.length})
        </button>

        <button
          onClick={() => setFilterType('income')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
            filterType === 'income'
              ? 'bg-[#1E6B4B] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          <ArrowUpRight className="w-4 h-4 text-emerald-400" />
          <span>Receitas</span>
        </button>

        <button
          onClick={() => setFilterType('expense')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
            filterType === 'expense'
              ? 'bg-[#1E6B4B] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          <ArrowDownLeft className="w-4 h-4 text-rose-400" />
          <span>Despesas</span>
        </button>
      </div>

      {/* 3. LISTA DE MOVIMENTAÇÕES (SKELETON / EMPTY / LISTA) */}
      <div className="space-y-3">
        {isLoadingTransactions ? (
          /* Skeleton Loading State */
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-[24px] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-slate-100 flex items-center justify-between animate-pulse">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-slate-100 shrink-0" />
                  <div className="space-y-2">
                    <div className="h-4 w-36 bg-slate-200 rounded" />
                    <div className="h-3 w-24 bg-slate-100 rounded" />
                  </div>
                </div>
                <div className="space-y-2 text-right">
                  <div className="h-4 w-20 bg-slate-200 rounded ml-auto" />
                  <div className="h-3 w-16 bg-slate-100 rounded ml-auto" />
                </div>
              </div>
            ))}
          </div>
        ) : sortedTransactions.length === 0 ? (
          /* Empty State Elegante */
          <div className="bg-white rounded-[28px] p-8 sm:p-12 text-center border border-slate-100/90 shadow-[0_10px_30px_rgba(0,0,0,0.03)] flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-[#1E6B4B] border border-emerald-100 flex items-center justify-center shadow-xs">
              <Wallet className="w-8 h-8 stroke-[1.8]" />
            </div>

            <div className="max-w-md space-y-1">
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                Nenhuma movimentação encontrada.
              </h3>
              <p className="text-xs text-slate-500 font-normal leading-relaxed">
                Cadastre suas receitas e despesas para manter suas finanças organizadas em tempo real.
              </p>
            </div>

            <button
              onClick={handleOpenCreateModal}
              className="mt-2 inline-flex items-center gap-2 bg-[#1E6B4B] hover:bg-[#165037] text-white font-bold py-3 px-6 rounded-2xl text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar movimentação</span>
            </button>
          </div>
        ) : (
          /* Lista Dinâmica de Movimentações Reais */
          sortedTransactions.map((tx) => {
            const IconComponent = getCategoryIcon(tx.category);
            const isIncome = tx.type === 'income';
            const accountName = getAccountName(tx.accountId);

            return (
              <div
                key={tx.id}
                className="bg-white rounded-[24px] p-4 sm:p-5 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-slate-100/90 flex items-center justify-between gap-4 transition-all duration-300 hover:shadow-[0_14px_36px_rgba(0,0,0,0.05)] relative group"
              >
                {/* Esquerda: Ícone + Descrição + Categoria + Conta + Data */}
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <div
                    className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs border ${
                      isIncome
                        ? 'bg-emerald-50 text-[#1E6B4B] border-emerald-100'
                        : 'bg-rose-50 text-rose-600 border-rose-100'
                    }`}
                  >
                    <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2]" />
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                      {tx.description}
                    </h3>

                    <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400 flex-wrap">
                      <span className="font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md text-[11px]">
                        {tx.category}
                      </span>

                      {accountName && (
                        <span className="font-semibold text-emerald-800 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md text-[11px] flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-[#1E6B4B]" />
                          {accountName}
                        </span>
                      )}

                      <span>•</span>
                      <span className="flex items-center gap-1 text-[11px]">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {formatDateDisplay(tx.date)}
                      </span>
                    </div>

                    {tx.notes && (
                      <p className="text-[11px] text-slate-400 mt-1 italic flex items-center gap-1 truncate">
                        <FileText className="w-3 h-3 shrink-0 text-slate-400" />
                        <span>{tx.notes}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Direita: Valor (Verde/Vermelho) + Menu de Opções */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span
                      className={`text-base sm:text-lg font-extrabold tracking-tight block ${
                        isIncome ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {isIncome ? '+' : '-'} {formatCurrency(tx.amount)}
                    </span>
                  </div>

                  {/* Options Dropdown Trigger */}
                  <div className="relative">
                    <button
                      onClick={() => setActiveMenuId(activeMenuId === tx.id ? null : tx.id)}
                      className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                      title="Opções"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>

                    {/* Menu Popover */}
                    {activeMenuId === tx.id && (
                      <div className="absolute right-0 top-10 w-36 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-20 animate-fade-in-up">
                        <button
                          onClick={() => handleOpenEditModal(tx)}
                          className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                          <span>Editar</span>
                        </button>
                        <button
                          onClick={() => handleDelete(tx.id)}
                          className="w-full text-left px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                          <span>Excluir</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 4. MODAL DE MOVIMENTAÇÃO */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-[32px] max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto">
            
            {/* Header Modal */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">
                  {editingTransaction ? 'Editar Movimentação' : 'Nova Movimentação'}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Preencha os dados abaixo para registrar no Supabase.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {modalError && (
              <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              
              {/* Campo: Conta Vinculada */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5 uppercase tracking-wider">
                  Conta Financeira
                </label>
                <select
                  value={formAccountId}
                  onChange={(e) => setFormAccountId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-900 focus:bg-white focus:border-[#1E6B4B] focus:ring-2 focus:ring-[#1E6B4B]/20 outline-none transition-all cursor-pointer"
                >
                  <option value="">Nenhuma conta selecionada</option>
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({formatCurrency(acc.balance)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Campo: Tipo (Receita / Despesa) */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5 uppercase tracking-wider">
                  Tipo de Movimentação *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormType('income')}
                    className={`py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                      formType === 'income'
                        ? 'bg-emerald-50 text-[#1E6B4B] border-emerald-300 ring-2 ring-emerald-500/20'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                    <span>Receita</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormType('expense')}
                    className={`py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                      formType === 'expense'
                        ? 'bg-rose-50 text-rose-600 border-rose-300 ring-2 ring-rose-500/20'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <ArrowDownLeft className="w-4 h-4 text-rose-600" />
                    <span>Despesa</span>
                  </button>
                </div>
              </div>

              {/* Campo: Valor */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5 uppercase tracking-wider">
                  Valor (R$) *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                    R$
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0,00"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-sm font-bold text-slate-900 focus:bg-white focus:border-[#1E6B4B] focus:ring-2 focus:ring-[#1E6B4B]/20 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Campo: Categoria */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5 uppercase tracking-wider">
                  Categoria *
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as TransactionCategory)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 focus:bg-white focus:border-[#1E6B4B] focus:ring-2 focus:ring-[#1E6B4B]/20 outline-none transition-all cursor-pointer"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Campo: Descrição */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5 uppercase tracking-wider">
                  Descrição *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Supermercado, Salário Mês, Posto Shell..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white focus:border-[#1E6B4B] focus:ring-2 focus:ring-[#1E6B4B]/20 outline-none transition-all"
                />
              </div>

              {/* Campo: Data */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5 uppercase tracking-wider">
                  Data *
                </label>
                <input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white focus:border-[#1E6B4B] focus:ring-2 focus:ring-[#1E6B4B]/20 outline-none transition-all cursor-pointer"
                />
              </div>

              {/* Campo: Observação (opcional) */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5 uppercase tracking-wider">
                  Observação (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Detalhes adicionais, comprovante..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white focus:border-[#1E6B4B] focus:ring-2 focus:ring-[#1E6B4B]/20 outline-none transition-all"
                />
              </div>

              {/* Botões: Cancelar / Salvar */}
              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-4 rounded-2xl text-xs sm:text-sm transition-all cursor-pointer text-center"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-[#1E6B4B] hover:bg-[#165037] text-white font-bold py-3 px-4 rounded-2xl text-xs sm:text-sm shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Salvando...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 stroke-[2.5]" />
                      <span>Salvar</span>
                    </>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
