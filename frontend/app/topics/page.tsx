import Link from 'next/link';
import type { Metadata } from 'next';
import { fetchAllPublishedPosts, getPostsForTopic, TOPIC_HUBS } from '../../src/lib/site-taxonomy';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://aitechworldhub.com';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'AI Topic Hubs',
  description:
    'Explore focused topic hubs for OpenAI, Google Gemini, Nvidia AI infrastructure, and China vs US AI coverage.',
  alternates: {
    canonical: '/topics',
  },
  openGraph: {
    title: 'AI Topic Hubs | AITechWorldHub',
    description:
      'Explore focused topic hubs for OpenAI, Google Gemini, Nvidia AI infrastructure, and China vs US AI coverage.',
    url: `${SITE_URL}/topics`,
  },
};

export default async function TopicsPage() {
  const posts = await fetchAllPublishedPosts(300);
  const topicCards = TOPIC_HUBS.map((hub) => {
    const relatedPosts = getPostsForTopic(posts, hub);
    return {
      ...hub,
      count: relatedPosts.length,
      samplePosts: relatedPosts.slice(0, 3),
    };
  });

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'AI Topic Hubs',
    url: `${SITE_URL}/topics`,
    description:
      'Explore focused topic hubs for OpenAI, Google Gemini, Nvidia AI infrastructure, and China vs US AI coverage.',
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: topicCards.map((hub, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `${SITE_URL}/topics/${hub.slug}`,
        name: hub.title,
      })),
    },
  };

  return (
    <main className="grid gap-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />

      <header className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">Search Visibility Cluster</span>
        <h1 className="font-display text-3xl font-bold text-slate-900 sm:text-4xl">AI Topic Hubs</h1>
        <p className="max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
          These topic pages group closely related articles under one clear theme. That helps readers browse faster and helps search engines
          understand the site&apos;s strongest coverage areas.
        </p>
      </header>

      <section className="grid gap-5 lg:grid-cols-2">
        {topicCards.map((hub) => (
          <article key={hub.slug} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl font-bold text-slate-900">
                  <Link href={`/topics/${hub.slug}`} className="transition hover:text-indigo-600">
                    {hub.shortLabel}
                  </Link>
                </h2>
                <p className="mt-2 text-sm text-slate-600">{hub.description}</p>
              </div>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-500">
                {hub.count} posts
              </span>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {hub.keywords.slice(0, 4).map((keyword) => (
                <span key={keyword} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                  {keyword}
                </span>
              ))}
            </div>

            {hub.samplePosts.length > 0 ? (
              <div className="mt-6 grid gap-2">
                {hub.samplePosts.map((post) => (
                  <Link
                    key={post.slug}
                    href={`/posts/${post.slug}`}
                    className="text-sm font-medium text-slate-700 transition hover:text-slate-900"
                  >
                    {post.title}
                  </Link>
                ))}
              </div>
            ) : (
              <p className="mt-6 text-sm text-slate-500">Coverage will appear here as more articles are published in this cluster.</p>
            )}

            <div className="mt-6">
              <Link
                href={`/topics/${hub.slug}`}
                className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900 transition hover:text-indigo-600"
              >
                Explore hub
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
