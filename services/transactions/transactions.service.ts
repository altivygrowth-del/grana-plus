import { supabase } from '../../lib/supabase';
import { Transaction } from '../../types/financial';
import {
  DbTransaction,
  TransactionServiceResult,
  DeleteServiceResult,
  mapDbToTransaction,
  mapTransactionToDb
} from './transactions.types';

/**
 * Busca todas as movimentações financeiras no Supabase.
 */
export const getTransactions = async (): Promise<TransactionServiceResult<Transaction[]>> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;

    let query = supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) {
      return {
        data: null,
        error: `Falha ao carregar as movimentações do Supabase: ${error.message || 'Erro de conexão'}`
      };
    }

    const transactions: Transaction[] = (data as DbTransaction[] || []).map(mapDbToTransaction);

    return {
      data: transactions,
      error: null
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro inesperado ao consultar o Supabase';
    return {
      data: null,
      error: `Falha ao carregar as movimentações: ${message}`
    };
  }
};

/**
 * Cadastra uma nova movimentação financeira no Supabase.
 */
export const createTransaction = async (
  tx: Omit<Transaction, 'id'>
): Promise<TransactionServiceResult<Transaction>> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;

    const payload = mapTransactionToDb(tx, userId);

    const { data, error } = await supabase
      .from('transactions')
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.warn('Erro ao inserir movimentação com payload completo, tentando payload básico:', error.message);
      const fallbackPayload: Record<string, any> = {
        user_id: userId,
        description: tx.description,
        amount: Number(tx.amount),
        type: tx.type,
        category: tx.category,
        date: tx.date,
        status: tx.status || 'completed'
      };
      if (tx.accountId) fallbackPayload.account_id = tx.accountId;

      const { data: fallbackData, error: fallbackError } = await supabase
        .from('transactions')
        .insert([fallbackPayload])
        .select()
        .single();

      if (fallbackError) {
        return {
          data: null,
          error: `Falha ao salvar a movimentação no Supabase: ${fallbackError.message}`
        };
      }

      return {
        data: mapDbToTransaction(fallbackData as DbTransaction),
        error: null
      };
    }

    const createdTx = mapDbToTransaction(data as DbTransaction);

    return {
      data: createdTx,
      error: null
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido ao salvar';
    return {
      data: null,
      error: `Falha ao salvar a movimentação: ${message}`
    };
  }
};

/**
 * Atualiza uma movimentação financeira existente no Supabase.
 */
export const updateTransaction = async (
  id: string,
  tx: Partial<Transaction>
): Promise<TransactionServiceResult<Transaction>> => {
  try {
    const payload = mapTransactionToDb(tx);

    const { data, error } = await supabase
      .from('transactions')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return {
        data: null,
        error: `Falha ao atualizar a movimentação no Supabase: ${error.message || 'Registro não encontrado ou erro de permissão'}`
      };
    }

    const updatedTx = mapDbToTransaction(data as DbTransaction);

    return {
      data: updatedTx,
      error: null
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido ao atualizar';
    return {
      data: null,
      error: `Falha ao atualizar a movimentação: ${message}`
    };
  }
};

/**
 * Exclui uma movimentação financeira do Supabase pelo ID.
 */
export const deleteTransaction = async (id: string): Promise<DeleteServiceResult> => {
  try {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) {
      return {
        success: false,
        error: `Falha ao excluir a movimentação no Supabase: ${error.message || 'Não foi possível remover o registro'}`
      };
    }

    return {
      success: true,
      error: null
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro inesperado ao excluir';
    return {
      success: false,
      error: `Falha ao excluir a movimentação: ${message}`
    };
  }
};

export const transactionsService = {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction
};

export default transactionsService;
