import { NextResponse } from 'next/server';
import { fetchAllPublishedPosts } from '../../src/lib/site-taxonomy';

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

  // If no recent posts, return last 10 posts instead
  const postsToInclude = newsPosts.length > 0 ? newsPosts : posts.slice(0, 10);

  const newsSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${postsToInclude.map((post) => {
    const publishedDate = post.publishedAt || post.createdAt;
    const pubDate = publishedDate ? new Date(publishedDate) : now;
    const formattedDate = pubDate.toISOString();
    const keywords = (post.tags || []).slice(0, 10).join(', ');
    
    return `  <url>
    <loc>${SITE_URL}/posts/${post.slug}</loc>
    <news:news>
      <news:publication>
        <news:name>AITechWorldHub</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${formattedDate}</news:publication_date>
      <news:title>${escapeXml(post.title)}</news:title>${keywords ? `
      <news:keywords>${escapeXml(keywords)}</news:keywords>` : ''}
    </news:news>
  </url>`;
  }).join('\n')}
</urlset>`;

  return new NextResponse(newsSitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=300, s-maxage=300',
    },
  });
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
