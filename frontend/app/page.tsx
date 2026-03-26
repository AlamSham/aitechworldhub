import Link from 'next/link';
import PostCard from '../src/components/public/PostCard';
import SubscribeForm from '../src/components/public/SubscribeForm';
import AdSlot from '../src/components/public/AdSlot';
import { fetchPublishedPosts } from '../src/lib/api';

const CATEGORIES = ['All', 'AI Tools', 'China vs US', 'Policy', 'How-To', 'Comparison', 'Productivity'];

export default async function HomePage() {
  const posts = await fetchPublishedPosts();
  const featured = posts[0] || null;
  const latest = posts.slice(1, 7);

  return (
    <main className="grid gap-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white px-8 py-14 text-slate-900 sm:px-12 sm:py-20">
        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            🔥 AI Intelligence Hub
          </span>
          <h1 className="font-display mt-4 text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl text-slate-900">
            China vs USA Tech War
            <br />
            <span className="text-slate-600">
              AI Insider Intelligence
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
            Daily coverage of the global AI race. Practical tools, policy analysis, and productivity guides for students, professionals, and founders.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/posts"
              className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md"
            >
              Read Latest Articles
            </Link>
          </div>
        </div>
      </section>

      {/* Category Chips */}
      <section className="flex flex-wrap justify-center gap-2">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat}
            href={cat === 'All' ? '/posts' : `/posts?category=${encodeURIComponent(cat)}`}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
          >
            {cat}
          </Link>
        ))}
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
      <section className="grid gap-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold text-slate-900">Latest Articles</h2>
          <Link href="/posts" className="text-sm font-semibold text-slate-600 hover:text-slate-900">
            See all →
          </Link>
        </div>

        {latest.length === 0 && !featured ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
            No published posts yet. Articles will appear here once published from the admin dashboard.
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {latest.map((post, i) => (
              <div key={post.slug} className="animate-fade-in-up" style={{ animationDelay: `${i * 80}ms` }}>
                <PostCard post={post} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Newsletter CTA */}
      <section className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center sm:p-12">
        <h2 className="font-display text-2xl font-bold text-slate-900">Stay Ahead in the AI Race</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
          Get daily insights on China vs USA AI developments, free tool recommendations, and productivity tips.
        </p>
        <div className="mx-auto mt-6 max-w-md">
          <SubscribeForm />
        </div>
      </section>

      {/* Bottom Ad */}
      <AdSlot variant="between-posts" />
    </main>
  );
}
