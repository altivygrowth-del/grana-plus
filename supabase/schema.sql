-- ========================================================
-- SCHEMA DE BANCO DE DADOS COMPLETO - GRANA+ (SUPABASE)
-- Copie este conteúdo diretamente no SQL Editor do Supabase
-- ========================================================

-- Habilitar extensão para geração de UUIDs se necessário
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- --------------------------------------------------------
-- FUNÇÃO REUTILIZÁVEL PARA ATUALIZAR O CAMPO updated_at
-- --------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ========================================================
-- 1. TABELA: PROFILES
-- ========================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    avatar_url TEXT,
    currency TEXT NOT NULL DEFAULT 'BRL',
    current_balance NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    monthly_income NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    has_credit_card BOOLEAN NOT NULL DEFAULT false,
    onboarding_completed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================================
-- 2. TABELA: ACCOUNTS (Contas Bancárias / Carteiras)
-- ========================================================
CREATE TABLE IF NOT EXISTS public.accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'Corrente',
    balance NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    color TEXT,
    icon TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================================
-- 3. TABELA: TRANSACTIONS (Movimentações Financeiras)
-- ========================================================
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    category TEXT NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'pending')),
    payment_method TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================================
-- 4. TABELA: CARDS (Cartões de Crédito)
-- ========================================================
CREATE TABLE IF NOT EXISTS public.cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    bank TEXT NOT NULL,
    last_digits TEXT,
    card_limit NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    current_usage NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    closing_day INT CHECK (closing_day BETWEEN 1 AND 31),
    due_day INT CHECK (due_day BETWEEN 1 AND 31),
    color TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================================
-- 5. TABELA: GOALS (Metas Financeiras)
-- ========================================================
CREATE TABLE IF NOT EXISTS public.goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT,
    target_amount NUMERIC(15, 2) NOT NULL,
    current_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    deadline DATE,
    icon TEXT,
    color TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================================
-- 6. TABELA: ASSETS (Patrimônio / Ativos)
-- ========================================================
CREATE TABLE IF NOT EXISTS public.assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    value NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    acquisition_date DATE,
    last_updated_info TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================================
-- 7. TABELA: SETTINGS (Configurações do Usuário)
-- ========================================================
CREATE TABLE IF NOT EXISTS public.settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    theme TEXT NOT NULL DEFAULT 'dark',
    notifications_enabled BOOLEAN NOT NULL DEFAULT true,
    email_alerts BOOLEAN NOT NULL DEFAULT true,
    weekly_report BOOLEAN NOT NULL DEFAULT true,
    privacy_mode BOOLEAN NOT NULL DEFAULT false,
    default_payment_method TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================================
-- 8. TABELA: SUBSCRIPTIONS (Assinaturas e Planos)
-- ========================================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    plan_name TEXT NOT NULL DEFAULT 'Grana+ Free',
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'trialing')),
    billing_cycle TEXT DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
    price NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    starts_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    canceled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================================
-- TRIGGERS PARA ATUALIZAR AUTOMATICAMENTE updated_at
-- ========================================================
CREATE TRIGGER trigger_update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_update_accounts_updated_at BEFORE UPDATE ON public.accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_update_transactions_updated_at BEFORE UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_update_cards_updated_at BEFORE UPDATE ON public.cards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_update_goals_updated_at BEFORE UPDATE ON public.goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_update_assets_updated_at BEFORE UPDATE ON public.assets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_update_settings_updated_at BEFORE UPDATE ON public.settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================================
-- ÍNDICES DE DESEMPENHO E ESCALABILIDADE
-- ========================================================
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON public.accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON public.transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(date);
CREATE INDEX IF NOT EXISTS idx_cards_user_id ON public.cards(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON public.goals(user_id);
CREATE INDEX IF NOT EXISTS idx_assets_user_id ON public.assets(user_id);
CREATE INDEX IF NOT EXISTS idx_settings_user_id ON public.settings(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);

-- ========================================================
-- SEGURANÇA: ROW LEVEL SECURITY (RLS)
-- ========================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS RLS - PROFILES
CREATE POLICY "Usuários acessam apenas seu próprio perfil (SELECT)" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Usuários criam apenas seu próprio perfil (INSERT)" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Usuários atualizam apenas seu próprio perfil (UPDATE)" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Usuários deletam apenas seu próprio perfil (DELETE)" ON public.profiles FOR DELETE USING (auth.uid() = id);

-- POLÍTICAS RLS - ACCOUNTS
CREATE POLICY "Usuários acessam suas próprias contas" ON public.accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Usuários criam suas próprias contas" ON public.accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuários atualizam suas próprias contas" ON public.accounts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Usuários deletam suas próprias contas" ON public.accounts FOR DELETE USING (auth.uid() = user_id);

-- POLÍTICAS RLS - TRANSACTIONS
CREATE POLICY "Usuários acessam suas próprias movimentações" ON public.transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Usuários criam suas próprias movimentações" ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuários atualizam suas próprias movimentações" ON public.transactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Usuários deletam suas próprias movimentações" ON public.transactions FOR DELETE USING (auth.uid() = user_id);

-- POLÍTICAS RLS - CARDS
CREATE POLICY "Usuários acessam seus próprios cartões" ON public.cards FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Usuários criam seus próprios cartões" ON public.cards FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuários atualizam seus próprios cartões" ON public.cards FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Usuários deletam seus próprios cartões" ON public.cards FOR DELETE USING (auth.uid() = user_id);

-- POLÍTICAS RLS - GOALS
CREATE POLICY "Usuários acessam suas próprias metas" ON public.goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Usuários criam suas próprias metas" ON public.goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuários atualizam suas próprias metas" ON public.goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Usuários deletam suas próprias metas" ON public.goals FOR DELETE USING (auth.uid() = user_id);

-- POLÍTICAS RLS - ASSETS
CREATE POLICY "Usuários acessam seus próprios ativos" ON public.assets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Usuários criam seus próprios ativos" ON public.assets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuários atualizam seus próprios ativos" ON public.assets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Usuários deletam seus próprios ativos" ON public.assets FOR DELETE USING (auth.uid() = user_id);

-- POLÍTICAS RLS - SETTINGS
CREATE POLICY "Usuários acessam suas próprias configurações" ON public.settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Usuários criam suas próprias configurações" ON public.settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuários atualizam suas próprias configurações" ON public.settings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Usuários deletam suas próprias configurações" ON public.settings FOR DELETE USING (auth.uid() = user_id);

-- POLÍTICAS RLS - SUBSCRIPTIONS
CREATE POLICY "Usuários acessam suas próprias assinaturas" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Usuários criam suas próprias assinaturas" ON public.subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuários atualizam suas próprias assinaturas" ON public.subscriptions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Usuários deletam suas próprias assinaturas" ON public.subscriptions FOR DELETE USING (auth.uid() = user_id);

-- ========================================================
-- TRIGGER AUTOMÁTICO DE CRIAÇÃO DE PERFIL NO SIGNUP
-- ========================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'Usuário Grana+'), 
    new.email
  );

  INSERT INTO public.settings (user_id)
  VALUES (new.id);

  INSERT INTO public.subscriptions (user_id, plan_name, status)
  VALUES (new.id, 'Grana+ Free', 'active');

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
