import { supabase } from '../../lib/supabase';
import { ProfileService } from '../profile/profileService';
import {
  SignUpParams,
  SignInParams,
  ResetPasswordParams,
  UpdatePasswordParams,
  AuthResponse,
  UserProfileData
} from './auth.types';

/**
 * Traduz erros do Supabase Auth para mensagens amigáveis em português.
 */
export const translateAuthError = (errorMsg: string): string => {
  const msg = errorMsg.toLowerCase();

  if (msg.includes('invalid login credentials') || msg.includes('invalid_credentials')) {
    return 'E-mail ou senha incorretos. Por favor, verifique suas credenciais.';
  }
  if (msg.includes('email not confirmed')) {
    return 'E-mail ainda não confirmado. Verifique sua caixa de entrada para ativar a conta.';
  }
  if (msg.includes('user already registered') || msg.includes('already exists')) {
    return 'Este e-mail já está cadastrado no Grana+. Tente fazer login.';
  }
  if (msg.includes('password should be at least')) {
    return 'A senha deve ter pelo menos 6 caracteres.';
  }
  if (msg.includes('invalid email') || msg.includes('unable to validate email address')) {
    return 'Por favor, insira um e-mail válido.';
  }
  if (msg.includes('user not found') || msg.includes('no user found')) {
    return 'Usuário não encontrado. Verifique o e-mail digitado.';
  }
  if (msg.includes('rate limit') || msg.includes('too many requests')) {
    return 'Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente novamente.';
  }
  if (msg.includes('same password')) {
    return 'A nova senha não pode ser igual à senha atual.';
  }

  return errorMsg || 'Ocorreu um erro ao processar sua solicitação de autenticação.';
};

/**
 * Busca o perfil do usuário na tabela public.profiles
 */
export const getProfile = async (userId: string, authUser?: any): Promise<UserProfileData | null> => {
  return await ProfileService.getProfile(userId, authUser);
};

/**
 * Garante que o registro em public.profiles exista para o usuário do auth.users
 */
export const ensureProfileExists = async (
  userId: string,
  name: string,
  email: string
): Promise<UserProfileData | null> => {
  const tempAuthUser = {
    id: userId,
    email: email,
    user_metadata: { full_name: name }
  } as any;
  return await ProfileService.ensureProfile(userId, tempAuthUser);
};

/**
 * Realiza o cadastro de um novo usuário no Supabase Auth e sincroniza com a tabela profiles.
 */
export const signUp = async (params: SignUpParams): Promise<AuthResponse<{ user: any; profile: UserProfileData | null }>> => {
  try {
    const { name, email, password, confirmPassword } = params;

    if (!name || name.trim().length === 0) {
      return { data: null, error: 'Por favor, informe seu nome completo.' };
    }
    if (!email || !email.includes('@')) {
      return { data: null, error: 'Por favor, informe um endereço de e-mail válido.' };
    }
    if (!password || password.length < 6) {
      return { data: null, error: 'A senha deve possuir no mínimo 6 caracteres.' };
    }
    if (confirmPassword !== undefined && password !== confirmPassword) {
      return { data: null, error: 'As senhas digitadas não coincidem.' };
    }

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: name.trim(),
          name: name.trim()
        },
        emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/login` : undefined
      }
    });

    if (error) {
      return { data: null, error: translateAuthError(error.message) };
    }

    const user = data.user;
    let profile: UserProfileData | null = null;

    if (user) {
      profile = await ensureProfileExists(user.id, name.trim(), email.trim());
    }

    // Verifica se exige confirmação por e-mail
    const needsConfirmation = !data.session;

    return {
      data: { user, profile },
      session: data.session,
      user,
      profile,
      needsConfirmation,
      error: null
    };
  } catch (err: any) {
    return { data: null, error: translateAuthError(err?.message || '') };
  }
};

/**
 * Realiza o login do usuário via e-mail e senha.
 */
export const signIn = async (params: SignInParams): Promise<AuthResponse<{ user: any; profile: UserProfileData | null }>> => {
  try {
    const { email, password } = params;

    if (!email || !email.includes('@')) {
      return { data: null, error: 'Por favor, informe um e-mail válido.' };
    }
    if (!password) {
      return { data: null, error: 'Por favor, informe sua senha.' };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password
    });

    if (error) {
      return { data: null, error: translateAuthError(error.message) };
    }

    const user = data.user;
    let profile = await getProfile(user.id);

    if (!profile) {
      const userName = user.user_metadata?.full_name || user.user_metadata?.name || 'Usuário Grana+';
      profile = await ensureProfileExists(user.id, userName, user.email || email);
    }

    return {
      data: { user, profile },
      session: data.session,
      user,
      profile,
      error: null
    };
  } catch (err: any) {
    return { data: null, error: translateAuthError(err?.message || '') };
  }
};

/**
 * Solicita o e-mail para redefinição de senha.
 */
export const resetPasswordForEmail = async (params: ResetPasswordParams): Promise<AuthResponse> => {
  try {
    const { email } = params;

    if (!email || !email.includes('@')) {
      return { data: null, error: 'Por favor, informe um e-mail válido.' };
    }

    const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/forgot-password` : undefined;

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo
    });

    if (error) {
      return { data: null, error: translateAuthError(error.message) };
    }

    return { data: null, error: null };
  } catch (err: any) {
    return { data: null, error: translateAuthError(err?.message || '') };
  }
};

/**
 * Atualiza a senha do usuário autenticado após clicar no link de redefinição.
 */
export const updatePassword = async (params: UpdatePasswordParams): Promise<AuthResponse> => {
  try {
    const { newPassword, confirmPassword } = params;

    if (!newPassword || newPassword.length < 6) {
      return { data: null, error: 'A nova senha deve possuir no mínimo 6 caracteres.' };
    }
    if (confirmPassword !== undefined && newPassword !== confirmPassword) {
      return { data: null, error: 'As senhas não coincidem.' };
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      return { data: null, error: translateAuthError(error.message) };
    }

    return { data: null, error: null };
  } catch (err: any) {
    return { data: null, error: translateAuthError(err?.message || '') };
  }
};

/**
 * Encerra a sessão do usuário.
 */
export const signOut = async (): Promise<AuthResponse> => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      return { data: null, error: translateAuthError(error.message) };
    }
    return { data: null, error: null };
  } catch (err: any) {
    return { data: null, error: translateAuthError(err?.message || '') };
  }
};

/**
 * Obtém o usuário e a sessão atuais.
 */
export const getCurrentSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session) return null;
  return data.session;
};

export const authService = {
  signUp,
  signIn,
  signOut,
  resetPasswordForEmail,
  updatePassword,
  getProfile,
  ensureProfileExists,
  getCurrentSession,
  translateAuthError
};

export default authService;
