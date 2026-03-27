import Link from 'next/link';
import Image from 'next/image';
import { PublishedPost } from '../../models/draft';

type Props = {
  post: PublishedPost;
  featured?: boolean;
};

export default function PostCard({ post, featured = false }: Props) {
  return (
    <article
      className={`group relative grid overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md hover:border-slate-300 ${
        featured ? 'md:grid-cols-2 md:items-center' : ''
      }`}
    >
      <Link href={`/posts/${post.slug}`} className="block">
        {post.imageUrl ? (
          <Image
            src={post.imageUrl}
            alt={post.title}
            width={1200}
            height={675}
            className={`w-full object-contain bg-slate-100 transition-transform duration-500 group-hover:scale-105 ${
              featured ? 'h-56 md:h-full' : 'h-48'
            }`}
          />
        ) : (
          <div
            className={`flex w-full items-center justify-center bg-slate-100 ${
              featured ? 'h-56 md:h-full' : 'h-48'
            }`}
          >
            <span className="text-4xl">🤖</span>
          </div>
        )}
      </Link>

      <div className="grid gap-3 p-5">
        <div className="flex flex-wrap items-center gap-2">
          {post.category ? (
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
              {post.category}
            </span>
          ) : null}
          {post.readingTime ? (
            <span className="flex items-center gap-1 text-[11px] text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-3 w-3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {post.readingTime} min
            </span>
          ) : null}
        </div>

        <Link href={`/posts/${post.slug}`}>
          <h3
            className={`font-display font-bold text-slate-900 transition group-hover:text-slate-600 ${
              featured ? 'text-2xl sm:text-3xl' : 'text-lg'
            }`}
          >
            {post.title}
          </h3>
        </Link>

        <p className={`text-slate-500 ${featured ? 'text-sm' : 'text-[13px] line-clamp-2'}`}>
          {post.excerpt || 'No summary available.'}
        </p>

        {post.tags && post.tags.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {post.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500"
              >
                #{tag}
              </span>
            ))}
          </div>
        ) : null}

        <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-400">
          <span>
            {post.publishedAt
              ? new Date(post.publishedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : 'Unpublished'}
          </span>
          <Link
            href={`/posts/${post.slug}`}
            className="flex items-center gap-1 font-semibold text-slate-900 transition hover:text-slate-600"
          >
            Read more
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-3 w-3 transition group-hover:translate-x-0.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </div>
    </article>
  );
}
