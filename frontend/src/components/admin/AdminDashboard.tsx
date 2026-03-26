'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { AdminUser, Draft, DraftStatus } from '../../models/draft';
import {
  fetchDrafts,
  fetchMe,
  loginAdmin,
  triggerManualSync
} from '../../lib/api';
import {
  clearStoredAuth,
  getStoredAdmin,
  getStoredToken,
  setStoredAdmin,
  setStoredToken
} from '../../lib/auth';

type FilterValue = 'all' | DraftStatus;

function statusBadgeClass(status: DraftStatus) {
  if (status === 'published') return 'bg-emerald-100 text-emerald-700 border-emerald-300';
  if (status === 'reviewed') return 'bg-amber-100 text-amber-700 border-amber-300';
  return 'bg-sky-100 text-sky-700 border-sky-300';
}

export default function AdminDashboard() {
  const [token, setToken] = useState('');
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [filter, setFilter] = useState<FilterValue>('all');
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    const storedToken = getStoredToken();
    const storedAdmin = getStoredAdmin();
    if (!storedToken) return;

    setToken(storedToken);
    if (storedAdmin) setAdmin(storedAdmin);

    validateSession(storedToken).catch(() => {
      clearStoredAuth();
      setToken('');
      setAdmin(null);
    });
  }, []);

  async function validateSession(nextToken: string) {
    const me = await fetchMe(nextToken);
    setAdmin(me);
    setStoredAdmin(me);
    await loadDrafts(nextToken, filter);
  }

  async function loadDrafts(nextToken: string, nextFilter: FilterValue) {
    setLoading(true);
    setError('');
    try {
      const rows = await fetchDrafts(nextToken, nextFilter === 'all' ? undefined : nextFilter);
      setDrafts(rows);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setNotice('');
    setLoading(true);

    try {
      const response = await loginAdmin(email, password);
      setToken(response.token);
      setAdmin(response.admin);
      setStoredToken(response.token);
      setStoredAdmin(response.admin);
      await loadDrafts(response.token, filter);
      setNotice('Logged in successfully');
      setPassword('');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSync() {
    if (!token) return;
    setSyncing(true);
    setError('');
    setNotice('');

    try {
      const result = await triggerManualSync(token, 8);
      await loadDrafts(token, filter);
      setNotice(`Sync done. Imported ${result.importedSources}, created ${result.createdDrafts} drafts.`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSyncing(false);
    }
  }

  function handleLogout() {
    clearStoredAuth();
    setToken('');
    setAdmin(null);
    setDrafts([]);
    setNotice('Logged out');
  }

  async function onFilterChange(nextFilter: FilterValue) {
    setFilter(nextFilter);
    if (!token) return;
    await loadDrafts(token, nextFilter);
  }

  const totalLabel = useMemo(() => {
    if (loading) return 'Loading drafts...';
    return `${drafts.length} draft${drafts.length === 1 ? '' : 's'} found`;
  }, [drafts.length, loading]);

  if (!token || !admin) {
    return (
      <section className="mx-auto grid w-full max-w-md gap-6 rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-xl shadow-slate-900/5 backdrop-blur">
        <div className="space-y-2 text-center">
          <p className="inline-flex rounded-full border border-sky-300 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">
            Admin Access
          </p>
          <h1 className="font-display text-3xl font-bold text-slate-900">Publish Control Room</h1>
          <p className="text-sm text-slate-600">Login to review drafts, upload images, and publish live posts.</p>
        </div>

        <form className="grid gap-4" onSubmit={handleLogin}>
          <label className="grid gap-2 text-sm text-slate-700">
            Email
            <input
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none transition focus:border-sky-500"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@example.com"
            />
          </label>

          <label className="grid gap-2 text-sm text-slate-700">
            Password
            <input
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none transition focus:border-sky-500"
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="********"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {error ? <p className="rounded-xl border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}
      </section>
    );
  }

  return (
    <section className="grid gap-6">
      <header className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-lg shadow-slate-900/5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">Admin Dashboard</p>
            <h1 className="font-display text-3xl font-bold text-slate-900">China vs US AI Editorial Desk</h1>
            <p className="text-sm text-slate-600">Welcome, {admin.fullName}. Manage drafts, run sync, and publish quickly.</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleSync}
              disabled={syncing}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-sky-400 hover:text-sky-700 disabled:cursor-not-allowed"
            >
              {syncing ? 'Syncing...' : 'Run Manual Sync'}
            </button>
            <Link
              href="/admin/subscribers"
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-sky-400 hover:text-sky-700"
            >
              Subscribers
            </Link>
            <Link
              href="/admin/contacts"
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-sky-400 hover:text-sky-700"
            >
              Messages
            </Link>
            <button
              onClick={handleLogout}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <span className="font-semibold text-slate-900">Filter:</span>
          <select
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            value={filter}
            onChange={(event) => onFilterChange(event.target.value as FilterValue)}
          >
            <option value="all">All</option>
            <option value="draft">Draft</option>
            <option value="reviewed">Reviewed</option>
            <option value="published">Published</option>
          </select>
        </div>

        <p className="text-sm text-slate-500">{totalLabel}</p>
      </div>

      {notice ? <p className="rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">{notice}</p> : null}
      {error ? <p className="rounded-xl border border-rose-300 bg-rose-50 px-4 py-2 text-sm text-rose-700">{error}</p> : null}

      <div className="grid gap-4">
        {drafts.map((draft) => (
          <article key={draft._id} className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1">
                <h2 className="font-display text-xl font-semibold text-slate-900">{draft.title}</h2>
                <p className="text-sm text-slate-500">/{draft.slug}</p>
              </div>
              <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${statusBadgeClass(draft.status)}`}>
                {draft.status}
              </span>
            </div>

            <p className="text-sm text-slate-600">{draft.excerpt || 'No excerpt yet.'}</p>

            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
              <span>Updated: {new Date(draft.updatedAt).toLocaleString()}</span>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/admin/drafts/${draft._id}`}
                  className="rounded-lg bg-slate-900 px-3 py-1.5 font-semibold text-white transition hover:bg-slate-700"
                >
                  Edit
                </Link>
                {draft.status === 'published' ? (
                  <Link
                    href={`/posts/${draft.slug}`}
                    target="_blank"
                    className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-semibold text-slate-700 transition hover:border-sky-400 hover:text-sky-700"
                  >
                    View Public
                  </Link>
                ) : null}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
