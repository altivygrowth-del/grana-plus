import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// pt-BR
import ptCommon from './locales/pt-BR/common.json';
import ptSidebar from './locales/pt-BR/sidebar.json';
import ptHeader from './locales/pt-BR/header.json';
import ptDashboard from './locales/pt-BR/dashboard.json';
import ptWallet from './locales/pt-BR/wallet.json';
import ptTransactions from './locales/pt-BR/transactions.json';
import ptCards from './locales/pt-BR/cards.json';
import ptGoals from './locales/pt-BR/goals.json';
import ptPlanning from './locales/pt-BR/planning.json';
import ptPatrimonio from './locales/pt-BR/patrimonio.json';
import ptReports from './locales/pt-BR/reports.json';
import ptSettings from './locales/pt-BR/settings.json';
import ptAuth from './locales/pt-BR/auth.json';
import ptOnboarding from './locales/pt-BR/onboarding.json';

// en-US
import enCommon from './locales/en-US/common.json';
import enSidebar from './locales/en-US/sidebar.json';
import enHeader from './locales/en-US/header.json';
import enDashboard from './locales/en-US/dashboard.json';
import enWallet from './locales/en-US/wallet.json';
import enTransactions from './locales/en-US/transactions.json';
import enCards from './locales/en-US/cards.json';
import enGoals from './locales/en-US/goals.json';
import enPlanning from './locales/en-US/planning.json';
import enPatrimonio from './locales/en-US/patrimonio.json';
import enReports from './locales/en-US/reports.json';
import enSettings from './locales/en-US/settings.json';
import enAuth from './locales/en-US/auth.json';
import enOnboarding from './locales/en-US/onboarding.json';

// es-ES
import esCommon from './locales/es-ES/common.json';
import esSidebar from './locales/es-ES/sidebar.json';
import esHeader from './locales/es-ES/header.json';
import esDashboard from './locales/es-ES/dashboard.json';
import esWallet from './locales/es-ES/wallet.json';
import esTransactions from './locales/es-ES/transactions.json';
import esCards from './locales/es-ES/cards.json';
import esGoals from './locales/es-ES/goals.json';
import esPlanning from './locales/es-ES/planning.json';
import esPatrimonio from './locales/es-ES/patrimonio.json';
import esReports from './locales/es-ES/reports.json';
import esSettings from './locales/es-ES/settings.json';
import esAuth from './locales/es-ES/auth.json';
import esOnboarding from './locales/es-ES/onboarding.json';

const savedLang = localStorage.getItem('grana_language') || 'pt-BR';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      'pt-BR': {
        common: ptCommon,
        sidebar: ptSidebar,
        header: ptHeader,
        dashboard: ptDashboard,
        wallet: ptWallet,
        transactions: ptTransactions,
        cards: ptCards,
        goals: ptGoals,
        planning: ptPlanning,
        patrimonio: ptPatrimonio,
        reports: ptReports,
        settings: ptSettings,
        auth: ptAuth,
        onboarding: ptOnboarding,
      },
      'en-US': {
        common: enCommon,
        sidebar: enSidebar,
        header: enHeader,
        dashboard: enDashboard,
        wallet: enWallet,
        transactions: enTransactions,
        cards: enCards,
        goals: enGoals,
        planning: enPlanning,
        patrimonio: enPatrimonio,
        reports: enReports,
        settings: enSettings,
        auth: enAuth,
        onboarding: enOnboarding,
      },
      'es-ES': {
        common: esCommon,
        sidebar: esSidebar,
        header: esHeader,
        dashboard: esDashboard,
        wallet: esWallet,
        transactions: esTransactions,
        cards: esCards,
        goals: esGoals,
        planning: esPlanning,
        patrimonio: esPatrimonio,
        reports: esReports,
        settings: esSettings,
        auth: esAuth,
        onboarding: esOnboarding,
      },
    },
    lng: savedLang,
    fallbackLng: 'pt-BR',
    defaultNS: 'common',
    interpolation: {
      escapeValue: false, // React handles XSS
    },
  });

export default i18n;
