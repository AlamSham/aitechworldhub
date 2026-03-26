'use client';

import { useEffect, useRef } from 'react';

const TURNSTILE_SCRIPT_ID = 'cf-turnstile-script';
const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '';

type Props = {
  onTokenChange: (token: string) => void;
};

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: Record<string, unknown>) => string;
      remove?: (widgetId: string) => void;
    };
  }
}

function ensureTurnstileScript() {
  if (document.getElementById(TURNSTILE_SCRIPT_ID)) return Promise.resolve();

  return new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.id = TURNSTILE_SCRIPT_ID;
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load captcha script'));
    document.head.appendChild(script);
  });
}

export default function CaptchaField({ onTokenChange }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string>('');

  useEffect(() => {
    onTokenChange('');
    if (!siteKey || !containerRef.current) return undefined;

    let isUnmounted = false;

    const renderWidget = async () => {
      try {
        await ensureTurnstileScript();
        if (isUnmounted || !containerRef.current || !window.turnstile) return;

        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          callback: (token: string) => onTokenChange(token),
          'expired-callback': () => onTokenChange(''),
          'error-callback': () => onTokenChange('')
        });
      } catch {
        onTokenChange('');
      }
    };

    renderWidget();

    return () => {
      isUnmounted = true;
      onTokenChange('');
      if (widgetIdRef.current && window.turnstile?.remove) {
        window.turnstile.remove(widgetIdRef.current);
      }
    };
  }, [onTokenChange]);

  if (!siteKey) return null;

  return (
    <div className="grid gap-1">
      <div ref={containerRef} />
      <p className="text-[11px] text-slate-400">Protected by Cloudflare Turnstile.</p>
    </div>
  );
}
