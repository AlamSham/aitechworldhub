import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="grid min-h-[60vh] place-content-center rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm shadow-slate-900/5">
      <div className="grid gap-3">
        <h1 className="font-display text-3xl font-bold text-slate-900">Page Not Found</h1>
        <p className="text-sm text-slate-600">The page you requested does not exist.</p>
        <Link href="/" className="text-sm font-semibold text-sky-700 hover:text-sky-500">
          Back to Home
        </Link>
      </div>
    </main>
  );
}
