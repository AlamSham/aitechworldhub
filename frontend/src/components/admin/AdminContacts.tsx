'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { fetchContactMessages, markContactMessageRead, ContactMsg } from '../../lib/api';
import { getStoredToken } from '../../lib/auth';

export default function AdminContacts() {
  const [token, setToken] = useState('');
  const [messages, setMessages] = useState<ContactMsg[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const storedToken = getStoredToken();
    if (!storedToken) {
      window.location.href = '/admin';
      return;
    }
    setToken(storedToken);
    loadMessages(storedToken);
  }, []);

  async function loadMessages(t: string) {
    try {
      const data = await fetchContactMessages(t);
      setMessages(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkRead(id: string) {
    try {
      const updated = await markContactMessageRead(token, id);
      setMessages((prev) => prev.map((msg) => (msg._id === id ? updated : msg)));
    } catch (err: any) {
      alert('Failed to update message: ' + err.message);
    }
  }

  if (loading) return <div className="p-8 text-slate-500">Loading messages...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  return (
    <section className="grid gap-6">
      <header className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-lg shadow-slate-900/5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">Inbound Communications</p>
            <h1 className="font-display text-3xl font-bold text-slate-900">Contact Messages</h1>
            <p className="text-sm text-slate-600">Total Messages: {messages.length}</p>
          </div>
          <Link
            href="/admin"
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-sky-400 hover:text-sky-700"
          >
            Back to Dashboard
          </Link>
        </div>
      </header>

      <div className="grid gap-4">
        {messages.map((msg) => (
          <article key={msg._id} className={`grid gap-3 rounded-2xl border ${msg.status === 'unread' ? 'border-sky-300 bg-sky-50/50' : 'border-slate-200 bg-white'} p-5 shadow-sm shadow-slate-900/5 transition`}>
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200/50 pb-3">
              <div className="space-y-1">
                <h2 className="font-display text-lg font-bold text-slate-900">{msg.name}</h2>
                <a href={`mailto:${msg.email}`} className="text-sm font-medium text-sky-600 hover:underline">{msg.email}</a>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${msg.status === 'unread' ? 'bg-rose-100 border-rose-300 text-rose-700' : 'bg-slate-100 border-slate-300 text-slate-500'}`}>
                  {msg.status}
                </span>
                <span className="text-xs text-slate-400">{new Date(msg.submittedAt).toLocaleString()}</span>
              </div>
            </div>

            <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700 mt-2">{msg.message}</p>

            {msg.status === 'unread' && (
              <div className="mt-2 text-right">
                <button
                  onClick={() => handleMarkRead(msg._id)}
                  className="rounded-lg bg-sky-100 px-4 py-2 text-xs font-bold text-sky-700 transition hover:bg-sky-200"
                >
                  Mark as Read
                </button>
              </div>
            )}
          </article>
        ))}
        {messages.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
            No contact messages yet.
          </div>
        )}
      </div>
    </section>
  );
}
