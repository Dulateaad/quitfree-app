declare global {
  interface Window {
    gtag?: (
      command: 'config' | 'event' | 'js',
      targetId: string,
      config?: Record<string, unknown>
    ) => void;
  }
}

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export function isGAEnabled(): boolean {
  return typeof GA_MEASUREMENT_ID === 'string' && GA_MEASUREMENT_ID.length > 0;
}

export function pageview(url: string, title?: string): void {
  if (!isGAEnabled() || typeof window?.gtag !== 'function') return;
  window.gtag!('config', GA_MEASUREMENT_ID!, {
    page_path: url,
    page_title: title,
  });
}

export function event(
  action: string,
  params?: Record<string, string | number | boolean | undefined>
): void {
  if (!isGAEnabled() || typeof window?.gtag !== 'function') return;
  window.gtag!('event', action, params);
}
