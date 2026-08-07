import i18n from '../i18n';

/**
 * Retorna o locale ativo com base no i18n ou localStorage
 */
export const getActiveLocale = (): string => {
  const lang = i18n.language || localStorage.getItem('grana_language') || 'pt-BR';
  if (lang === 'en-US' || lang === 'en') return 'en-US';
  if (lang === 'es-ES' || lang === 'es') return 'es-ES';
  return 'pt-BR';
};

/**
 * Retorna a moeda ativa salva no localStorage ou o padrão BRL
 */
export const getActiveCurrency = (): string => {
  return localStorage.getItem('grana_currency') || 'BRL';
};

/**
 * Formata valores monetários utilizando Intl.NumberFormat de forma limpa e internacionalizada.
 * Nunca concatena símbolos manualmente.
 */
export const formatCurrency = (
  value: number,
  currency?: string,
  locale?: string
): string => {
  const targetCurrency = currency || getActiveCurrency();
  const targetLocale = locale || getActiveLocale();

  try {
    return new Intl.NumberFormat(targetLocale, {
      style: 'currency',
      currency: targetCurrency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }
};

/**
 * Formata datas utilizando Intl.DateTimeFormat respeitando o locale do usuário.
 */
export const formatDate = (
  dateInput: string | Date,
  locale?: string,
  options?: Intl.DateTimeFormatOptions
): string => {
  if (!dateInput) return '';
  const targetLocale = locale || getActiveLocale();
  const dateObj =
    typeof dateInput === 'string'
      ? new Date(dateInput.includes('T') ? dateInput : `${dateInput}T00:00:00`)
      : dateInput;

  if (isNaN(dateObj.getTime())) return '';

  const defaultOptions: Intl.DateTimeFormatOptions = options || {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  };

  return new Intl.DateTimeFormat(targetLocale, defaultOptions).format(dateObj);
};

/**
 * Formata data curta (dia/mês) utilizando Intl.DateTimeFormat.
 */
export const formatShortDate = (
  dateInput: string | Date,
  locale?: string
): string => {
  return formatDate(dateInput, locale, {
    day: '2-digit',
    month: '2-digit',
  });
};

/**
 * Formata números com separadores decimais e de milhar adequados ao locale.
 */
export const formatNumber = (
  value: number,
  locale?: string,
  options?: Intl.NumberFormatOptions
): string => {
  const targetLocale = locale || getActiveLocale();
  return new Intl.NumberFormat(targetLocale, options).format(value);
};
