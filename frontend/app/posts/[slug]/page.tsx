import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import MarkdownArticle from '../../../src/components/public/MarkdownArticle';
import ShareButtons from '../../../src/components/public/ShareButtons';
import RelatedPosts from '../../../src/components/public/RelatedPosts';
import TableOfContents from '../../../src/components/public/TableOfContents';
import AdSlot from '../../../src/components/public/AdSlot';
import ReadingProgressBar from '../../../src/components/public/ReadingProgressBar';
import BackToTop from '../../../src/components/public/BackToTop';
import { fetchPublishedPostBySlug, fetchPublishedPosts, fetchRelatedPosts } from '../../../src/lib/api';
import { getAuthorPath, getRelevantTopicHubsForPost } from '../../../src/lib/site-taxonomy';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://aitechworldhub.com';
export const revalidate = 300;

type Props = {
  params: Promise<{ slug: string }>;
};

function getHostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export async function generateStaticParams() {
  const allPosts = [];
  let page = 1;
  let hasNext = true;

  while (hasNext) {
    const { drafts, pagination } = await fetchPublishedPosts({
      page,
      limit: 50,
      revalidateSeconds: 300,
    });
    allPosts.push(...drafts);
    hasNext = Boolean(pagination?.hasNext);
    page += 1;
    if (page > 100) break;
  }

  return allPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchPublishedPostBySlug(slug);

  if (!post) {
    return { title: 'Post Not Found' };
  }

  const url = `${SITE_URL}/posts/${post.slug}`;
  const authorName = post.author || 'AITechWorldHub Team';
  const authorUrl = `${SITE_URL}${getAuthorPath(authorName)}`;

  return {
    title: post.title,
    description: post.metaDescription || post.excerpt,
    keywords: post.tags?.join(', '),
    alternates: {
      canonical: url,
    },
    authors: [{ name: authorName, url: authorUrl }],
    publisher: 'AITechWorldHub',
    openGraph: {
      title: post.title,
      description: post.metaDescription || post.excerpt,
      url,
      type: 'article',
      publishedTime: post.publishedAt || undefined,
      images: post.imageUrl ? [{ url: post.imageUrl, width: 1200, height: 630, alt: post.title }] : [],
      siteName: 'AITechWorldHub',
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.metaDescription || post.excerpt,
      images: post.imageUrl ? [post.imageUrl] : [],
    },
  };
}

