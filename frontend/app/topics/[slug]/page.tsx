import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PostCard from '../../../src/components/public/PostCard';
import {
  fetchAllPublishedPosts,
  getPostsForTopic,
  getTopicHubBySlug,
  TOPIC_HUBS,
} from '../../../src/lib/site-taxonomy';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://aitechworldhub.com';

type Props = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 300;

export function generateStaticParams() {
  return TOPIC_HUBS.map((hub) => ({ slug: hub.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const hub = getTopicHubBySlug(slug);

  if (!hub) {
    return { title: 'Topic Not Found' };
  }

  return {
    title: hub.title,
    description: hub.description,
    alternates: {
      canonical: `/topics/${hub.slug}`,
    },
    openGraph: {
      title: `${hub.title} | AITechWorldHub`,
      description: hub.description,
      url: `${SITE_URL}/topics/${hub.slug}`,
    },
  };
}

export default async function TopicHubPage({ params }: Props) {
  const { slug } = await params;
  const hub = getTopicHubBySlug(slug);

  if (!hub) {
    notFound();
  }

  const posts = await fetchAllPublishedPosts(300);
  const relatedPosts = getPostsForTopic(posts, hub);

  if (relatedPosts.length === 0) {
    notFound();
  }

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: hub.title,
    url: `${SITE_URL}/topics/${hub.slug}`,
    description: hub.description,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: relatedPosts.map((post, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `${SITE_URL}/posts/${post.slug}`,
        name: post.title,
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
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
          <Link href="/" className="transition hover:text-slate-600">Home</Link>
          <span>/</span>
          <Link href="/topics" className="transition hover:text-slate-600">Topics</Link>
          <span>/</span>
          <span className="text-slate-500">{hub.shortLabel}</span>
        </nav>

        <span className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">Topical Authority Hub</span>
        <h1 className="font-display text-3xl font-bold text-slate-900 sm:text-4xl">{hub.title}</h1>
        <p className="max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">{hub.intro}</p>

        <div className="flex flex-wrap gap-2">
          {hub.keywords.map((keyword) => (
            <span key={keyword} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
              {keyword}
            </span>
          ))}
        </div>
      </header>

      <section className="grid gap-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold text-slate-900">Articles in this hub</h2>
          <span className="text-sm text-slate-500">{relatedPosts.length} relevant articles</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {relatedPosts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-display text-2xl font-bold text-slate-900">Related site sections</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/editorial-policy" className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900">
            Editorial Policy
          </Link>
          <Link href="/about" className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900">
            About AITechWorldHub
          </Link>
          <Link href="/posts" className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900">
            All Articles
          </Link>
        </div>
      </section>
    </main>
  );
}
