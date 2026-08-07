import { supabase } from '../../lib/supabase';
import { UserProfileData } from '../auth/auth.types';
import { User } from '@supabase/supabase-js';

export const ProfileService = {
  /**
   * Busca o perfil do usuário na tabela public.profiles pelo id (auth.uid()).
   * Se o registro não existir, cria-o automaticamente usando os dados do auth.user.
   */
  async getProfile(userId: string, authUser?: User | null): Promise<UserProfileData | null> {
    try {
      if (!userId) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Erro ao consultar perfil no Supabase:', error.message);
        if (authUser) {
          return await this.ensureProfile(userId, authUser);
        }
        return null;
      }

      // Se não encontrou o perfil na tabela, cria automaticamente
      if (!data && authUser) {
        return await this.ensureProfile(userId, authUser);
      }

      return data as UserProfileData | null;
    } catch (err: any) {
      console.error('Erro inesperado em ProfileService.getProfile:', err);
      if (authUser) {
        return await this.ensureProfile(userId, authUser);
      }
      return null;
    }
  },

  /**
   * Garante a existência do registro do usuário na tabela public.profiles.
   */
  async ensureProfile(userId: string, authUser: User): Promise<UserProfileData | null> {
    try {
      const userName = 
        authUser.user_metadata?.full_name || 
        authUser.user_metadata?.name || 
        authUser.email?.split('@')[0] || 
        'Usuário Grana+';

      const userEmail = authUser.email || '';
      const avatarUrl = authUser.user_metadata?.avatar_url || null;

      const newProfile: Partial<UserProfileData> = {
        id: userId,
        name: userName,
        email: userEmail,
        avatar_url: avatarUrl,
        currency: 'BRL',
        current_balance: 0,
        monthly_income: 0,
        has_credit_card: false,
        onboarding_completed: false
      };

      const { data, error } = await supabase
        .from('profiles')
        .upsert([newProfile], { onConflict: 'id' })
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar registro do perfil no Supabase:', error.message);
        return null;
      }

      return data as UserProfileData;
    } catch (err: any) {
      console.error('Erro inesperado ao garantir perfil:', err);
      return null;
    }
  },

  /**
   * Atualiza as informações do perfil do usuário no Supabase.
   */
  async updateProfile(userId: string, updates: Partial<UserProfileData>): Promise<UserProfileData | null> {
    try {
      if (!userId) return null;

      const payload = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('profiles')
        .update(payload)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar perfil no Supabase:', error.message);
        return null;
      }

      return data as UserProfileData;
    } catch (err: any) {
      console.error('Erro inesperado em ProfileService.updateProfile:', err);
      return null;
    }
  }
};

export default ProfileService;
