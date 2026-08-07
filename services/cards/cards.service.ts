import { supabase } from '../../lib/supabase';
import { CreditCardItem } from '../../store/userStore';
import {
  DbCard,
  CardServiceResult,
  DeleteServiceResult,
  mapDbToCard,
  mapCardToDb
} from './cards.types';

export const cardsService = {
  /**
   * Busca todos os cartões de crédito do usuário autenticado no Supabase.
   */
  async getCards(): Promise<CardServiceResult<CreditCardItem[]>> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;

      let query = supabase
        .from('cards')
        .select('*');

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao consultar cartões no Supabase:', error.message);
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
        return {
          data: null,
          error: 'Usuário não autenticado.'
        };
      }

      const payload = mapCardToDb(cardData, userId);

      const { data, error } = await supabase
        .from('cards')
        .insert([payload])
        .select()
        .single();

      if (error) {
        console.warn('Erro ao inserir cartão com payload completo, tentando campos básicos:', error.message);
        const fallbackPayload = {
          user_id: userId,
          name: cardData.name,
          bank: cardData.bank || 'Outro',
          brand: cardData.brand || 'Mastercard',
          last_four_digits: cardData.lastFourDigits || '4321',
          total_limit: Number(cardData.totalLimit || 0),
          current_usage: Number(cardData.currentUsage || 0),
          closing_date: cardData.closingDate || 'Dia 05',
          due_date: cardData.dueDate || 'Dia 12',
          color: cardData.color || '#165037',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { data: fallbackData, error: fallbackError } = await supabase
          .from('cards')
          .insert([fallbackPayload])
          .select()
          .single();

        if (fallbackError) {
          return {
            data: null,
            error: `Erro ao cadastrar cartão no banco: ${fallbackError.message}`
          };
        }

        return {
          data: mapDbToCard(fallbackData as DbCard),
          error: null
        };
      }

      return {
        data: mapDbToCard(data as DbCard),
        error: null
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro inesperado ao salvar no Supabase';
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
      const payload = mapCardToDb(updates);

      const { data, error } = await supabase
        .from('cards')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.warn('Erro ao atualizar cartão com payload completo, tentando fallback:', error.message);
        const basicPayload: Record<string, any> = { updated_at: new Date().toISOString() };
        if (updates.name !== undefined) basicPayload.name = updates.name;
        if (updates.bank !== undefined) basicPayload.bank = updates.bank;
        if (updates.brand !== undefined) basicPayload.brand = updates.brand;
        if (updates.lastFourDigits !== undefined) basicPayload.last_four_digits = updates.lastFourDigits;
        if (updates.totalLimit !== undefined) basicPayload.total_limit = Number(updates.totalLimit);
        if (updates.currentUsage !== undefined) basicPayload.current_usage = Number(updates.currentUsage);
        if (updates.closingDate !== undefined) basicPayload.closing_date = updates.closingDate;
        if (updates.dueDate !== undefined) basicPayload.due_date = updates.dueDate;
        if (updates.color !== undefined) basicPayload.color = updates.color;

        const { data: fallbackData, error: fallbackError } = await supabase
          .from('cards')
          .update(basicPayload)
          .eq('id', id)
          .select()
          .single();

        if (fallbackError) {
          return {
            data: null,
            error: `Erro ao atualizar cartão: ${fallbackError.message}`
          };
        }

        return {
          data: mapDbToCard(fallbackData as DbCard),
          error: null
        };
      }

      return {
        data: mapDbToCard(data as DbCard),
        error: null
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro inesperado';
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
      const { error } = await supabase
        .from('cards')
        .delete()
        .eq('id', id);

      if (error) {
        return {
          success: false,
          error: `Erro ao excluir cartão do Supabase: ${error.message}`
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
        error: `Erro ao excluir cartão: ${message}`
      };
    }
  }
};

export default cardsService;