export default async function PostDetailPage({ params }: Props) {
  const { slug } = await params;
  const [post, relatedPosts] = await Promise.all([
    fetchPublishedPostBySlug(slug),
    fetchRelatedPosts(slug),
  ]);

  if (!post) {
    notFound();
  }

  const url = `${SITE_URL}/posts/${post.slug}`;
  const authorName = post.author || 'AITechWorldHub Team';
  const authorPath = getAuthorPath(authorName);
  const authorUrl = `${SITE_URL}${authorPath}`;
  const citationLinks = Array.from(new Set((post.sourceCitations || []).filter(Boolean)));
  const publishedDate = post.publishedAt || post.createdAt || undefined;
  const modifiedDate = post.updatedAt || post.publishedAt || post.createdAt || undefined;
  const relatedTopicHubs = getRelevantTopicHubsForPost(post, 3);

  // JSON-LD Structured Data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.metaDescription || post.excerpt,
    image: post.imageUrl ? [post.imageUrl] : undefined,
    datePublished: publishedDate,
    dateModified: modifiedDate,
    author: {
      '@type': 'Person',
      name: authorName,
      url: authorUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: 'AITechWorldHub',
      url: SITE_URL,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    articleSection: post.category || 'AI',
    keywords: post.tags,
    citation: citationLinks,
    wordCount: post.contentMarkdown?.split(/\s+/).filter(Boolean).length,
    isAccessibleForFree: true,
  };
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Articles',
        item: `${SITE_URL}/posts`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: url,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ReadingProgressBar />
      <BackToTop />
      <main className="grid gap-8">
        {/* Post Header */}
        <header className="grid gap-5">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <Link href="/" className="transition hover:text-slate-600">Home</Link>
            <span>/</span>
            <Link href="/posts" className="transition hover:text-slate-600">Articles</Link>
            <span>/</span>
            <span className="text-slate-500">{post.title}</span>
          </nav>
          <div className="flex flex-wrap items-center gap-2">
            {post.category ? (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                {post.category}
              </span>
            ) : null}
            {post.readingTime ? (
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-3.5 w-3.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {post.readingTime} min read
              </span>
            ) : null}
            {post.publishedAt ? (
              <span className="text-xs text-slate-400">
                {new Date(post.publishedAt).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            ) : null}
            {post.updatedAt && post.updatedAt !== post.publishedAt ? (
              <span className="text-xs text-slate-400">
                Updated{' '}
                {new Date(post.updatedAt).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            ) : null}
          </div>

          <h1 className="font-display text-3xl font-bold leading-tight text-slate-900 sm:text-4xl lg:text-5xl">
            {post.title}
          </h1>

          {post.excerpt ? (
            <p className="max-w-2xl text-lg text-slate-500">{post.excerpt}</p>
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                {(post.author || 'T')[0].toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  <Link href={authorPath} className="transition hover:text-indigo-600">
                    {authorName}
                  </Link>
                </p>
                <p className="text-xs text-slate-400">Author</p>
              </div>
            </div>
            <ShareButtons url={url} title={post.title} />
          </div>
        </header>

        {/* Hero Image */}
        {post.imageUrl ? (
          <Image
            src={post.imageUrl}
            alt={post.title}
            width={1600}
            height={900}
            className="w-full aspect-video rounded-2xl border border-slate-200 object-cover shadow-lg shadow-slate-900/10"
          />
        ) : null}

        {/* Content Layout */}
        <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
          <div className="grid gap-6">
            {/* In-Article Ad */}
            <AdSlot variant="in-article" />

            {/* Mobile Table of Contents */}
            <div className="lg:hidden">
              <TableOfContents markdown={post.contentMarkdown || ''} />
            </div>

            {/* Article Content */}
            <MarkdownArticle content={post.contentMarkdown || ''} />

            {/* Bottom Ad */}
            <AdSlot variant="in-article" />

            {citationLinks.length > 0 ? (
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-900/5">
                <h2 className="text-lg font-bold text-slate-900">Sources and References</h2>
                <p className="mt-2 text-sm text-slate-500">
                  Primary links used in this article for verification and follow-up reading.
                </p>
                <ul className="mt-4 grid gap-3">
                  {citationLinks.map((citation) => (
                    <li key={citation}>
                      <a
                        href={citation}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-medium text-slate-700 underline decoration-slate-300 underline-offset-4 transition hover:text-slate-900"
                      >
                        {getHostname(citation)}
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {relatedTopicHubs.length > 0 ? (
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-900/5">
                <h2 className="text-lg font-bold text-slate-900">Explore Related Topic Hubs</h2>
                <p className="mt-2 text-sm text-slate-500">
                  Continue browsing this subject through curated internal hub pages.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  {relatedTopicHubs.map((hub) => (
                    <Link
                      key={hub.slug}
                      href={`/topics/${hub.slug}`}
                      className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
                    >
                      {hub.shortLabel}
                    </Link>
                  ))}
                </div>
              </section>
            ) : null}

            {/* Tags */}
            {post.tags && post.tags.length > 0 ? (
              <div className="flex flex-wrap gap-2 border-t border-slate-200 pt-5">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-500 transition hover:border-indigo-300 hover:text-indigo-600"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            ) : null}

            {/* Share CTA */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center">
              <p className="text-sm font-semibold text-slate-700">Found this useful? Share it with your network!</p>
              <div className="mt-3 flex justify-center">
                <ShareButtons url={url} title={post.title} />
              </div>
            </div>

            {/* Related Posts */}
            <RelatedPosts posts={relatedPosts} />
          </div>

          {/* Sidebar */}
          <aside className="hidden lg:grid lg:gap-6 lg:content-start">
            <TableOfContents markdown={post.contentMarkdown || ''} />
            <AdSlot variant="sidebar" />
          </aside>
        </div>
      </main>
    </>
  );
}
