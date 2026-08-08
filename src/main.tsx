import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary';
import { analytics } from './services/analytics';
import './index.css';

// Initialize analytics points if enabled
analytics.init();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <I18nextProvider i18n={i18n}>
        <App />
      </I18nextProvider>
    </ErrorBoundary>
  </StrictMode>,
);

