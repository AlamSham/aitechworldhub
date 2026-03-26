'use client';

import { useState } from 'react';
import { subscribeNewsletter } from '../../lib/api';
import CaptchaField from './CaptchaField';

export default function SubscribeForm() {
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const captchaEnabled = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    try {
      if (captchaEnabled && !captchaToken) {
        setStatus('error');
        setMessage('Please complete the captcha challenge.');
        return;
      }

      const res = await subscribeNewsletter(email, captchaToken, website);
      setStatus('success');
      setMessage(res.message || 'Subscribed successfully!');
      setEmail('');
      setWebsite('');
      setCaptchaToken('');
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'Failed to subscribe.');
    }
  };

  return (
    <div className="space-y-3">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === 'loading' || status === 'success'}
          required
          placeholder="your@email.com"
          className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:opacity-50"
        />
        <input
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          className="hidden"
          aria-hidden="true"
        />
        <button
          type="submit"
          disabled={status === 'loading' || status === 'success'}
          className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-50"
        >
          {status === 'loading' ? '...' : status === 'success' ? 'Done' : 'Subscribe'}
        </button>
      </form>
      {captchaEnabled ? <CaptchaField onTokenChange={setCaptchaToken} /> : null}
      {message && (
        <p className={`text-xs ${status === 'success' ? 'text-green-600' : 'text-red-500'}`}>
          {message}
        </p>
      )}
    </div>
  );
}
