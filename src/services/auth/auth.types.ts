import { User, Session } from '@supabase/supabase-js';

export interface UserProfileData {
  id: string;
  name: string;
  email: string | null;
  avatar_url?: string | null;
  currency?: string;
  current_balance?: number;
  monthly_income?: number;
  has_credit_card?: boolean;
  onboarding_completed?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface SignUpParams {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
}

export interface SignInParams {
  email: string;
  password: string;
}

export interface ResetPasswordParams {
  email: string;
}

export interface UpdatePasswordParams {
  newPassword: string;
  confirmPassword?: string;
}

export interface AuthResponse<T = void> {
  data: T | null;
  error: string | null;
  session?: Session | null;
  user?: User | null;
  profile?: UserProfileData | null;
  needsConfirmation?: boolean;
}
