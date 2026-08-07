import { create } from 'zustand';
import { Transaction } from '../types/financial';
import { transactionsService } from '../services/transactions/transactions.service';
import { accountsService } from '../services/accounts/accounts.service';
import cardsService from '../services/cards/cards.service';
import goalsService from '../services/goals/goals.service';
import assetsService from '../services/assets/assets.service';
import { supabase } from '../lib/supabase';
import { authService } from '../services/auth/auth.service';
import { ProfileService } from '../services/profile/profileService';
import { SettingsService } from '../services/settings/settings.service';
import i18n from '../i18n';
import { User, Session } from '@supabase/supabase-js';
import { UserProfileData } from '../services/auth/auth.types';

export interface Account {
  id: string;
  name: string;
  institution?: string;
  type: string;
  balance: number;
  color: string;
  bgColor?: string;
  icon?: string;
  lastUpdated?: string;
}

export interface CreditCardItem {
  id: string;
  name: string;
  bank?: string;
  brand?: string;
  lastFourDigits?: string;
  totalLimit: number;
  currentUsage: number;
  closingDate?: string;
  dueDate: string;
  color?: string;
}

export interface FinancialGoalItem {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  icon?: string;
  color?: string;
  createdAt?: string;
}

export type AssetCategory = 'Contas' | 'Investimentos' | 'Imóveis' | 'Veículos' | 'Criptoativos' | 'Outros' | 'Outros Bens';

export interface AssetItem {
  id: string;
  name: string;
  category: AssetCategory;
  value: number;
  acquisitionDate?: string;
  lastUpdated?: string;
  notes?: string;
}

export interface UserProfile {
  name: string;
  email?: string;
  avatarUrl?: string;
  monthlyIncome: number;
  currentBalance: number;
  financialGoal: string;
  hasCreditCard: boolean;
  isOnboarded: boolean;
  theme?: 'light' | 'dark' | 'system' | 'claro' | 'escuro' | 'sistema';
  language?: string;
  currency?: string;
  dateFormat?: string;
  notifications?: {
    reminders: boolean;
    insights: boolean;
    updates: boolean;
  };
}

export interface UserStoreState {
  user: UserProfile;
  accounts: Account[];
  transactions: Transaction[];
  cards: CreditCardItem[];
  goals: FinancialGoalItem[];
  assets: AssetItem[];
  isLoadingTransactions: boolean;
  transactionsError: string | null;
  isLoadingAccounts: boolean;
  accountsError: string | null;
  isLoadingCards: boolean;
  cardsError: string | null;
  isLoadingGoals: boolean;
  goalsError: string | null;
  isLoadingAssets: boolean;
  assetsError: string | null;

  // Auth State
  authUser: User | null;
  authSession: Session | null;
  isAuthenticated: boolean;
  isLoadingAuth: boolean;
  authError: string | null;

  // Auth Actions
  initAuth: () => Promise<void>;
  setAuthSession: (session: Session | null, user: User | null, profile?: UserProfileData | null) => void;
  logout: () => Promise<void>;

  // Actions
  setName: (name: string) => void;
  setMonthlyIncome: (income: number) => void;
  setCurrentBalance: (balance: number) => void;
  setFinancialGoal: (goal: string) => void;
  setHasCreditCard: (hasCreditCard: boolean) => void;
  setAccounts: (accounts: Account[]) => void;
  fetchAccounts: () => Promise<void>;
  createAccount: (account: Omit<Account, 'id'>) => Promise<{ error?: string }>;
  updateAccount: (id: string, account: Partial<Account>) => Promise<{ error?: string }>;
  deleteAccount: (id: string) => Promise<{ error?: string }>;
  setTransactions: (transactions: Transaction[]) => void;
  fetchTransactions: () => Promise<void>;
  setCards: (cards: CreditCardItem[]) => void;
  fetchCards: () => Promise<void>;
  setGoals: (goals: FinancialGoalItem[]) => void;
  fetchGoals: () => Promise<void>;
  setAssets: (assets: AssetItem[]) => void;
  fetchAssets: () => Promise<void>;
  addGoalContribution: (goalId: string, amount: number, accountId?: string, notes?: string, date?: string) => Promise<{ success?: boolean; error?: string }>;
  
