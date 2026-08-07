import { Transaction, TransactionType, TransactionCategory } from '../../types/financial';

export interface DbTransaction {
  id: string;
  user_id?: string;
  account_id?: string;
  description: string;
  amount: number;
  type: string;
  category: string;
  date: string;
  status?: 'completed' | 'pending';
  payment_method?: string;
  notes?: string;
  observation?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TransactionServiceResult<T> {
  data: T | null;
  error: string | null;
}

export interface DeleteServiceResult {
  success: boolean;
  error: string | null;
}

/**
 * Converte um registro do banco Supabase para a model Transaction do app.
 */
export const mapDbToTransaction = (dbTx: DbTransaction): Transaction => {
  let type: TransactionType = 'expense';
  const rawType = (dbTx.type || '').toLowerCase();
  if (rawType === 'income' || rawType === 'receita' || rawType === 'entrada') {
    type = 'income';
  } else if (rawType === 'expense' || rawType === 'despesa' || rawType === 'saida') {
    type = 'expense';
  }

  return {
    id: dbTx.id,
    description: dbTx.description || 'Movimentação',
    amount: Number(dbTx.amount || 0),
    type: type,
    category: (dbTx.category as TransactionCategory) || 'Outros',
    date: dbTx.date ? dbTx.date.split('T')[0] : new Date().toISOString().split('T')[0],
    status: dbTx.status || 'completed',
    paymentMethod: dbTx.payment_method as any,
    accountId: dbTx.account_id,
    notes: dbTx.notes || dbTx.observation || ''
  };
};

/**
 * Converte a model Transaction do app para o formato snake_case da tabela do Supabase.
 */
export const mapTransactionToDb = (
  tx: Omit<Transaction, 'id'> | Partial<Transaction>,
  userId?: string
): Record<string, any> => {
  const dbObj: Record<string, any> = {};

  if (userId) dbObj.user_id = userId;
  if (tx.description !== undefined) dbObj.description = tx.description;
  if (tx.amount !== undefined) dbObj.amount = Number(tx.amount);
  if (tx.type !== undefined) dbObj.type = tx.type;
  if (tx.category !== undefined) dbObj.category = tx.category;
  if (tx.date !== undefined) dbObj.date = tx.date;
  if (tx.status !== undefined) dbObj.status = tx.status;
  if (tx.paymentMethod !== undefined) dbObj.payment_method = tx.paymentMethod;
  if (tx.accountId !== undefined) dbObj.account_id = tx.accountId;
  if (tx.notes !== undefined) {
    dbObj.notes = tx.notes;
    dbObj.observation = tx.notes;
  }

  return dbObj;
};
