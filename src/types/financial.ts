export type TransactionType = 'income' | 'expense';

export type TransactionCategory = 
  | 'Alimentação'
  | 'Moradia'
  | 'Transporte'
  | 'Lazer'
  | 'Saúde'
  | 'Educação'
  | 'Salário'
  | 'Investimentos'
  | 'Freelance'
  | 'Outros';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  date: string; // ISO format or YYYY-MM-DD
  status: 'completed' | 'pending';
  paymentMethod?: 'Pix' | 'Cartão de Crédito' | 'Débito' | 'Boleto' | 'Dinheiro';
  accountId?: string;
  accountName?: string;
  notes?: string;
}

export interface CategoryBudget {
  category: TransactionCategory;
  budgeted: number;
  spent: number;
  color: string;
}

export interface FinancialSummaryData {
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
  totalSavings: number;
  balanceChangePercent: number;
  incomeChangePercent: number;
  expenseChangePercent: number;
}

export type TimePeriod = 'this_month' | 'last_month' | 'quarter' | 'year';
