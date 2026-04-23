import Link from 'next/link';
import type { Metadata } from 'next';
import PostCard from '../src/components/public/PostCard';
import SubscribeForm from '../src/components/public/SubscribeForm';
import AdSlot from '../src/components/public/AdSlot';
import SeoFaqSection from '../src/components/public/SeoFaqSection';
import { fetchPublishedPosts } from '../src/lib/api';
import { TOPIC_HUBS } from '../src/lib/site-taxonomy';

const CATEGORIES = ['All', 'AI Tools', 'How-To', 'Productivity', 'Comparison', 'Policy', 'China vs US'];
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://aitechworldhub.com';
const HOMEPAGE_FAQS = [
  {
    question: 'How often does AITechWorldHub publish new AI articles?',
    answer:
      'New articles are added whenever verified AI product, workflow, infrastructure, or policy developments matter for US and UK readers. We prioritize quality and source-backed updates over publishing on a fixed volume schedule.',
  },
  {
    question: 'How are articles sourced and verified on this site?',
    answer:
      'Each published article is expected to be grounded in primary or reputable source material, and our article pages now surface source references directly so readers and search engines can trace the underlying reporting.',
  },
  {
    question: 'What topics does AITechWorldHub focus on most?',
    answer:
      'The site focuses on practical generative AI tools, workflows, model comparisons, infrastructure developments, and policy shifts that affect professionals, founders, and teams following the AI space.',
  },
  {
    question: 'Why can a new article take time to appear in Google Search?',
    answer:
      'Google may discover a new URL before it chooses to crawl and index it. That timing depends on crawl demand, site trust, internal linking, content uniqueness, and the overall quality signals of the page and domain.',
  },
];

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Latest Generative AI for US/UK Professionals',
  description:
    'Actionable generative AI updates, workflows, and tool analysis for US/UK professionals. China vs US coverage appears as a focused sub-cluster.',
  alternates: {
    canonical: '/',
  },
};

export default async function HomePage() {
  const { drafts: posts } = await fetchPublishedPosts({ page: 1, limit: 7 });
  const featured = posts[0] || null;
  const latest = posts.slice(1, 7);
  const homepageSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Latest Generative AI for US/UK Professionals',
    url: SITE_URL,
    description:
      'Actionable generative AI updates, workflows, and tool analysis for US/UK professionals.',
    isPartOf: {
      '@type': 'WebSite',
      name: 'AITechWorldHub',
      url: SITE_URL,
    },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: posts.map((post, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `${SITE_URL}/posts/${post.slug}`,
        name: post.title,
      })),
    },
  };

  return (
    <main className="grid gap-8 sm:gap-10 lg:gap-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homepageSchema) }}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white px-5 py-10 text-slate-900 sm:rounded-3xl sm:px-10 sm:py-16 lg:px-12 lg:py-20">
        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 sm:mb-4 sm:px-4 sm:py-1.5 sm:text-xs sm:tracking-[0.2em]">
            Latest Generative AI Briefing
          </span>
          <h1 className="font-display mt-3 text-3xl font-bold leading-tight text-slate-900 sm:mt-4 sm:text-4xl lg:text-6xl">
            Generative AI Intelligence for US/UK Professionals
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-slate-600 sm:mt-5 sm:text-base lg:text-lg">
            Daily coverage of the latest AI tools, enterprise workflows, and practical productivity use cases. China vs US updates are covered where relevant.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3 sm:mt-8">
            <Link
              href="/posts"
              className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md sm:px-6 sm:py-3"
            >
              Read Latest Articles
            </Link>
          </div>
        </div>
      </section>

      {/* Category Chips — horizontal scroll on mobile */}
      <section className="w-full overflow-hidden">
        <div className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:justify-center sm:overflow-x-visible sm:pb-0">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat}
              href={cat === 'All' ? '/posts' : `/posts?category=${encodeURIComponent(cat)}`}
              className="flex-shrink-0 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 sm:px-4"
            >
              {cat}
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold text-slate-900">Explore Topic Hubs</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              Browse tightly focused topic pages built to strengthen site structure around the AI themes we cover most deeply.
            </p>
          </div>
          <Link href="/topics" className="text-sm font-semibold text-slate-600 hover:text-slate-900">
            View all hubs
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {TOPIC_HUBS.map((hub) => (
            <Link
              key={hub.slug}
              href={`/topics/${hub.slug}`}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-300 hover:bg-white"
            >
              <h3 className="text-sm font-bold text-slate-900">{hub.shortLabel}</h3>
              <p className="mt-2 text-xs leading-5 text-slate-500">{hub.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Post */}
      {featured ? (
        <section className="grid gap-4 animate-fade-in-up">
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-slate-900 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-white">
              Featured
            </span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>
          <PostCard post={featured} featured />
        </section>
      ) : null}

      {/* AdSense Banner */}
      <AdSlot variant="banner" />

      {/* Latest Posts */}
      <section className="grid gap-5 sm:gap-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-slate-900 sm:text-2xl">Latest Articles</h2>
          <Link href="/posts" className="text-sm font-semibold text-slate-600 hover:text-slate-900">
            See all →
          </Link>
        </div>

        {latest.length === 0 && !featured ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
            No published posts yet. Articles will appear here once published from the admin dashboard.
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {latest.map((post, i) => (
              <div key={post.slug} className="animate-fade-in-up" style={{ animationDelay: `${i * 80}ms` }}>
                <PostCard post={post} />
              </div>
            ))}
          </div>
        )}

        {posts.length > 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-slate-500">Quick Article Links</h2>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {posts.map((post) => (
                <Link
                  key={`quick-${post.slug}`}
                  href={`/posts/${post.slug}`}
                  className="text-sm font-medium text-slate-700 transition hover:text-slate-900"
                >
                  {post.title}
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      {/* Newsletter CTA */}
      <section className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center sm:rounded-3xl sm:p-10 lg:p-12">
        <h2 className="font-display text-xl font-bold text-slate-900 sm:text-2xl">Stay Ahead in the AI Race</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
          Get weekly US/UK-ready AI insights, practical tool stacks, and selective China vs US strategic updates.
        </p>
        <div className="mx-auto mt-5 max-w-sm sm:mt-6 sm:max-w-md">
          <SubscribeForm />
        </div>
      </section>

      <SeoFaqSection
        title="AITechWorldHub FAQ"
        intro="These FAQs are visible on the page and marked up with JSON-LD to strengthen semantic understanding of the site."
        items={HOMEPAGE_FAQS}
        includeSchema
      />

      {/* Bottom Ad */}
      <AdSlot variant="between-posts" />
    </main>
  );
}
