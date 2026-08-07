import { supabase } from '../../lib/supabase';
import { Account } from '../../store/userStore';
import {
  DbAccount,
  AccountServiceResult,
  DeleteServiceResult,
  mapDbToAccount,
  mapAccountToDb
} from './accounts.types';

export const accountsService = {
  /**
   * Busca todas as contas bancárias do usuário autenticado no Supabase.
   */
  async getAccounts(): Promise<AccountServiceResult<Account[]>> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;

      let query = supabase
        .from('accounts')
        .select('*');

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao consultar contas no Supabase:', error.message);
        return {
          data: null,
          error: `Falha ao carregar as contas do Supabase: ${error.message}`
        };
      }

      const accounts: Account[] = (data as DbAccount[] || []).map(mapDbToAccount);

      return {
        data: accounts,
        error: null
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro inesperado ao consultar o Supabase';
      return {
        data: null,
        error: `Falha ao carregar as contas: ${message}`
      };
    }
  },

  /**
   * Cria uma nova conta financeira no Supabase.
   */
  async createAccount(accData: Omit<Account, 'id'>): Promise<AccountServiceResult<Account>> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;

      if (!userId) {
        return {
          data: null,
          error: 'Usuário não autenticado.'
        };
      }

      const payload = mapAccountToDb(accData, userId);

      const { data, error } = await supabase
        .from('accounts')
        .insert([payload])
        .select()
        .single();

      if (error) {
        // Fallback para caso a tabela possua colunas estritas sem institution/bg_color
        console.warn('Erro ao inserir com campos estendidos, tentando campos básicos:', error.message);
        const basicPayload = {
          user_id: userId,
          name: accData.name,
          type: accData.type || 'Conta Corrente',
          balance: Number(accData.balance || 0),
          color: accData.color || '#1E6B4B',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { data: fallbackData, error: fallbackError } = await supabase
          .from('accounts')
          .insert([basicPayload])
          .select()
          .single();

        if (fallbackError) {
          return {
            data: null,
            error: `Erro ao criar conta no banco: ${fallbackError.message}`
          };
        }

        return {
          data: mapDbToAccount(fallbackData as DbAccount),
          error: null
        };
      }

      return {
        data: mapDbToAccount(data as DbAccount),
        error: null
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro inesperado ao salvar no Supabase';
      return {
        data: null,
        error: `Erro ao criar conta: ${message}`
      };
    }
  },

  /**
   * Atualiza uma conta existente no Supabase.
   */
  async updateAccount(id: string, updates: Partial<Account>): Promise<AccountServiceResult<Account>> {
    try {
      const payload = mapAccountToDb(updates);

      const { data, error } = await supabase
        .from('accounts')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        // Fallback para colunas básicas
        const basicPayload: Record<string, any> = { updated_at: new Date().toISOString() };
        if (updates.name !== undefined) basicPayload.name = updates.name;
        if (updates.type !== undefined) basicPayload.type = updates.type;
        if (updates.balance !== undefined) basicPayload.balance = Number(updates.balance);
        if (updates.color !== undefined) basicPayload.color = updates.color;

        const { data: fallbackData, error: fallbackError } = await supabase
          .from('accounts')
          .update(basicPayload)
          .eq('id', id)
          .select()
          .single();

        if (fallbackError) {
          return {
            data: null,
            error: `Erro ao atualizar conta: ${fallbackError.message}`
          };
        }

        return {
          data: mapDbToAccount(fallbackData as DbAccount),
          error: null
        };
      }

      return {
        data: mapDbToAccount(data as DbAccount),
        error: null
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro inesperado';
      return {
        data: null,
        error: `Erro ao atualizar conta: ${message}`
      };
    }
  },

  /**
   * Remove uma conta do Supabase pelo ID.
   */
  async deleteAccount(id: string): Promise<DeleteServiceResult> {
    try {
      const { error } = await supabase
        .from('accounts')
        .delete()
        .eq('id', id);

      if (error) {
        return {
          success: false,
          error: `Erro ao excluir conta do Supabase: ${error.message}`
        };
      }

      return {
        success: true,
        error: null
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro inesperado';
      return {
        success: false,
        error: `Erro ao excluir conta: ${message}`
      };
    }
  }
};

export default accountsService;
