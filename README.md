# Grana+ — Copiloto Financeiro Inteligente 🚀

O **Grana+** é uma aplicação completa de gestão financeira pessoal com cálculo dinâmico de **Dinheiro Livre™**, controle unificado de carteira, cartões de crédito, patrimônio, relatórios visuais e metas financeiras.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Lucide React
- **Internacionalização:** i18next (Suporte a PT-BR e EN-US)
- **State Management:** Zustand
- **Backend / Database:** Supabase (Auth, Postgres Database, Policies)
- **Deployment:** Vercel / Cloud Run

---

## 📋 Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com base no `.env.example`:

```env
# SUPABASE (Obrigatório)
VITE_SUPABASE_URL=https://sua-instancia.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=seu_anon_key_aqui

# GEMINI AI (Opcional - injetado em runtime)
GEMINI_API_KEY=sua_chave_gemini_aqui

# ANALYTICS (Opcional)
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_CLARITY_ID=XXXXXXXXXX
```

---

## 🚀 Como Executar Localmente

1. **Instalar dependências:**
   ```bash
   npm install
   ```

2. **Iniciar servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

3. **Executar verificação de tipos (Lint):**
   ```bash
   npm run lint
   ```

4. **Gerar Build de Produção:**
   ```bash
   npm run build
   ```

---

## ☁️ Deploy na Vercel

1. Importe o repositório no dashboard da **Vercel**.
2. Configure as Variáveis de Ambiente (`VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY`).
3. O arquivo `vercel.json` na raiz cuidará do roteamento de SPA e dos cabeçalhos de segurança (Security Headers).
4. Clique em **Deploy**.

---

## 🛡️ Segurança & Produção

- RLS (Row Level Security) ativado em todas as tabelas do Supabase.
- Headers HTTP de segurança pré-configurados (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`).
- Error Boundary para capturar falhas globais da UI sem travar a aplicação.
- PWA Manifest e tags de SEO/Open Graph prontas.
