'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { fetchSubscribers, Subscriber } from '../../lib/api';
import { getStoredToken } from '../../lib/auth';

export default function AdminSubscribers() {
  const [token, setToken] = useState('');
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const storedToken = getStoredToken();
    if (!storedToken) {
      window.location.href = '/admin';
      return;
    }
    setToken(storedToken);
    loadSubscribers(storedToken);
  }, []);

  async function loadSubscribers(t: string) {
    try {
      const data = await fetchSubscribers(t);
      setSubscribers(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load subscribers');
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="p-8 text-slate-500">Loading subscribers...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  return (
    <section className="grid gap-6">
      <header className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-lg shadow-slate-900/5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">Audience Growth</p>
            <h1 className="font-display text-3xl font-bold text-slate-900">Newsletter Subscribers</h1>
            <p className="text-sm text-slate-600">Total Subscribers: {subscribers.length}</p>
          </div>
          <Link
            href="/admin"
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-sky-400 hover:text-sky-700"
          >
            Back to Dashboard
          </Link>
        </div>
      </header>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-700">
            <tr>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Subscribed At</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {subscribers.map((sub) => (
              <tr key={sub._id} className="hover:bg-slate-50 transition">
                <td className="px-6 py-4 font-medium text-slate-900">{sub.email}</td>
                <td className="px-6 py-4">{new Date(sub.subscribedAt).toLocaleString()}</td>
              </tr>
            ))}
            {subscribers.length === 0 && (
              <tr>
                <td colSpan={2} className="px-6 py-8 text-center text-slate-500">No subscribers yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
