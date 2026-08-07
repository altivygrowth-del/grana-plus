import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { Transaction, CategoryBudget, TimePeriod, TransactionCategory } from '../types/financial';
import { useUserStore } from '../store/userStore';

interface FinancialContextType {
  transactions: Transaction[];
  budgets: CategoryBudget[];
  timePeriod: TimePeriod;
  setTimePeriod: (period: TimePeriod) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  addTransaction: (newTx: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  isAddModalOpen: boolean;
  setIsAddModalOpen: (open: boolean) => void;
  summary: {
    totalBalance: number;
    totalIncome: number;
    totalExpense: number;
    savingsRate: number;
  };
  categoriesList: TransactionCategory[];
}

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

export const CATEGORIES: TransactionCategory[] = [
  'Alimentação',
  'Moradia',
  'Transporte',
  'Lazer',
  'Saúde',
  'Educação',
  'Salário',
  'Investimentos',
  'Freelance',
  'Outros'
];

export const FinancialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const user = useUserStore((state) => state.user);
  const transactions = useUserStore((state) => state.transactions);
  const accounts = useUserStore((state) => state.accounts);
  const addTxStore = useUserStore((state) => state.addTransaction);
  const deleteTxStore = useUserStore((state) => state.deleteTransaction);
  const fetchTransactions = useUserStore((state) => state.fetchTransactions);
  const fetchAccounts = useUserStore((state) => state.fetchAccounts);
  const fetchCards = useUserStore((state) => state.fetchCards);
  const fetchGoals = useUserStore((state) => state.fetchGoals);
  const fetchAssets = useUserStore((state) => state.fetchAssets);

  useEffect(() => {
    fetchTransactions();
    fetchAccounts();
    fetchCards();
    fetchGoals();
    fetchAssets();
  }, [fetchTransactions, fetchAccounts, fetchCards, fetchGoals, fetchAssets]);

  const [timePeriod, setTimePeriod] = useState<TimePeriod>('this_month');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Compute category budgets dynamically from real transactions
  const budgets = useMemo(() => {
    const defaultLimits: Record<string, number> = {
      'Moradia': 3500.00,
      'Alimentação': 1500.00,
      'Investimentos': 3000.00,
      'Lazer': 800.00,
      'Transporte': 500.00,
      'Saúde': 800.00,
    };

    const spentMap: Record<string, number> = {};
    transactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        spentMap[t.category] = (spentMap[t.category] || 0) + t.amount;
      });

    const categoryColors: Record<string, string> = {
      'Moradia': 'bg-[#1E6B4B]',
      'Alimentação': 'bg-blue-500',
      'Investimentos': 'bg-indigo-500',
      'Lazer': 'bg-amber-500',
      'Transporte': 'bg-purple-500',
      'Saúde': 'bg-rose-500',
      'Educação': 'bg-orange-500',
      'Outros': 'bg-slate-500'
    };

    const categoryKeys = Array.from(new Set([...Object.keys(defaultLimits), ...Object.keys(spentMap)]));

    return categoryKeys.map((cat) => ({
      category: cat as TransactionCategory,
      budgeted: defaultLimits[cat] || (spentMap[cat] ? Math.ceil(spentMap[cat] * 1.2) : 1000),
      spent: spentMap[cat] || 0,
      color: categoryColors[cat] || 'bg-slate-500'
    }));
  }, [transactions]);

  const addTransaction = (newTx: Omit<Transaction, 'id'>) => {
    addTxStore(newTx);
  };

  const deleteTransaction = (id: string) => {
    deleteTxStore(id);
  };

  const summary = useMemo(() => {
    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach(tx => {
      if (tx.type === 'income') {
        totalIncome += tx.amount;
      } else {
        totalExpense += tx.amount;
      }
    });

    const totalBalance = accounts.length > 0
      ? accounts.reduce((sum, a) => sum + a.balance, 0)
      : user.currentBalance;

    return {
      totalBalance,
      totalIncome,
      totalExpense,
      savingsRate: totalIncome > 0 ? Math.max(0, Math.round(((totalIncome - totalExpense) / totalIncome) * 100)) : 0
    };
  }, [transactions, accounts, user.currentBalance]);

  return (
    <FinancialContext.Provider
      value={{
        transactions,
        budgets,
        timePeriod,
        setTimePeriod,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        addTransaction,
        deleteTransaction,
        isAddModalOpen,
        setIsAddModalOpen,
        summary,
        categoriesList: CATEGORIES
      }}
    >
      {children}
    </FinancialContext.Provider>
  );
};

export const useFinancial = () => {
  const context = useContext(FinancialContext);
  if (!context) {
    throw new Error('useFinancial deve ser usado dentro de um FinancialProvider');
  }
  return context;
};
