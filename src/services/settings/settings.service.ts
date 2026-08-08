import { supabase } from '../../lib/supabase';

export type ThemePreference = 'light';

export interface UserSettingsData {
  user_id?: string;
  id?: string;
  theme?: ThemePreference;
  language?: string;
  currency?: string;
  updated_at?: string;
}

export const SettingsService = {
  /**
   * Busca as configurações do usuário na tabela public.settings pelo user_id.
   */
  async getSettings(userId: string): Promise<{ theme?: ThemePreference; language?: string; currency?: string } | null> {
    try {
      if (!userId) return null;

      // 1. Tenta por user_id
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (!error && data) {
        return {
          theme: 'light',
          language: data.language || data.idioma,
          currency: data.currency || data.moeda,
        };
      }

      // 2. Fallback: tenta por id
      const { data: dataId, error: errorId } = await supabase
        .from('settings')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (!errorId && dataId) {
        return {
          theme: 'light',
          language: dataId.language || dataId.idioma,
          currency: dataId.currency || dataId.moeda,
        };
      }

      return null;
    } catch (err) {
      console.error('Erro ao consultar a tabela settings no Supabase:', err);
      return null;
    }
  },

  /**
   * Persiste as configurações de tema, idioma e moeda na tabela settings do Supabase.
   */
  async updateSettings(
    userId: string,
    updates: { theme?: ThemePreference | 'claro' | 'escuro' | 'sistema'; language?: string; currency?: string }
  ): Promise<boolean> {
    try {
      if (!userId) return false;

      const payload: Record<string, any> = {
        user_id: userId,
        updated_at: new Date().toISOString(),
      };

      // O Grana+ usa exclusivamente o tema claro.
      payload.theme = 'light';

      if (updates.language) {
        payload.language = updates.language;
      }

      if (updates.currency) {
        payload.currency = updates.currency;
      }

      // 1. Tenta upsert com user_id
      const { error } = await supabase
        .from('settings')
        .upsert([payload], { onConflict: 'user_id' });

      if (error) {
        // 2. Fallback: tenta upsert com chave id
        const { user_id: _, ...rest } = payload;
        const payloadId = {
          ...rest,
          id: userId,
        };

        const { error: errorId } = await supabase
          .from('settings')
          .upsert([payloadId], { onConflict: 'id' });

        if (errorId) {
          console.warn('Erro ao persitir em settings (usando fallback local):', errorId.message);
          return false;
        }
      }

      return true;
    } catch (err) {
      console.error('Erro inesperado em SettingsService.updateSettings:', err);
      return false;
    }
  },

  /**
   * Atalho para atualizar apenas o tema
   */
  async updateTheme(userId: string, _theme?: ThemePreference | 'claro' | 'escuro' | 'sistema'): Promise<boolean> {
    return this.updateSettings(userId, { theme: 'light' });
  }
};

export default SettingsService;
