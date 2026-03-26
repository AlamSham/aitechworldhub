import Link from 'next/link';
import type { Metadata } from 'next';
import PostCard from '../../src/components/public/PostCard';
import AdSlot from '../../src/components/public/AdSlot';
import { fetchPublishedPosts } from '../../src/lib/api';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://aitechworldhub.com';
const PAGE_SIZE = 12;
const CATEGORIES = ['All', 'AI Tools', 'How-To', 'Productivity', 'Comparison', 'Policy', 'China vs US'];

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

function getStringParam(value: string | string[] | undefined): string {
  return typeof value === 'string' ? value : '';
}

function normalizePage(value: string): number {
  const parsed = Number(value || 1);
  if (!Number.isFinite(parsed)) return 1;
  return Math.max(1, Math.floor(parsed));
}

function buildPostsPath(category: string, page: number): string {
  const params = new URLSearchParams();
  if (category) params.set('category', category);
  if (page > 1) params.set('page', String(page));
  const query = params.toString();
  return query ? `/posts?${query}` : '/posts';
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const category = getStringParam(params.category);
  const page = normalizePage(getStringParam(params.page));
  const canonicalPath = buildPostsPath(category, page);
  const title = category
    ? `${category} Generative AI Articles`
    : 'Latest Generative AI Articles for US/UK Professionals';
  const description = category
    ? `${category} articles focused on practical generative AI outcomes for US/UK professionals.`
    : 'Latest generative AI articles, practical workflows, and selective China vs US strategic coverage for US/UK professionals.';

  return {
    title,
    description,
    alternates: {
      canonical: canonicalPath
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}${canonicalPath}`
    }
  };
}

export default async function PostsPage({ searchParams }: Props) {
  const params = await searchParams;
  const category = getStringParam(params.category);
  const page = normalizePage(getStringParam(params.page));

  const { drafts: posts, pagination } = await fetchPublishedPosts({
    page,
    limit: PAGE_SIZE,
    category: category || undefined
  });

  const totalPages = pagination?.totalPages || 1;
  const prevPath = page > 1 ? buildPostsPath(category, page - 1) : '';
  const nextPath = page < totalPages ? buildPostsPath(category, page + 1) : '';

  return (
    <main className="grid gap-8">
      <header className="grid gap-3">
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">US/UK AI Briefing</span>
        <h1 className="font-display text-4xl font-bold text-slate-900">
          {category ? `${category} Articles` : 'Latest Generative AI Coverage'}
        </h1>
        <p className="max-w-xl text-sm text-slate-500">
          Practical AI tools, workflows, and productivity analysis for US/UK professionals. China vs US is tracked as a dedicated sub-cluster.
          {pagination?.total ? ` ${pagination.total} total articles.` : ''}
        </p>

        {/* Category Filter Chips */}
        <div className="mt-4 flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => {
            const isActive = category === cat || (!category && cat === 'All');
            return (
              <Link
                key={cat}
                href={buildPostsPath(cat === 'All' ? '' : cat, 1)}
                className={`rounded-full border px-4 py-2 text-xs font-semibold shadow-sm transition 
                  ${isActive 
                    ? 'border-indigo-600 bg-indigo-600 text-white' 
                    : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700'
                  }`}
              >
                {cat}
              </Link>
            );
          })}
        </div>
      </header>

      {posts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
          No published articles found for this category. Check back soon!
        </div>
      ) : (
        <div className="grid gap-6">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {posts.map((post, i) => (
              <div key={post.slug}>
                <PostCard post={post} />
                {/* Insert ad every 6 posts */}
                {(i + 1) % 6 === 0 && i < posts.length - 1 ? (
                  <div className="col-span-full mt-5">
                    <AdSlot variant="between-posts" />
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          <nav className="mt-2 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
            <div className="text-xs text-slate-500">
              Page {page} of {totalPages}
            </div>
            <div className="flex items-center gap-2">
              {prevPath ? (
                <Link
                  href={prevPath}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-500"
                >
                  Previous
                </Link>
              ) : (
                <span className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-300">Previous</span>
              )}

              {nextPath ? (
                <Link
                  href={nextPath}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-500"
                >
                  Next
                </Link>
              ) : (
                <span className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-300">Next</span>
              )}
            </div>
          </nav>
        </div>
      )}
    </main>
  );
}