  // High-level actions
  setOnboardingData: (data: {
    monthlyIncome: number;
    currentBalance: number;
    financialGoal: string;
    hasCreditCard: boolean;
    cardNames?: string[];
  }) => void;
  
  addAccount: (account: Omit<Account, 'id'>) => void;
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  createTransaction: (tx: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, tx: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;

  // Goals Actions
  createGoal: (goal: Omit<FinancialGoalItem, 'id'>) => void;
  updateGoal: (id: string, goal: Partial<FinancialGoalItem>) => void;
  deleteGoal: (id: string) => void;

  // Cards Actions
  createCard: (card: Omit<CreditCardItem, 'id' | 'currentUsage'> & { currentUsage?: number }) => void;
  updateCard: (id: string, card: Partial<CreditCardItem>) => void;
  deleteCard: (id: string) => void;

  // Assets Actions
  createAsset: (asset: Omit<AssetItem, 'id'>) => Promise<{ data?: AssetItem; error?: string }>;
  updateAsset: (id: string, asset: Partial<AssetItem>) => Promise<{ data?: AssetItem; error?: string }>;
  deleteAsset: (id: string) => Promise<{ success?: boolean; error?: string }>;

  // Profile Actions
  updateProfile: (profile: Partial<UserProfile>) => void;

  resetUser: () => void;
}

const DEFAULT_USER: UserProfile = {
  name: '',
  email: '',
  avatarUrl: undefined,
  monthlyIncome: 0,
  currentBalance: 0,
  financialGoal: 'emergency',
  hasCreditCard: false,
  isOnboarded: false,
  theme: 'system',
  language: 'Português',
  currency: 'Real (BRL)',
  dateFormat: 'DD/MM/AAAA',
  notifications: {
    reminders: true,
    insights: true,
    updates: false,
  }
};

const DEFAULT_ACCOUNTS: Account[] = [];

const DEFAULT_CARDS: CreditCardItem[] = [];

const DEFAULT_GOALS: FinancialGoalItem[] = [];

const DEFAULT_ASSETS: AssetItem[] = [];

export const useUserStore = create<UserStoreState>((set, get) => ({
  user: DEFAULT_USER,
  accounts: [],
  transactions: [],
  cards: [],
  goals: DEFAULT_GOALS,
  assets: DEFAULT_ASSETS,
  isLoadingTransactions: false,
  transactionsError: null,
  isLoadingAccounts: false,
  accountsError: null,
  isLoadingCards: false,
  cardsError: null,
  isLoadingGoals: false,
  goalsError: null,
  isLoadingAssets: false,
  assetsError: null,

  // Auth Initial State
  authUser: null,
  authSession: null,
  isAuthenticated: false,
  isLoadingAuth: true,
  authError: null,

  initAuth: async () => {
    set({ isLoadingAuth: true, authError: null });

    try {
      // 1. Get initial session
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        set({ isLoadingAuth: false, authError: error.message });
      } else if (session?.user) {
        const profile = await ProfileService.getProfile(session.user.id, session.user);
        get().setAuthSession(session, session.user, profile);
      } else {
        set({
          authUser: null,
          authSession: null,
          isAuthenticated: false,
          isLoadingAuth: false,
          user: DEFAULT_USER
        });
      }

      // 2. Listen to Auth State Changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          const profile = await ProfileService.getProfile(session.user.id, session.user);
          get().setAuthSession(session, session.user, profile);
        } else {
          set({
            authUser: null,
            authSession: null,
            isAuthenticated: false,
            isLoadingAuth: false,
            user: DEFAULT_USER
          });
        }
      });
    } catch (err: any) {
      set({
        isLoadingAuth: false,
        authError: err?.message || 'Erro ao inicializar autenticação'
      });
    }
  },

  setAuthSession: (session, user, profile) => {
    if (!session || !user) {
      set({
        authSession: null,
        authUser: null,
        isAuthenticated: false,
        isLoadingAuth: false,
        user: DEFAULT_USER
      });
      return;
    }

    const userName = profile?.name || user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Usuário';
    const userEmail = profile?.email || user.email || '';
    const avatarUrl = profile?.avatar_url || user.user_metadata?.avatar_url || undefined;
    const isOnboarded = profile?.onboarding_completed ?? false;

    set((state) => ({
      authSession: session,
      authUser: user,
      isAuthenticated: true,
      isLoadingAuth: false,
      user: {
        ...state.user,
        name: userName,
        email: userEmail,
        avatarUrl: avatarUrl,
        currency: profile?.currency || 'Real (BRL)',
        monthlyIncome: profile?.monthly_income !== undefined && profile?.monthly_income !== null ? Number(profile.monthly_income) : 0,
        currentBalance: profile?.current_balance !== undefined && profile?.current_balance !== null ? Number(profile.current_balance) : 0,
        hasCreditCard: profile?.has_credit_card ?? false,
        isOnboarded: isOnboarded
      }
    }));

    // Fetch settings (theme, language, currency) from Supabase settings table
    SettingsService.getSettings(user.id).then((settings) => {
      if (settings) {
        if (settings.language) {
          i18n.changeLanguage(settings.language);
          localStorage.setItem('grana_language', settings.language);
        }
        if (settings.currency) {
          localStorage.setItem('grana_currency', settings.currency);
        }
        set((state) => ({
          user: {
            ...state.user,
            theme: settings.theme || state.user.theme,
            language: settings.language || state.user.language,
            currency: settings.currency || state.user.currency,
          }
        }));
      }
    }).catch((err) => {
      console.warn('Erro ao carregar configurações de preferência:', err);
    });

    // Auto fetch user's transactions, accounts, cards, goals and assets on login
    get().fetchTransactions();
    get().fetchAccounts();
    get().fetchCards();
    get().fetchGoals();
    get().fetchAssets();
  },

  logout: async () => {
    set({ isLoadingAuth: true });
    await authService.signOut();
    set({
      authSession: null,
      authUser: null,
      isAuthenticated: false,
      isLoadingAuth: false,
      user: DEFAULT_USER,
      accounts: [],
      cards: [],
      goals: [],
      assets: [],
      transactions: []
    });
  },

  setName: (name) => set((state) => ({ user: { ...state.user, name } })),
  
  setMonthlyIncome: (monthlyIncome) => 
    set((state) => ({ user: { ...state.user, monthlyIncome } })),
    
  setCurrentBalance: (currentBalance) => 
    set((state) => ({ user: { ...state.user, currentBalance } })),
    
  setFinancialGoal: (financialGoal) => 
    set((state) => ({ user: { ...state.user, financialGoal } })),
    
  setHasCreditCard: (hasCreditCard) => 
    set((state) => ({ user: { ...state.user, hasCreditCard } })),
    
  setAccounts: (accounts) => set({ accounts }),

  fetchAccounts: async () => {
    set({ isLoadingAccounts: true, accountsError: null });
    const { data, error } = await accountsService.getAccounts();
    if (error) {
      set({ accountsError: error, isLoadingAccounts: false });
    } else {
      const accountsList = data || [];
      const totalAccountsBalance = accountsList.reduce((sum, a) => sum + a.balance, 0);
      set((state) => ({
        accounts: accountsList,
        isLoadingAccounts: false,
        accountsError: null,
        user: {
          ...state.user,
          currentBalance: accountsList.length > 0 ? totalAccountsBalance : state.user.currentBalance
        }
      }));
    }
  },

  createAccount: async (accData) => {
    const tempId = `acc-${Date.now()}`;
    const newAcc: Account = {
      ...accData,
      id: tempId,
      bgColor: accData.bgColor || 'bg-emerald-50 text-[#1E6B4B] border-emerald-100',
      lastUpdated: 'Hoje'
    };

    set((state) => {
      const updatedAccounts = [newAcc, ...state.accounts];
      const newTotal = updatedAccounts.reduce((sum, a) => sum + a.balance, 0);
      return {
        accounts: updatedAccounts,
        user: { ...state.user, currentBalance: newTotal }
      };
    });

    const { data, error } = await accountsService.createAccount(accData);
    if (error) {
      set((state) => ({
        accounts: state.accounts.filter((a) => a.id !== tempId),
        accountsError: error
      }));
      return { error };
    } else if (data) {
      set((state) => {
        const updated = state.accounts.map((a) => (a.id === tempId ? data : a));
        const newTotal = updated.reduce((sum, a) => sum + a.balance, 0);
        return {
          accounts: updated,
          user: { ...state.user, currentBalance: newTotal }
        };
      });
    }
    return {};
  },

  updateAccount: async (id, updates) => {
    set((state) => {
      const updatedAccounts = state.accounts.map((a) =>
        a.id === id ? { ...a, ...updates, lastUpdated: 'Hoje' } : a
      );
      const newTotal = updatedAccounts.reduce((sum, a) => sum + a.balance, 0);
      return {
        accounts: updatedAccounts,
        user: { ...state.user, currentBalance: newTotal }
      };
    });

    const { data, error } = await accountsService.updateAccount(id, updates);
    if (error) {
      set({ accountsError: error });
      return { error };
    } else if (data) {
      set((state) => {
        const updated = state.accounts.map((a) => (a.id === id ? data : a));
        const newTotal = updated.reduce((sum, a) => sum + a.balance, 0);
        return {
          accounts: updated,
          user: { ...state.user, currentBalance: newTotal }
        };
      });
    }
    return {};
  },

  deleteAccount: async (id) => {
    let previousAccounts: Account[] = [];
    set((state) => {
      previousAccounts = state.accounts;
      const updatedAccounts = state.accounts.filter((a) => a.id !== id);
      const newTotal = updatedAccounts.reduce((sum, a) => sum + a.balance, 0);
      return {
        accounts: updatedAccounts,
        user: { ...state.user, currentBalance: newTotal }
      };
    });

    const { success, error } = await accountsService.deleteAccount(id);
    if (!success && error) {
      set({ accounts: previousAccounts, accountsError: error });
      return { error };
    }
    return {};
  },
  
  setTransactions: (transactions) => set({ transactions }),

  fetchTransactions: async () => {
    set({ isLoadingTransactions: true, transactionsError: null });
    const { data, error } = await transactionsService.getTransactions();
    if (error) {
      set({ transactionsError: error, isLoadingTransactions: false });
    } else {
      set({
        transactions: data || [],
        isLoadingTransactions: false,
        transactionsError: null
      });
    }
  },
  
  setCards: (cards) => set({ cards }),

  fetchCards: async () => {
    set({ isLoadingCards: true, cardsError: null });
    const { data, error } = await cardsService.getCards();
    if (error) {
      set({ cardsError: error, isLoadingCards: false });
    } else {
      set({
        cards: data || [],
        isLoadingCards: false,
        cardsError: null
      });
    }
  },

  setGoals: (goals) => set({ goals }),

  fetchGoals: async () => {
    set({ isLoadingGoals: true, goalsError: null });
    const { data, error } = await goalsService.getGoals();
    if (error) {
      set({ goalsError: error, isLoadingGoals: false });
    } else {
      set({
        goals: data || [],
        isLoadingGoals: false,
        goalsError: null
      });
    }
  },

  setAssets: (assets) => set({ assets }),

  fetchAssets: async () => {
    set({ isLoadingAssets: true, assetsError: null });
    const { data, error } = await assetsService.getAssets();
    if (error) {
      set({ assetsError: error, isLoadingAssets: false });
    } else {
      set({
        assets: data || [],
        isLoadingAssets: false,
        assetsError: null
      });
    }
  },

  setOnboardingData: ({ monthlyIncome, currentBalance, financialGoal, hasCreditCard, cardNames = [] }) => {
    const authUser = get().authUser;

    // Persist to Supabase if authenticated
    if (authUser) {
      supabase
        .from('profiles')
        .update({
          monthly_income: monthlyIncome,
          current_balance: currentBalance,
          has_credit_card: hasCreditCard,
          onboarding_completed: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', authUser.id)
        .then(({ error }) => {
          if (error) console.error('Erro ao salvar onboarding no Supabase:', error.message);
        });

      // Persist onboarding cards if any
      if (hasCreditCard) {
        const namesToCreate = cardNames.length > 0 ? cardNames : ['Nubank'];
        namesToCreate.forEach((cName) => {
          cardsService.createCard({
            name: cName,
            bank: cName,
            brand: 'Mastercard',
            lastFourDigits: '4321',
            totalLimit: Math.round(monthlyIncome * 0.8) || 5000,
            currentUsage: 0,
            closingDate: 'Dia 05',
            dueDate: 'Dia 12',
            color: '#165037'
          }).then(() => {
            get().fetchCards();
          });
        });
      }
    }

    set((state) => {
      // If user provided cards during onboarding, build credit cards list
      const newCards: CreditCardItem[] = hasCreditCard && cardNames.length > 0
        ? cardNames.map((cName, idx) => ({
            id: `card-${idx + 1}`,
            name: cName,
            currentUsage: Math.round(monthlyIncome * 0.25),
            totalLimit: Math.round(monthlyIncome * 0.8),
            dueDate: '12/08'
          }))
        : hasCreditCard
          ? [
              {
                id: 'card-1',
                name: 'Nubank',
                currentUsage: Math.round(monthlyIncome * 0.25),
                totalLimit: Math.round(monthlyIncome * 0.8),
                dueDate: '12/08'
              }
            ]
          : [];

      // Account logic: If balance is specified, ensure there's a primary account "Conta Principal" if no accounts or custom balance
      const newAccounts: Account[] = [
        {
          id: 'acc-main',
          name: 'Conta Principal',
          type: 'Conta Corrente',
          balance: currentBalance,
          color: '#1E6B4B',
          bgColor: 'bg-emerald-50 text-[#1E6B4B] border-emerald-100',
          lastUpdated: 'Hoje'
        }
      ];

      return {
        user: {
          ...state.user,
          monthlyIncome,
          currentBalance,
          financialGoal,
          hasCreditCard,
          isOnboarded: true,
        },
        accounts: newAccounts,
        cards: newCards,
      };
    });
  },

  addAccount: (accountData) => set((state) => {
    const newAcc: Account = {
      ...accountData,
      id: `acc-${Date.now()}`
    };
    const updatedAccounts = [...state.accounts, newAcc];
    const newTotalBalance = updatedAccounts.reduce((sum, a) => sum + a.balance, 0);
    return {
      accounts: updatedAccounts,
      user: { ...state.user, currentBalance: newTotalBalance }
    };
  }),

  addTransaction: async (txData) => {
    const tempId = `tx-${Date.now()}`;
    const newTx: Transaction = {
      ...txData,
      id: tempId
    };

    set((state) => {
      const updatedTxs = [newTx, ...state.transactions];

      // Update account balance if accountId is specified
      let updatedAccounts = state.accounts;
      if (txData.accountId) {
        const delta = txData.type === 'income' ? txData.amount : -txData.amount;
        updatedAccounts = state.accounts.map((acc) => {
          if (acc.id === txData.accountId) {
            return {
              ...acc,
              balance: acc.balance + delta,
              lastUpdated: 'Hoje'
            };
          }
          return acc;
        });
      }

      const newTotalBalance = updatedAccounts.reduce((sum, a) => sum + a.balance, 0);

      // Automatic update of Card usage when registering an expense on Credit Card
      let updatedCards = state.cards;
      if (txData.type === 'expense' && txData.paymentMethod === 'Cartão de Crédito' && state.cards.length > 0) {
        updatedCards = state.cards.map((card, idx) => {
          if (idx === 0) {
            return {
              ...card,
              currentUsage: card.currentUsage + txData.amount
            };
          }
          return card;
        });
      }

      return {
        transactions: updatedTxs,
        accounts: updatedAccounts,
        cards: updatedCards,
        user: {
          ...state.user,
          currentBalance: updatedAccounts.length > 0 ? newTotalBalance : Math.max(0, state.user.currentBalance + (txData.type === 'income' ? txData.amount : -txData.amount))
        }
      };
    });

    // Synchronize transaction with Supabase
    const { data, error } = await transactionsService.createTransaction(txData);
    if (error) {
      set({ transactionsError: error });
    } else if (data) {
      set((state) => ({
        transactions: state.transactions.map((t) => (t.id === tempId ? data : t))
      }));
    }

    // Persist updated account balance to Supabase
    if (txData.accountId) {
      const targetAcc = get().accounts.find((a) => a.id === txData.accountId);
      if (targetAcc && !targetAcc.id.startsWith('acc-')) {
        accountsService.updateAccount(targetAcc.id, { balance: targetAcc.balance });
      }
    }
  },

  createTransaction: async (txData) => {
    await get().addTransaction(txData);
  },

  updateTransaction: async (id, updatedFields) => {
    let oldTx: Transaction | undefined;
    set((state) => {
      oldTx = state.transactions.find((t) => t.id === id);
      if (!oldTx) return state;

      const newTx: Transaction = { ...oldTx, ...updatedFields };
      const updatedTxs = state.transactions.map((t) => (t.id === id ? newTx : t));

      let updatedAccounts = state.accounts;
      const oldAccId = oldTx.accountId;
      const newAccId = newTx.accountId;

      const oldDelta = oldTx.type === 'income' ? oldTx.amount : -oldTx.amount;
      const newDelta = newTx.type === 'income' ? newTx.amount : -newTx.amount;

      if (oldAccId === newAccId && oldAccId) {
        const diff = newDelta - oldDelta;
        updatedAccounts = state.accounts.map((acc) => {
          if (acc.id === oldAccId) {
            return { ...acc, balance: acc.balance + diff, lastUpdated: 'Hoje' };
          }
          return acc;
        });
      } else {
        updatedAccounts = state.accounts.map((acc) => {
          if (oldAccId && acc.id === oldAccId) {
            return { ...acc, balance: acc.balance - oldDelta, lastUpdated: 'Hoje' };
          }
          if (newAccId && acc.id === newAccId) {
            return { ...acc, balance: acc.balance + newDelta, lastUpdated: 'Hoje' };
          }
          return acc;
        });
      }

      const newTotalBalance = updatedAccounts.reduce((sum, a) => sum + a.balance, 0);

      return {
        transactions: updatedTxs,
        accounts: updatedAccounts,
        user: {
          ...state.user,
          currentBalance: updatedAccounts.length > 0 ? newTotalBalance : Math.max(0, state.user.currentBalance + (newDelta - oldDelta))
        }
      };
    });

    // Synchronize transaction update with Supabase
    const { error } = await transactionsService.updateTransaction(id, updatedFields);
    if (error) {
      set({ transactionsError: error });
    }

    // Persist updated account balances to Supabase
    if (oldTx) {
      const affectedAccIds = [oldTx.accountId, updatedFields.accountId].filter(Boolean);
      for (const accId of affectedAccIds) {
        const acc = get().accounts.find((a) => a.id === accId);
        if (acc && !acc.id.startsWith('acc-')) {
          accountsService.updateAccount(acc.id, { balance: acc.balance });
        }
      }
    }
  },

  deleteTransaction: async (id) => {
    let txToDelete: Transaction | undefined;
    set((state) => {
      txToDelete = state.transactions.find((t) => t.id === id);
      if (!txToDelete) return state;

      const updatedTxs = state.transactions.filter((t) => t.id !== id);

      let updatedAccounts = state.accounts;
      if (txToDelete.accountId) {
        const delta = txToDelete.type === 'income' ? txToDelete.amount : -txToDelete.amount;
        updatedAccounts = state.accounts.map((acc) => {
          if (acc.id === txToDelete!.accountId) {
            return { ...acc, balance: acc.balance - delta, lastUpdated: 'Hoje' };
          }
          return acc;
        });
      }

      const newTotalBalance = updatedAccounts.reduce((sum, a) => sum + a.balance, 0);

      let updatedCards = state.cards;
      if (txToDelete.type === 'expense' && txToDelete.paymentMethod === 'Cartão de Crédito' && state.cards.length > 0) {
        updatedCards = state.cards.map((card, idx) => {
          if (idx === 0) {
            return {
              ...card,
              currentUsage: Math.max(0, card.currentUsage - txToDelete!.amount)
            };
          }
          return card;
        });
      }

      const impact = txToDelete.type === 'income' ? txToDelete.amount : -txToDelete.amount;

      return {
        transactions: updatedTxs,
        accounts: updatedAccounts,
        cards: updatedCards,
        user: {
          ...state.user,
          currentBalance: updatedAccounts.length > 0 ? newTotalBalance : Math.max(0, state.user.currentBalance - impact)
        }
      };
    });

    // Synchronize transaction deletion with Supabase
    const { error } = await transactionsService.deleteTransaction(id);
    if (error) {
      set({ transactionsError: error });
    }

    // Persist updated account balance to Supabase
    if (txToDelete?.accountId) {
      const targetAcc = get().accounts.find((a) => a.id === txToDelete!.accountId);
      if (targetAcc && !targetAcc.id.startsWith('acc-')) {
        accountsService.updateAccount(targetAcc.id, { balance: targetAcc.balance });
      }
    }
  },

  createGoal: async (goalData) => {
    const tempId = `g-${Date.now()}`;
    const newGoal: FinancialGoalItem = {
      ...goalData,
      id: tempId,
      currentAmount: goalData.currentAmount || 0,
      deadline: goalData.deadline || 'A definir',
      icon: goalData.icon || 'Target',
      color: goalData.color || '#1E6B4B'
    };

    set((state) => ({ goals: [...state.goals, newGoal] }));

    const { data, error } = await goalsService.createGoal(goalData);
    if (error) {
      set((state) => ({
        goals: state.goals.filter((g) => g.id !== tempId),
        goalsError: error
      }));
      return { error };
    } else if (data) {
      set((state) => ({
        goals: state.goals.map((g) => (g.id === tempId ? data : g))
      }));
      return { data };
    }
    return {};
  },

  updateGoal: async (id, updatedGoal) => {
    set((state) => ({
      goals: state.goals.map((g) => (g.id === id ? { ...g, ...updatedGoal } : g))
    }));

    const { data, error } = await goalsService.updateGoal(id, updatedGoal);
    if (error) {
      set({ goalsError: error });
      return { error };
    } else if (data) {
      set((state) => ({
        goals: state.goals.map((g) => (g.id === id ? data : g))
      }));
      return { data };
    }
    return {};
  },

  deleteGoal: async (id) => {
    let previousGoals: FinancialGoalItem[] = [];
    set((state) => {
      previousGoals = state.goals;
      return { goals: state.goals.filter((g) => g.id !== id) };
    });

    const { success, error } = await goalsService.deleteGoal(id);
    if (!success && error) {
      set({ goals: previousGoals, goalsError: error });
      return { success: false, error };
    }
    return { success: true };
  },

  addGoalContribution: async (goalId, amount, accountId, notes, date) => {
    const goal = get().goals.find((g) => g.id === goalId);
    if (!goal) return { error: 'Meta não encontrada.' };

    const newCurrent = Number((goal.currentAmount || 0) + amount);

    set((state) => ({
      goals: state.goals.map((g) => (g.id === goalId ? { ...g, currentAmount: newCurrent } : g))
    }));

    await goalsService.updateGoal(goalId, { currentAmount: newCurrent });

    const contributionDate = date || new Date().toISOString().split('T')[0];
    await goalsService.addContribution(goalId, amount, contributionDate, notes);

    if (accountId) {
      const account = get().accounts.find((a) => a.id === accountId);
      if (account) {
        const newBal = account.balance - amount;
        await get().updateAccount(account.id, { balance: newBal });

        await transactionsService.createTransaction({
          description: `Aporte: ${goal.title}`,
          amount: amount,
          type: 'expense',
          category: 'Outros',
          accountId: account.id,
          accountName: account.name,
          paymentMethod: 'Pix',
          date: contributionDate,
          status: 'completed',
          notes: notes || `Aporte realizado na meta ${goal.title}`
        });

        await get().fetchTransactions();
      }
    }

    return { success: true };
  },

  createCard: async (cardData) => {
    const tempId = `card-${Date.now()}`;
    const newCard: CreditCardItem = {
      ...cardData,
      id: tempId,
      currentUsage: cardData.currentUsage || 0,
      bank: cardData.bank || 'Outro',
      brand: cardData.brand || 'Mastercard',
      lastFourDigits: cardData.lastFourDigits || '4321',
      closingDate: cardData.closingDate || 'Dia 05',
      dueDate: cardData.dueDate || 'Dia 12',
      color: cardData.color || '#165037'
    };

    set((state) => ({ cards: [...state.cards, newCard] }));

    const { data, error } = await cardsService.createCard({
      ...cardData,
      currentUsage: cardData.currentUsage || 0
    });
    if (error) {
      set((state) => ({
        cards: state.cards.filter((c) => c.id !== tempId),
        cardsError: error
      }));
      return { error };
    } else if (data) {
      set((state) => ({
        cards: state.cards.map((c) => (c.id === tempId ? data : c))
      }));
      return { data };
    }
    return {};
  },

  updateCard: async (id, updatedCard) => {
    set((state) => ({
      cards: state.cards.map((c) => (c.id === id ? { ...c, ...updatedCard } : c))
    }));

    const { data, error } = await cardsService.updateCard(id, updatedCard);
    if (error) {
      set({ cardsError: error });
      return { error };
    } else if (data) {
      set((state) => ({
        cards: state.cards.map((c) => (c.id === id ? data : c))
      }));
      return { data };
    }
    return {};
  },

  deleteCard: async (id) => {
    let previousCards: CreditCardItem[] = [];
    set((state) => {
      previousCards = state.cards;
      return { cards: state.cards.filter((c) => c.id !== id) };
    });

    const { success, error } = await cardsService.deleteCard(id);
    if (!success && error) {
      set({ cards: previousCards, cardsError: error });
      return { success: false, error };
    }
    return { success: true };
  },

  createAsset: async (assetData) => {
    const tempId = `ast-${Date.now()}`;
    const newAsset: AssetItem = {
      ...assetData,
      id: tempId,
      lastUpdated: 'Hoje'
    };

    set((state) => ({ assets: [newAsset, ...state.assets] }));

    const { data, error } = await assetsService.createAsset(assetData);

    if (error) {
      set((state) => ({
        assets: state.assets.filter((a) => a.id !== tempId),
        assetsError: error
      }));
      return { error };
    } else if (data) {
      set((state) => ({
        assets: state.assets.map((a) => (a.id === tempId ? data : a))
      }));
      return { data };
    }
    return {};
  },

  updateAsset: async (id, updatedAsset) => {
    set((state) => ({
      assets: state.assets.map((a) => (a.id === id ? { ...a, ...updatedAsset, lastUpdated: 'Hoje' } : a))
    }));

    const { data, error } = await assetsService.updateAsset(id, updatedAsset);

    if (error) {
      set({ assetsError: error });
      return { error };
    } else if (data) {
      set((state) => ({
        assets: state.assets.map((a) => (a.id === id ? data : a))
      }));
      return { data };
    }
    return {};
  },

  deleteAsset: async (id) => {
    let previousAssets: AssetItem[] = [];
    set((state) => {
      previousAssets = state.assets;
      return { assets: state.assets.filter((a) => a.id !== id) };
    });

    const { success, error } = await assetsService.deleteAsset(id);

    if (!success && error) {
      set({ assets: previousAssets, assetsError: error });
      return { success: false, error };
    }
    return { success: true };
  },

  updateProfile: (profileData) => {
    const authUser = get().authUser;

    if (authUser) {
      const dbUpdates: Record<string, any> = {};
      if (profileData.name !== undefined) dbUpdates.name = profileData.name;
      if (profileData.email !== undefined) dbUpdates.email = profileData.email;
      if (profileData.avatarUrl !== undefined) dbUpdates.avatar_url = profileData.avatarUrl;
      if (profileData.currency !== undefined) dbUpdates.currency = profileData.currency;
      if (profileData.monthlyIncome !== undefined) dbUpdates.monthly_income = profileData.monthlyIncome;
      if (profileData.currentBalance !== undefined) dbUpdates.current_balance = profileData.currentBalance;
      if (profileData.hasCreditCard !== undefined) dbUpdates.has_credit_card = profileData.hasCreditCard;
      if (profileData.isOnboarded !== undefined) dbUpdates.onboarding_completed = profileData.isOnboarded;

      if (Object.keys(dbUpdates).length > 0) {
        ProfileService.updateProfile(authUser.id, dbUpdates);
      }

      if (profileData.theme !== undefined || profileData.language !== undefined || profileData.currency !== undefined) {
        SettingsService.updateSettings(authUser.id, {
          theme: profileData.theme as any,
          language: profileData.language,
          currency: profileData.currency,
        });
      }
    }

    set((state) => ({
      user: {
        ...state.user,
        ...profileData,
        notifications: profileData.notifications 
          ? { ...state.user.notifications, ...profileData.notifications }
          : state.user.notifications
      }
    }));
  },

  resetUser: () => set({
    user: DEFAULT_USER,
    accounts: [],
    transactions: [],
    cards: DEFAULT_CARDS,
    goals: DEFAULT_GOALS,
    assets: DEFAULT_ASSETS
  })
}));
