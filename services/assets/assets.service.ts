import { supabase } from '../../lib/supabase';
import { AssetItem } from '../../store/userStore';
import {
  DbAsset,
  AssetServiceResult,
  DeleteServiceResult,
  mapDbToAsset,
  mapAssetToDb
} from './assets.types';

export const assetsService = {
  /**
   * Busca todos os ativos/patrimônios do usuário autenticado no Supabase.
   */
  async getAssets(): Promise<AssetServiceResult<AssetItem[]>> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;

      let query = supabase.from('assets').select('*');

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao consultar patrimônios no Supabase:', error.message);
        return {
          data: null,
          error: `Falha ao carregar patrimônios do Supabase: ${error.message}`
        };
      }

      const assets: AssetItem[] = (data as DbAsset[] || []).map(mapDbToAsset);

      return {
        data: assets,
        error: null
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro inesperado ao consultar o Supabase';
      return {
        data: null,
        error: `Falha ao carregar patrimônios: ${message}`
      };
    }
  },

  /**
   * Cadastra um novo patrimônio no Supabase.
   */
  async createAsset(assetData: Omit<AssetItem, 'id'>): Promise<AssetServiceResult<AssetItem>> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;

      if (!userId) {
        return {
          data: null,
          error: 'Usuário não autenticado.'
        };
      }

      const payload = mapAssetToDb(assetData, userId);

      const { data, error } = await supabase
        .from('assets')
        .insert([payload])
        .select()
        .single();

      if (error) {
        console.warn('Erro ao criar patrimônio com payload completo, tentando campos básicos:', error.message);
        const fallbackPayload = {
          user_id: userId,
          name: assetData.name,
          category: assetData.category || 'Investimentos',
          value: Number(assetData.value || 0),
          acquisition_date: assetData.acquisitionDate || new Date().toISOString().split('T')[0],
          notes: assetData.notes || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { data: fallbackData, error: fallbackError } = await supabase
          .from('assets')
          .insert([fallbackPayload])
          .select()
          .single();

        if (fallbackError) {
          return {
            data: null,
            error: `Erro ao cadastrar patrimônio no banco: ${fallbackError.message}`
          };
        }

        return {
          data: mapDbToAsset(fallbackData as DbAsset),
          error: null
        };
      }

      return {
        data: mapDbToAsset(data as DbAsset),
        error: null
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro inesperado ao salvar no Supabase';
      return {
        data: null,
        error: `Erro ao criar patrimônio: ${message}`
      };
    }
  },

  /**
   * Atualiza um patrimônio existente no Supabase.
   */
  async updateAsset(id: string, updates: Partial<AssetItem>): Promise<AssetServiceResult<AssetItem>> {
    try {
      const payload = mapAssetToDb(updates);

      const { data, error } = await supabase
        .from('assets')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.warn('Erro ao atualizar patrimônio com payload completo, tentando fallback:', error.message);
        const basicPayload: Record<string, any> = { updated_at: new Date().toISOString() };
        if (updates.name !== undefined) basicPayload.name = updates.name;
        if (updates.category !== undefined) basicPayload.category = updates.category;
        if (updates.value !== undefined) basicPayload.value = Number(updates.value);
        if (updates.acquisitionDate !== undefined) basicPayload.acquisition_date = updates.acquisitionDate;
        if (updates.notes !== undefined) basicPayload.notes = updates.notes;

        const { data: fallbackData, error: fallbackError } = await supabase
          .from('assets')
          .update(basicPayload)
          .eq('id', id)
          .select()
          .single();

        if (fallbackError) {
          return {
            data: null,
            error: `Erro ao atualizar patrimônio: ${fallbackError.message}`
          };
        }

        return {
          data: mapDbToAsset(fallbackData as DbAsset),
          error: null
        };
      }

      return {
        data: mapDbToAsset(data as DbAsset),
        error: null
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro inesperado';
      return {
        data: null,
        error: `Erro ao atualizar patrimônio: ${message}`
      };
    }
  },

  /**
   * Exclui um patrimônio no Supabase.
   */
  async deleteAsset(id: string): Promise<DeleteServiceResult> {
    try {
      const { error } = await supabase
        .from('assets')
        .delete()
        .eq('id', id);

      if (error) {
        return {
          success: false,
          error: `Erro ao excluir patrimônio do Supabase: ${error.message}`
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
        error: `Erro ao excluir patrimônio: ${message}`
      };
    }
  }
};

export default assetsService;
