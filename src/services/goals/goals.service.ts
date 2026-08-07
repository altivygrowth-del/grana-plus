import { supabase } from '../../lib/supabase';
import { FinancialGoalItem } from '../../store/userStore';
import {
  DbGoal,
  DbGoalContribution,
  GoalContributionItem,
  GoalServiceResult,
  DeleteServiceResult,
  mapDbToGoal,
  mapGoalToDb,
  mapDbToContribution
} from './goals.types';

export const goalsService = {
  /**
   * Busca todas as metas do usuário autenticado no Supabase.
   */
  async getGoals(): Promise<GoalServiceResult<FinancialGoalItem[]>> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;

      let query = supabase.from('goals').select('*');

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao consultar metas no Supabase:', error.message);
        return {
          data: null,
          error: `Falha ao carregar as metas do Supabase: ${error.message}`
        };
      }

      const goals: FinancialGoalItem[] = (data as DbGoal[] || []).map(mapDbToGoal);

      return {
        data: goals,
        error: null
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro inesperado ao consultar o Supabase';
      return {
        data: null,
        error: `Falha ao carregar as metas: ${message}`
      };
    }
  },

  /**
   * Cadastra uma nova meta no Supabase.
   */
  async createGoal(goalData: Omit<FinancialGoalItem, 'id'>): Promise<GoalServiceResult<FinancialGoalItem>> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;

      if (!userId) {
        return {
          data: null,
          error: 'Usuário não autenticado.'
        };
      }

      const payload = mapGoalToDb(goalData, userId);

      const { data, error } = await supabase
        .from('goals')
        .insert([payload])
        .select()
        .single();

      if (error) {
        console.warn('Erro ao criar meta com payload completo, tentando campos básicos:', error.message);
        const fallbackPayload = {
          user_id: userId,
          title: goalData.title,
          target_amount: Number(goalData.targetAmount || 0),
          current_amount: Number(goalData.currentAmount || 0),
          deadline: goalData.deadline || 'A definir',
          icon: goalData.icon || 'Target',
          color: goalData.color || '#1E6B4B',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { data: fallbackData, error: fallbackError } = await supabase
          .from('goals')
          .insert([fallbackPayload])
          .select()
          .single();

        if (fallbackError) {
          return {
            data: null,
            error: `Erro ao cadastrar meta no banco: ${fallbackError.message}`
          };
        }

        return {
          data: mapDbToGoal(fallbackData as DbGoal),
          error: null
        };
      }

      return {
        data: mapDbToGoal(data as DbGoal),
        error: null
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro inesperado ao salvar no Supabase';
      return {
        data: null,
        error: `Erro ao criar meta: ${message}`
      };
    }
  },

  /**
   * Atualiza uma meta existente no Supabase.
   */
  async updateGoal(id: string, updates: Partial<FinancialGoalItem>): Promise<GoalServiceResult<FinancialGoalItem>> {
    try {
      const payload = mapGoalToDb(updates);

      const { data, error } = await supabase
        .from('goals')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.warn('Erro ao atualizar meta com payload completo, tentando fallback:', error.message);
        const basicPayload: Record<string, any> = { updated_at: new Date().toISOString() };
        if (updates.title !== undefined) basicPayload.title = updates.title;
        if (updates.targetAmount !== undefined) basicPayload.target_amount = Number(updates.targetAmount);
        if (updates.currentAmount !== undefined) basicPayload.current_amount = Number(updates.currentAmount);
        if (updates.deadline !== undefined) basicPayload.deadline = updates.deadline;
        if (updates.icon !== undefined) basicPayload.icon = updates.icon;
        if (updates.color !== undefined) basicPayload.color = updates.color;

        const { data: fallbackData, error: fallbackError } = await supabase
          .from('goals')
          .update(basicPayload)
          .eq('id', id)
          .select()
          .single();

        if (fallbackError) {
          return {
            data: null,
            error: `Erro ao atualizar meta: ${fallbackError.message}`
          };
        }

        return {
          data: mapDbToGoal(fallbackData as DbGoal),
          error: null
        };
      }

      return {
        data: mapDbToGoal(data as DbGoal),
        error: null
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro inesperado';
      return {
        data: null,
        error: `Erro ao atualizar meta: ${message}`
      };
    }
  },

  /**
   * Exclui uma meta no Supabase.
   */
  async deleteGoal(id: string): Promise<DeleteServiceResult> {
    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id);

      if (error) {
        return {
          success: false,
          error: `Erro ao excluir meta do Supabase: ${error.message}`
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
        error: `Erro ao excluir meta: ${message}`
      };
    }
  },

  /**
   * Registra um aporte para uma meta.
   */
  async addContribution(
    goalId: string,
    amount: number,
    date: string,
    notes?: string
  ): Promise<GoalServiceResult<GoalContributionItem>> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;

      const payload = {
        goal_id: goalId,
        user_id: userId,
        amount: Number(amount),
        date: date || new Date().toISOString().split('T')[0],
        notes: notes || 'Aporte na meta'
      };

      const { data, error } = await supabase
        .from('goal_contributions')
        .insert([payload])
        .select()
        .single();

      if (error) {
        console.warn('Erro ao inserir aporte em goal_contributions (pode ser ausência da tabela), retornando aporte local:', error.message);
        return {
          data: {
            id: `contrib-${Date.now()}`,
            goalId,
            amount,
            date: date || new Date().toISOString().split('T')[0],
            notes: notes || 'Aporte na meta'
          },
          error: null
        };
      }

      return {
        data: mapDbToContribution(data as DbGoalContribution),
        error: null
      };
    } catch (err: unknown) {
      return {
        data: {
          id: `contrib-${Date.now()}`,
          goalId,
          amount,
          date: date || new Date().toISOString().split('T')[0],
          notes: notes || 'Aporte na meta'
        },
        error: null
      };
    }
  },

  /**
   * Busca aportes de uma meta no Supabase.
   */
  async getContributions(goalId: string): Promise<GoalServiceResult<GoalContributionItem[]>> {
    try {
      const { data, error } = await supabase
        .from('goal_contributions')
        .select('*')
        .eq('goal_id', goalId)
        .order('date', { ascending: false });

      if (error) {
        console.warn('Tabela goal_contributions não disponível ou sem registros:', error.message);
        return { data: [], error: null };
      }

      const list = (data as DbGoalContribution[] || []).map(mapDbToContribution);
      return { data: list, error: null };
    } catch {
      return { data: [], error: null };
    }
  }
};

export default goalsService;
