import Link from 'next/link';
import SubscribeForm from './SubscribeForm';

const CATEGORIES = ['AI Tools', 'China vs US', 'Policy', 'How-To', 'Comparison', 'Productivity'];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-slate-200/60 bg-slate-50/80">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-3">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white shadow-sm">
                AI
              </span>
              <span className="text-lg font-bold tracking-tight text-slate-900">
                AITechWorldHub
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-slate-500">
              Latest generative AI intelligence for US/UK professionals. Practical tools, workflows, and policy explainers, with selective China vs US strategic coverage.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Categories</h4>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat}
                  href={cat === 'All' ? '/posts' : `/posts?category=${encodeURIComponent(cat)}`}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-slate-400 hover:text-slate-900"
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Stay Updated</h4>
            <p className="text-sm text-slate-500">Get the latest generative AI workflows and strategic AI updates in your inbox.</p>
            <SubscribeForm />
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-slate-200/60 pt-6 sm:flex-row">
          <p className="text-sm text-slate-500">
            © {year} AITechWorldHub. Powered by AI editorial pipeline.
          </p>
          <div className="flex gap-4">
            <Link href="/" className="text-xs text-slate-500 transition hover:text-slate-900">Home</Link>
            <Link href="/posts" className="text-xs text-slate-500 transition hover:text-slate-900">Articles</Link>
            <Link href="/about" className="text-xs text-slate-500 transition hover:text-slate-900">About Us</Link>
            <Link href="/contact" className="text-xs text-slate-500 transition hover:text-slate-900">Contact</Link>
            <Link href="/privacy" className="text-xs text-slate-500 transition hover:text-slate-900">Privacy Policy</Link>
            <Link href="/terms" className="text-xs text-slate-500 transition hover:text-slate-900">Terms</Link>
            <Link href="/disclaimer" className="text-xs text-slate-500 transition hover:text-slate-900">Disclaimer</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
