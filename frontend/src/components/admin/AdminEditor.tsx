'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Draft, DraftStatus } from '../../models/draft';
import { fetchDraftById, updateDraft, uploadImageToCloudinary } from '../../lib/api';
import { getStoredToken } from '../../lib/auth';

type Props = {
  id: string;
};

export default function AdminEditor({ id }: Props) {
  const [token, setToken] = useState('');
  const [draft, setDraft] = useState<Draft | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id || id === 'undefined') {
      setError('Invalid draft ID. Please go back to /admin and open the draft again.');
      setLoading(false);
      return;
    }

    const storedToken = getStoredToken();
    setToken(storedToken);

    if (!storedToken) {
      setError('Session expired. Please login again from /admin.');
      setLoading(false);
      return;
    }

    fetchDraftById(storedToken, id)
      .then((row) => {
        setDraft(row);
        setTagInput((row.tags || []).join(', '));
      })
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, [id]);

  const publicUrl = useMemo(() => {
    if (!draft || draft.status !== 'published') return '';
    return `/posts/${draft.slug}`;
  }, [draft]);

  async function handleUpload(file: File | null) {
    if (!file || !token || !draft) return;

    setUploading(true);
    setError('');
    setMessage('');

    try {
      const image = await uploadImageToCloudinary(token, file);
      setDraft({
        ...draft,
        imageUrl: image.url,
        imagePublicId: image.publicId
      });
      setMessage('Image uploaded. Save draft to persist.');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUploading(false);
    }
  }

  async function save(nextStatus?: DraftStatus) {
    if (!token || !draft) return;

    setSaving(true);
    setError('');
    setMessage('');

    try {
      const payload: Partial<Draft> = {
        title: draft.title,
        slug: draft.slug,
        excerpt: draft.excerpt,
        slogan: draft.slogan,
        metaDescription: draft.metaDescription,
        contentMarkdown: draft.contentMarkdown,
        imageUrl: draft.imageUrl,
        imagePublicId: draft.imagePublicId,
        imagePrompt: draft.imagePrompt,
        tags: tagInput
          .split(',')
          .map((value) => value.trim())
          .filter(Boolean),
        status: nextStatus || draft.status
      };

      const updated = await updateDraft(token, id, payload);
      setDraft(updated);
      setTagInput((updated.tags || []).join(', '));
      setMessage(nextStatus === 'published' ? 'Post published successfully.' : 'Draft saved successfully.');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-600">Loading draft...</p>;
  }

  if (!draft) {
    return (
      <div className="grid gap-4 rounded-2xl border border-rose-300 bg-rose-50 p-5 text-rose-700">
        <p>{error || 'Draft not found.'}</p>
        <Link className="text-sm font-semibold underline" href="/admin">
          Back to Admin Dashboard
        </Link>
      </div>
    );
  }

  return (
    <section className="grid gap-5">
      <header className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/5">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">Editor</p>
          <h1 className="font-display text-2xl font-bold text-slate-900">{draft.title}</h1>
          <p className="text-sm text-slate-500">/{draft.slug}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link href="/admin" className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:border-sky-400 hover:text-sky-700">
            Back
          </Link>
          {publicUrl ? (
            <Link href={publicUrl} target="_blank" className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-500">
              Open Public Post
            </Link>
          ) : null}
        </div>
      </header>

      {message ? <p className="rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">{message}</p> : null}
      {error ? <p className="rounded-xl border border-rose-300 bg-rose-50 px-4 py-2 text-sm text-rose-700">{error}</p> : null}

      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <article className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/5">
          <label className="grid gap-2 text-sm text-slate-700">
            Title
            <input
              value={draft.title}
              onChange={(event) => setDraft({ ...draft, title: event.target.value })}
              className="rounded-xl border border-slate-300 px-3 py-2"
            />
          </label>

          <label className="grid gap-2 text-sm text-slate-700">
            Slug
            <input
              value={draft.slug}
              onChange={(event) => setDraft({ ...draft, slug: event.target.value })}
              className="rounded-xl border border-slate-300 px-3 py-2"
            />
          </label>

          <label className="grid gap-2 text-sm text-slate-700">
            Excerpt
            <textarea
              value={draft.excerpt}
              onChange={(event) => setDraft({ ...draft, excerpt: event.target.value })}
              className="min-h-24 rounded-xl border border-slate-300 px-3 py-2"
            />
          </label>

          <label className="grid gap-2 text-sm text-slate-700">
            Meta Description
            <textarea
              value={draft.metaDescription}
              onChange={(event) => setDraft({ ...draft, metaDescription: event.target.value })}
              className="min-h-24 rounded-xl border border-slate-300 px-3 py-2"
            />
          </label>

          <label className="grid gap-2 text-sm text-slate-700">
            Tags (comma separated)
            <input value={tagInput} onChange={(event) => setTagInput(event.target.value)} className="rounded-xl border border-slate-300 px-3 py-2" />
          </label>

          <label className="grid gap-2 text-sm text-slate-700">
            AI Image URL
            <input
              value={draft.imageUrl || ''}
              onChange={(event) => setDraft({ ...draft, imageUrl: event.target.value })}
              className="rounded-xl border border-slate-300 px-3 py-2"
            />
          </label>

          <label className="grid gap-2 text-sm text-slate-700">
            Upload New Image (Cloudinary)
            <input
              type="file"
              accept="image/*"
              onChange={(event) => handleUpload(event.target.files?.[0] || null)}
              className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2"
            />
            <span className="text-xs text-slate-500">{uploading ? 'Uploading image...' : draft.imagePublicId || 'No Cloudinary image yet'}</span>
          </label>

          <label className="grid gap-2 text-sm text-slate-700">
            Content (Markdown)
            <textarea
              value={draft.contentMarkdown}
              onChange={(event) => setDraft({ ...draft, contentMarkdown: event.target.value })}
              className="min-h-[420px] rounded-xl border border-slate-300 px-3 py-2"
            />
          </label>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => save()}
              disabled={saving}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-sky-400 hover:text-sky-700"
            >
              {saving ? 'Saving...' : 'Save Draft'}
            </button>
            <button
              onClick={() => save('reviewed')}
              disabled={saving}
              className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-100"
            >
              Mark Reviewed
            </button>
            <button
              onClick={() => save('published')}
              disabled={saving}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
            >
              Publish
            </button>
          </div>
        </article>

        <aside className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/5">
          <h2 className="font-display text-xl font-semibold text-slate-900">Live Preview</h2>
          {draft.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={draft.imageUrl} alt={draft.title} className="h-52 w-full rounded-xl border border-slate-200 object-cover" />
          ) : (
            <div className="grid h-52 place-content-center rounded-xl border border-dashed border-slate-300 text-sm text-slate-500">
              No image selected
            </div>
          )}
          <article className="article-markdown rounded-xl border border-slate-200 p-4">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{draft.contentMarkdown}</ReactMarkdown>
          </article>
        </aside>
      </div>
    </section>
  );
}
