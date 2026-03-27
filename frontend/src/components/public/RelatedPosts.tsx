import Link from 'next/link';
import Image from 'next/image';
import { PublishedPost } from '../../models/draft';

type Props = {
  posts: PublishedPost[];
};

export default function RelatedPosts({ posts }: Props) {
  if (!posts || posts.length === 0) return null;

  return (
    <section className="grid gap-4">
      <h3 className="text-lg font-bold text-slate-900">Related Articles</h3>
      <div className="grid gap-4 sm:grid-cols-3">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/posts/${post.slug}`}
            className="group grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            {post.imageUrl ? (
              <Image
                src={post.imageUrl}
                alt={post.title}
                width={800}
                height={450}
                className="h-32 w-full rounded-xl border border-slate-100 bg-slate-100 object-contain"
              />
            ) : (
              <div className="flex h-32 w-full items-center justify-center rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50">
                <span className="text-2xl">📰</span>
              </div>
            )}
            <div className="space-y-1.5">
              <h4 className="text-sm font-semibold text-slate-900 transition group-hover:text-indigo-600 line-clamp-2">
                {post.title}
              </h4>
              {post.readingTime ? (
                <p className="text-xs text-slate-400">{post.readingTime} min read</p>
              ) : null}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
