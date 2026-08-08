import { supabase } from '../../lib/supabase';
import { CreditCardItem } from '../../store/userStore';
import {
  DbCard,
  CardServiceResult,
  DeleteServiceResult,
  mapDbToCard
} from './cards.types';

function parseDayInt(val: any): number | null {
  if (typeof val === 'number') return val >= 1 && val <= 31 ? val : null;
  if (!val) return null;
  const match = String(val).match(/\d+/);
  if (match) {
    const num = parseInt(match[0], 10);
    return num >= 1 && num <= 31 ? num : null;
  }
  return null;
}

export const cardsService = {
  /**
   * Busca todos os cartões de crédito do usuário autenticado no Supabase.
   */
  async getCards(): Promise<CardServiceResult<CreditCardItem[]>> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;

      if (!userId) {
        return {
          data: [],
          error: null
        };
      }

      const { data, error } = await supabase
        .from('cards')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.error('Erro ao consultar cartões no Supabase:', error.message, error);
        return {
          data: null,
          error: `Falha ao carregar os cartões do Supabase: ${error.message}`
        };
      }

      const cards: CreditCardItem[] = (data as DbCard[] || []).map(mapDbToCard);

      return {
        data: cards,
        error: null
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro inesperado ao consultar o Supabase';
      console.error('Exceção ao carregar cartões:', err);
      return {
        data: null,
        error: `Falha ao carregar os cartões: ${message}`
      };
    }
  },

  /**
   * Cadastra um novo cartão no Supabase.
   */
  async createCard(cardData: Omit<CreditCardItem, 'id'>): Promise<CardServiceResult<CreditCardItem>> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;

      if (!userId) {
        console.error('Erro ao criar cartão: Usuário não autenticado.');
        return {
          data: null,
          error: 'Usuário não autenticado.'
        };
      }

      // Payload 1: Padrão oficial da migration initial_schema.sql
      const primaryPayload = {
        user_id: userId,
        name: cardData.name,
        bank: cardData.bank || 'Outro',
        last_digits: cardData.lastFourDigits || null,
        card_limit: Number(cardData.totalLimit || 0),
        current_usage: Number(cardData.currentUsage || 0),
        closing_day: parseDayInt(cardData.closingDate) || 5,
        due_day: parseDayInt(cardData.dueDate) || 12,
        color: cardData.color || '#165037',
        is_active: true
      };

      const { data, error } = await supabase
        .from('cards')
        .insert([primaryPayload])
        .select()
        .single();

      if (!error && data) {
        return {
          data: mapDbToCard(data as DbCard),
          error: null
        };
      }

      console.warn('Tentativa 1 de inserção de cartão falhou:', error?.message, 'Tentando payload secundário...');

      // Payload 2: Colunas alternativas caso a tabela tenha colunas texto/diferentes
      const secondaryPayload = {
        user_id: userId,
        name: cardData.name,
        bank: cardData.bank || 'Outro',
        brand: cardData.brand || 'Mastercard',
        last_four_digits: cardData.lastFourDigits || null,
        total_limit: Number(cardData.totalLimit || 0),
        current_usage: Number(cardData.currentUsage || 0),
        closing_date: cardData.closingDate || 'Dia 05',
        due_date: cardData.dueDate || 'Dia 12',
        color: cardData.color || '#165037'
      };

      const { data: data2, error: error2 } = await supabase
        .from('cards')
        .insert([secondaryPayload])
        .select()
        .single();

      if (!error2 && data2) {
        return {
          data: mapDbToCard(data2 as DbCard),
          error: null
        };
      }

      console.warn('Tentativa 2 de inserção de cartão falhou:', error2?.message, 'Tentando payload minimalista...');

      // Payload 3: Minimalista (apenas campos estritamente obrigatórios)
      const minimalPayload = {
        user_id: userId,
        name: cardData.name,
        bank: cardData.bank || 'Outro',
        card_limit: Number(cardData.totalLimit || 0),
        current_usage: Number(cardData.currentUsage || 0)
      };

      const { data: data3, error: error3 } = await supabase
        .from('cards')
        .insert([minimalPayload])
        .select()
        .single();

      if (!error3 && data3) {
        return {
          data: mapDbToCard(data3 as DbCard),
          error: null
        };
      }

      console.error('Erro definitivo ao salvar cartão no Supabase:', error3 || error2 || error);
      const finalError = error3 || error2 || error;
      return {
        data: null,
        error: `Erro ao cadastrar cartão no banco: ${finalError?.message || 'Erro desconhecido'} (Código: ${finalError?.code || 'N/A'})`
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro inesperado ao salvar no Supabase';
      console.error('Exceção ao criar cartão:', err);
      return {
        data: null,
        error: `Erro ao criar cartão: ${message}`
      };
    }
  },

  /**
   * Atualiza um cartão existente no Supabase.
   */
  async updateCard(id: string, updates: Partial<CreditCardItem>): Promise<CardServiceResult<CreditCardItem>> {
    try {
      const primaryUpdates: Record<string, any> = { updated_at: new Date().toISOString() };
      if (updates.name !== undefined) primaryUpdates.name = updates.name;
      if (updates.bank !== undefined) primaryUpdates.bank = updates.bank;
      if (updates.lastFourDigits !== undefined) primaryUpdates.last_digits = updates.lastFourDigits;
      if (updates.totalLimit !== undefined) primaryUpdates.card_limit = Number(updates.totalLimit);
      if (updates.currentUsage !== undefined) primaryUpdates.current_usage = Number(updates.currentUsage);
      if (updates.closingDate !== undefined) primaryUpdates.closing_day = parseDayInt(updates.closingDate);
      if (updates.dueDate !== undefined) primaryUpdates.due_day = parseDayInt(updates.dueDate);
      if (updates.color !== undefined) primaryUpdates.color = updates.color;

      const { data, error } = await supabase
        .from('cards')
        .update(primaryUpdates)
        .eq('id', id)
        .select()
        .single();

      if (!error && data) {
        return {
          data: mapDbToCard(data as DbCard),
          error: null
        };
      }

      console.warn('Tentativa 1 de atualização do cartão falhou:', error?.message, 'Tentando payload secundário...');

      const secondaryUpdates: Record<string, any> = { updated_at: new Date().toISOString() };
      if (updates.name !== undefined) secondaryUpdates.name = updates.name;
      if (updates.bank !== undefined) secondaryUpdates.bank = updates.bank;
      if (updates.brand !== undefined) secondaryUpdates.brand = updates.brand;
      if (updates.lastFourDigits !== undefined) secondaryUpdates.last_four_digits = updates.lastFourDigits;
      if (updates.totalLimit !== undefined) secondaryUpdates.total_limit = Number(updates.totalLimit);
      if (updates.currentUsage !== undefined) secondaryUpdates.current_usage = Number(updates.currentUsage);
      if (updates.closingDate !== undefined) secondaryUpdates.closing_date = updates.closingDate;
      if (updates.dueDate !== undefined) secondaryUpdates.due_date = updates.dueDate;
      if (updates.color !== undefined) secondaryUpdates.color = updates.color;

      const { data: data2, error: error2 } = await supabase
        .from('cards')
        .update(secondaryUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error2) {
        console.error('Erro ao atualizar cartão no Supabase:', error2);
        return {
          data: null,
          error: `Erro ao atualizar cartão: ${error2.message}`
        };
      }

      return {
        data: mapDbToCard(data2 as DbCard),
        error: null
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro inesperado';
      console.error('Exceção ao atualizar cartão:', err);
      return {
        data: null,
        error: `Erro ao atualizar cartão: ${message}`
      };
    }
  },

  /**
   * Remove um cartão do Supabase pelo ID.
   */
  async deleteCard(id: string): Promise<DeleteServiceResult> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;

      console.log("deleteCard recebeu:", id);
      console.log("userId:", userId);

      if (!userId) {
        console.error('Erro ao excluir cartão: Usuário não autenticado.');
        return {
          success: false,
          error: 'Usuário não autenticado.'
        };
      }

      console.log(`[cardsService.deleteCard] Deletando cartão id: ${id} para user_id: ${userId}`);

      const { data, error } = await supabase
        .from('cards')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)
        .select();

      console.log("DELETE RESULT:", data);
      console.log("DELETE ERROR:", error);

      if (error) {
        console.error('Erro ao excluir cartão do Supabase:', error);
        return {
          success: false,
          error: `Erro ao excluir cartão do Supabase: ${error.message}`
        };
      }

      console.log(`[cardsService.deleteCard] Cartão ${id} excluído com sucesso do Supabase.`);
      return {
        success: true,
        error: null
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro inesperado';
      console.error('Exceção ao excluir cartão:', err);
      return {
        success: false,
        error: `Erro ao excluir cartão: ${message}`
      };
    }
  }
};

export default cardsService;

