/**
 * Analytics Service Integration Points
 * Prepared for production deployment: Google Analytics 4, Microsoft Clarity, Meta Pixel.
 * Disabled by default until production keys are injected via environment variables.
 */

interface AnalyticsEvent {
  action: string;
  category?: string;
  label?: string;
  value?: number;
  [key: string]: unknown;
}

class AnalyticsService {
  private isInitialized = false;

  public init() {
    if (this.isInitialized) return;

    const env = (import.meta as unknown as { env?: Record<string, string> }).env || {};

    // Google Analytics 4 Placeholder
    const gaId = env.VITE_GA_MEASUREMENT_ID;
    if (gaId) {
      this.loadScript(`https://www.googletagmanager.com/gtag/js?id=${gaId}`);
      window.dataLayer = window.dataLayer || [];
      function gtag(...args: unknown[]) {
        (window.dataLayer as unknown[]).push(args);
      }
      gtag('js', new Date());
      gtag('config', gaId);
    }

    // Microsoft Clarity Placeholder
    const clarityId = env.VITE_CLARITY_ID;
    if (clarityId) {
      /* eslint-disable */
      const win = window as any;
      win.clarity = win.clarity || function() { (win.clarity.q = win.clarity.q || []).push(arguments) };
      const t = document.createElement('script');
      t.async = true;
      t.src = "https://www.clarity.ms/tag/" + clarityId;
      const y = document.getElementsByTagName('script')[0];
      if (y && y.parentNode) {
        y.parentNode.insertBefore(t, y);
      }
      /* eslint-enable */
    }

    this.isInitialized = true;
  }

  public trackEvent({ action, category, label, value, ...rest }: AnalyticsEvent) {
    if (!this.isInitialized) return;

    if (window.gtag) {
      window.gtag('event', action, {
        event_category: category,
        event_label: label,
        value,
        ...rest,
      });
    }
  }

  private loadScript(src: string) {
    const script = document.createElement('script');
    script.async = true;
    script.src = src;
    document.head.appendChild(script);
  }
}

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export const analytics = new AnalyticsService();
