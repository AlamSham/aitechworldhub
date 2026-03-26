import Link from 'next/link';
import PostCard from '../../src/components/public/PostCard';
import AdSlot from '../../src/components/public/AdSlot';
import { fetchPublishedPosts } from '../../src/lib/api';

const CATEGORIES = ['All', 'AI Tools', 'China vs US', 'Policy', 'How-To', 'Comparison', 'Productivity'];

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function PostsPage({ searchParams }: Props) {
  const params = await searchParams;
  const category = typeof params.category === 'string' ? params.category : null;

  const allPosts = await fetchPublishedPosts();
  
  // Filter by category if present
  const posts = category ? allPosts.filter(p => p.category === category) : allPosts;

  return (
    <main className="grid gap-8">
      <header className="grid gap-3">
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">Articles</span>
        <h1 className="font-display text-4xl font-bold text-slate-900">
          {category ? `${category} Articles` : 'Latest AI & Tech War Coverage'}
        </h1>
        <p className="max-w-xl text-sm text-slate-500">
          Expert analysis on the China vs USA tech race, AI tools, policy updates, and productivity guides.
          {posts.length > 0 ? ` ${posts.length} articles published.` : ''}
        </p>

        {/* Category Filter Chips */}
        <div className="mt-4 flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => {
            const isActive = category === cat || (!category && cat === 'All');
            return (
              <Link
                key={cat}
                href={cat === 'All' ? '/posts' : `/posts?category=${encodeURIComponent(cat)}`}
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
        </div>
      )}
    </main>
  );
}
