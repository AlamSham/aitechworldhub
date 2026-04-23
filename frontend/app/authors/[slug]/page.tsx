import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PostCard from '../../../src/components/public/PostCard';
import {
  fetchAllPublishedPosts,
  getAllAuthors,
  getAuthorNameFromSlug,
  getAuthorProfile,
  getPostsForAuthor,
} from '../../../src/lib/site-taxonomy';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://aitechworldhub.com';

type Props = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 300;

export async function generateStaticParams() {
  const posts = await fetchAllPublishedPosts(300);
  return getAllAuthors(posts).map((author) => ({ slug: author.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const posts = await fetchAllPublishedPosts(300);
  const authorName = getAuthorNameFromSlug(posts, slug);

  if (!authorName) {
    return { title: 'Author Not Found' };
  }

  const profile = getAuthorProfile(slug, authorName);

  return {
    title: `${profile.name} Author Page`,
    description: profile.description,
    alternates: {
      canonical: `/authors/${slug}`,
    },
    openGraph: {
      title: `${profile.name} | AITechWorldHub`,
      description: profile.description,
      url: `${SITE_URL}/authors/${slug}`,
    },
  };
}

export default async function AuthorPage({ params }: Props) {
  const { slug } = await params;
  const posts = await fetchAllPublishedPosts(300);
  const authorName = getAuthorNameFromSlug(posts, slug);

  if (!authorName) {
    notFound();
  }

  const profile = getAuthorProfile(slug, authorName);
  const authorPosts = getPostsForAuthor(posts, slug);

  if (authorPosts.length === 0) {
    notFound();
  }

  const profileSchema = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    url: `${SITE_URL}/authors/${slug}`,
    name: `${profile.name} author page`,
    mainEntity: {
      '@type': 'Person',
      name: profile.name,
      description: profile.description,
      jobTitle: profile.role,
      url: `${SITE_URL}/authors/${slug}`,
    },
    hasPart: authorPosts.slice(0, 10).map((post) => ({
      '@type': 'Article',
      headline: post.title,
      url: `${SITE_URL}/posts/${post.slug}`,
      datePublished: post.publishedAt || post.createdAt,
      author: {
        '@type': 'Person',
        name: profile.name,
        url: `${SITE_URL}/authors/${slug}`,
      },
    })),
  };

  return (
    <main className="grid gap-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(profileSchema) }}
      />

      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
          <Link href="/" className="transition hover:text-slate-600">Home</Link>
          <span>/</span>
          <span className="text-slate-500">{profile.name}</span>
        </nav>

        <div className="mt-5 flex flex-col gap-6 sm:flex-row sm:items-start">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-900 text-2xl font-bold text-white">
            {profile.name.charAt(0).toUpperCase()}
          </div>

          <div className="grid gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">Author Profile</p>
              <h1 className="font-display mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">{profile.name}</h1>
              <p className="mt-2 text-sm font-medium text-slate-500">{profile.role}</p>
            </div>

            <p className="max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">{profile.description}</p>

            <div className="flex flex-wrap gap-2">
              {profile.expertise.map((item) => (
                <span key={item} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="font-display text-2xl font-bold text-slate-900">Editorial background</h2>
        <div className="grid gap-4 text-sm leading-6 text-slate-600">
          {profile.bio.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          <p>
            For more context on how articles are sourced and reviewed, see the{' '}
            <Link href="/editorial-policy" className="font-semibold text-slate-900 hover:underline">
              editorial policy
            </Link>.
          </p>
        </div>
      </section>

      <section className="grid gap-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold text-slate-900">Recent articles by {profile.name}</h2>
          <span className="text-sm text-slate-500">{authorPosts.length} published articles</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {authorPosts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      </section>
    </main>
  );
}
