import Link from 'next/link';
import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://aitechworldhub.com';

export const metadata: Metadata = {
  title: 'Editorial Policy',
  description:
    'Read the AITechWorldHub editorial policy covering sourcing, AI assistance, updates, corrections, and transparency standards.',
  alternates: {
    canonical: '/editorial-policy',
  },
  openGraph: {
    title: 'Editorial Policy | AITechWorldHub',
    description:
      'Read the AITechWorldHub editorial policy covering sourcing, AI assistance, updates, corrections, and transparency standards.',
    url: `${SITE_URL}/editorial-policy`,
  },
};

export default function EditorialPolicyPage() {
  const editorialSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Editorial Policy',
    url: `${SITE_URL}/editorial-policy`,
    description:
      'Read the AITechWorldHub editorial policy covering sourcing, AI assistance, updates, corrections, and transparency standards.',
    isPartOf: {
      '@type': 'WebSite',
      name: 'AITechWorldHub',
      url: SITE_URL,
    },
  };

  return (
    <main className="mx-auto grid max-w-4xl gap-8 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(editorialSchema) }}
      />

      <header className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">Trust and Transparency</span>
        <h1 className="font-display mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">Editorial Policy</h1>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
          AITechWorldHub is built to help readers understand fast-moving AI developments without relying on shallow summaries or recycled hype.
          This page explains how stories are selected, how sources are used, how AI assistance fits into the workflow, and how corrections are handled.
        </p>
      </header>

      <section className="grid gap-5 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="font-display text-2xl font-bold text-slate-900">Core editorial standards</h2>
        <div className="grid gap-4 text-sm leading-6 text-slate-600">
          <p>
            <strong className="text-slate-900">Source-backed reporting:</strong> Articles should be grounded in original announcements,
            primary source pages, or reputable reporting that can be checked by readers.
          </p>
          <p>
            <strong className="text-slate-900">Practical relevance:</strong> Coverage is selected based on whether it changes how professionals,
            teams, founders, or serious readers think about AI tools, policy, infrastructure, or adoption.
          </p>
          <p>
            <strong className="text-slate-900">Clear scope:</strong> The site aims to stay tightly focused on AI tools, workflows, model ecosystems,
            infrastructure, and high-impact policy developments instead of drifting into unrelated gadget or trend content.
          </p>
        </div>
      </section>

      <section className="grid gap-5 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="font-display text-2xl font-bold text-slate-900">How AI assistance is used</h2>
        <div className="grid gap-4 text-sm leading-6 text-slate-600">
          <p>
            AI tools may assist with drafting, summarization, formatting, and editorial workflow acceleration. They are not treated as final
            authorities on facts.
          </p>
          <p>
            Published content is expected to be reviewed for clarity, audience fit, and sourcing before it is presented as a finished article.
          </p>
          <p>
            When automation is involved, the goal is to improve speed and structure while keeping the final article useful, readable, and grounded in evidence.
          </p>
        </div>
      </section>

      <section className="grid gap-5 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="font-display text-2xl font-bold text-slate-900">Corrections and updates</h2>
        <div className="grid gap-4 text-sm leading-6 text-slate-600">
          <p>
            Important factual corrections should be made when a verified error is identified. Material updates should reflect meaningful changes to
            the article, not cosmetic date refreshing.
          </p>
          <p>
            Time-sensitive AI news can move quickly, so article pages may be updated to reflect confirmed product, policy, pricing, or availability changes.
          </p>
          <p>
            If you spot an issue, the fastest path is to contact the site directly through the <Link href="/contact" className="font-semibold text-slate-900 hover:underline">contact page</Link>.
          </p>
        </div>
      </section>

      <section className="grid gap-5 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="font-display text-2xl font-bold text-slate-900">Reader trust signals</h2>
        <div className="grid gap-4 text-sm leading-6 text-slate-600">
          <p>
            To make content easier to evaluate, article pages aim to show author information, source references, publication dates, update dates,
            and stronger internal linking to related topic pages.
          </p>
          <p>
            Readers can also review the <Link href="/about" className="font-semibold text-slate-900 hover:underline">About page</Link> for site context
            and browse curated <Link href="/topics" className="font-semibold text-slate-900 hover:underline">topic hubs</Link> for cluster-based coverage.
          </p>
        </div>
      </section>
    </main>
  );
}
