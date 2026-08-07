import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Retrieve Vite environment variables safely
const getViteEnv = (key: string): string => {
  const metaEnv = (import.meta as unknown as { env?: Record<string, string> }).env;
  return (metaEnv && metaEnv[key]) ? metaEnv[key] : '';
};

/**
 * Sanitiza a URL do Supabase garantindo que seja utilizada estritamente a Project URL base
 * (ex: https://SEU_PROJETO.supabase.co) e nunca com /rest/v1 ou barras no final.
 */
const sanitizeSupabaseUrl = (rawUrl: string): string => {
  let cleaned = rawUrl.trim();
  if (!cleaned) return 'https://placeholder-project.supabase.co';
  
  // Remove barra no final
  cleaned = cleaned.replace(/\/+$/, '');
  
  // Se contiver /rest/v1 no final (ou /rest/v1/), remove esse sufixo
  cleaned = cleaned.replace(/\/rest\/v1\/?$/i, '');
  
  // Remove novamente qualquer barra sobressalente no final
  cleaned = cleaned.replace(/\/+$/, '');
  
  return cleaned;
};

const rawSupabaseUrl = getViteEnv('VITE_SUPABASE_URL');
const supabaseUrl = sanitizeSupabaseUrl(rawSupabaseUrl);

const supabasePublishableKey = 
  getViteEnv('VITE_SUPABASE_PUBLISHABLE_KEY') || 
  getViteEnv('VITE_SUPABASE_ANON_KEY') || 
  'placeholder-publishable-key';

/**
 * Cliente único exportado do Supabase para o projeto Grana+
 * Utiliza exclusivamente a URL Base do Projeto Supabase.
 */
export const supabase: SupabaseClient = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

/**
 * Função de validação para verificar se o cliente Supabase foi inicializado corretamente.
 * Não faz consultas no banco de dados e não autentica usuários.
 */
export const checkSupabaseClient = (): { isInitialized: boolean; hasCustomConfig: boolean; message: string } => {
  const isCustomUrl = supabaseUrl !== 'https://placeholder-project.supabase.co' && supabaseUrl.trim() !== '';
  const isCustomKey = supabasePublishableKey !== 'placeholder-publishable-key' && supabasePublishableKey.trim() !== '';

  const isInitialized = Boolean(supabase);
  const hasCustomConfig = isCustomUrl && isCustomKey;

  return {
    isInitialized,
    hasCustomConfig,
    message: isInitialized
      ? hasCustomConfig
        ? 'Cliente Supabase inicializado e configurado com a URL base do projeto.'
        : 'Cliente Supabase inicializado com valores placeholder. Configure as variáveis em .env.local'
      : 'Falha ao inicializar o cliente Supabase.',
  };
};

export default supabase;

