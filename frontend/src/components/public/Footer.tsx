import Link from 'next/link';
import SubscribeForm from './SubscribeForm';

const CATEGORIES = ['AI Tools', 'China vs US', 'Policy', 'How-To', 'Comparison', 'Productivity'];

const FOOTER_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/posts', label: 'Articles' },
  { href: '/about', label: 'About Us' },
  { href: '/contact', label: 'Contact' },
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/terms', label: 'Terms' },
  { href: '/disclaimer', label: 'Disclaimer' },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-12 border-t border-slate-200/60 bg-slate-50/80">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

        {/* Main Grid — stacks on mobile */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">

          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white shadow-sm">
                AI
              </span>
              <span className="text-lg font-bold tracking-tight text-slate-900">
                AITechWorldHub
              </span>
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-slate-500">
              Latest generative AI intelligence for US/UK professionals. Practical tools, workflows, and policy explainers, with selective China vs US strategic coverage.
            </p>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Categories</h4>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat}
                  href={`/posts?category=${encodeURIComponent(cat)}`}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-slate-400 hover:text-slate-900"
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>

          {/* Newsletter */}
          <div className="space-y-4 sm:col-span-2 lg:col-span-1">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Stay Updated</h4>
            <p className="text-sm text-slate-500">Get the latest generative AI workflows and strategic AI updates in your inbox.</p>
            <SubscribeForm />
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 border-t border-slate-200/60 pt-6">
          {/* Nav links — wraps cleanly on mobile */}
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mb-4">
            {FOOTER_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs text-slate-500 transition hover:text-slate-900"
              >
                {link.label}
              </Link>
            ))}
          </div>
          {/* Copyright — centered on mobile */}
          <p className="text-center text-xs text-slate-400">
            © {year} AITechWorldHub. Powered by AI editorial pipeline.
          </p>
        </div>

      </div>
    </footer>
  );
}
