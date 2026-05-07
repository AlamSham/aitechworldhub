import { NextResponse } from 'next/server';
import { fetchAllPublishedPosts } from '../../../src/lib/site-taxonomy';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://aitechworldhub.com';

export async function GET() {
  const posts = await fetchAllPublishedPosts(300);
  
  // Filter posts from last 48 hours for Google News
  const now = new Date();
  const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);
  
  const newsPosts = posts.filter((post) => {
    const publishedDate = post.publishedAt || post.createdAt;
    if (!publishedDate) return false;
    return new Date(publishedDate) >= twoDaysAgo;
  });

  const newsSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<news:sitemapindex xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${newsPosts.map((post) => {
    const publishedDate = post.publishedAt || post.createdAt;
    const isoDate = publishedDate ? new Date(publishedDate).toISOString() : now.toISOString();
    
    return `  <news:sitemap>
    <loc>${SITE_URL}/news/${post.slug}</loc>
    <lastmod>${isoDate.substring(0, 10)}</lastmod>
  </news:sitemap>`;
  }).join('\n')}
</news:sitemapindex>`;

  return new NextResponse(newsSitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=300, s-maxage=300',
    },
  });
}
