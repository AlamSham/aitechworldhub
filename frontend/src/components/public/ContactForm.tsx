'use client';

import { useState } from 'react';
import { submitContactMessage } from '../../lib/api';
import CaptchaField from './CaptchaField';

export default function ContactForm() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [website, setWebsite] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [responseMsg, setResponseMsg] = useState('');
  const captchaEnabled = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setStatus('loading');
    try {
      if (captchaEnabled && !captchaToken) {
        setStatus('error');
        setResponseMsg('Please complete the captcha challenge.');
        return;
      }

      const res = await submitContactMessage({
        ...formData,
        website,
        captchaToken
      });
      setStatus('success');
      setResponseMsg(res.message || 'Message sent successfully! We will get back to you soon.');
      setFormData({ name: '', email: '', message: '' });
      setWebsite('');
      setCaptchaToken('');
    } catch (err: any) {
      setStatus('error');
      setResponseMsg(err.message || 'Failed to send message.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      <div className="grid gap-1.5">
        <label htmlFor="name" className="text-sm font-semibold text-slate-700">Name</label>
        <input 
          type="text" 
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          disabled={status === 'loading' || status === 'success'}
          required
          className="rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-1 focus:ring-slate-500 disabled:opacity-50 disabled:bg-slate-50"
          placeholder="Your name"
        />
      </div>
      
      <div className="grid gap-1.5">
        <label htmlFor="email" className="text-sm font-semibold text-slate-700">Email Address</label>
        <input 
          type="email" 
          id="email" 
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          disabled={status === 'loading' || status === 'success'}
          required
          className="rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-1 focus:ring-slate-500 disabled:opacity-50 disabled:bg-slate-50"
          placeholder="your@email.com"
        />
      </div>

      <div className="grid gap-1.5">
        <label htmlFor="message" className="text-sm font-semibold text-slate-700">Message</label>
        <textarea 
          id="message" 
          rows={5}
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          disabled={status === 'loading' || status === 'success'}
          required
          className="rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-1 focus:ring-slate-500 resize-none disabled:opacity-50 disabled:bg-slate-50"
          placeholder="How can we help?"
        />
      </div>

      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        className="hidden"
        aria-hidden="true"
      />

      {captchaEnabled ? <CaptchaField onTokenChange={setCaptchaToken} /> : null}

      <button 
        type="submit" 
        disabled={status === 'loading' || status === 'success'}
        className="mt-2 w-full rounded-xl bg-slate-900 px-6 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-50"
      >
        {status === 'loading' ? 'Sending...' : status === 'success' ? 'Sent!' : 'Send Message'}
      </button>

      {responseMsg && (
        <div className={`rounded-xl p-4 text-sm font-medium ${status === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {responseMsg}
        </div>
      )}
    </form>
  );
}
