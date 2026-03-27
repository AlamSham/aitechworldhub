import { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import MarkdownArticle from '../../../src/components/public/MarkdownArticle';
import ShareButtons from '../../../src/components/public/ShareButtons';
import RelatedPosts from '../../../src/components/public/RelatedPosts';
import TableOfContents from '../../../src/components/public/TableOfContents';
import AdSlot from '../../../src/components/public/AdSlot';
import { fetchPublishedPostBySlug, fetchRelatedPosts } from '../../../src/lib/api';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://aitechworldhub.com';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchPublishedPostBySlug(slug);

  if (!post) {
    return { title: 'Post Not Found' };
  }

  const url = `${SITE_URL}/posts/${post.slug}`;

  return {
    title: post.title,
    description: post.metaDescription || post.excerpt,
    keywords: post.tags?.join(', '),
    alternates: {
      canonical: url,
    },
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

  // JSON-LD Structured Data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.metaDescription || post.excerpt,
    image: post.imageUrl || undefined,
    datePublished: post.publishedAt || post.createdAt,
    dateModified: post.publishedAt || post.createdAt,
    author: {
      '@type': 'Person',
      name: post.author || 'AITechWorldHub Team',
    },
    publisher: {
      '@type': 'Organization',
      name: 'AITechWorldHub',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    keywords: post.tags?.join(', '),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="grid gap-8">
        {/* Post Header */}
        <header className="grid gap-5">
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
                <p className="text-sm font-semibold text-slate-900">{post.author || 'AITechWorldHub Team'}</p>
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
            className="h-72 w-full rounded-2xl border border-slate-200 bg-slate-100 object-contain shadow-lg shadow-slate-900/10 sm:h-96"
          />
        ) : null}

        {/* Content Layout */}
        <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
          <div className="grid gap-6">
            {/* In-Article Ad */}
            <AdSlot variant="in-article" />

            {/* Article Content */}
            <MarkdownArticle content={post.contentMarkdown || ''} />

            {/* Bottom Ad */}
            <AdSlot variant="in-article" />

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
