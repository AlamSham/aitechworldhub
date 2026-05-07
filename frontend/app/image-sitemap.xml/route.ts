import { NextResponse } from 'next/server';
import { fetchAllPublishedPosts } from '../../../src/lib/site-taxonomy';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://aitechworldhub.com';

export async function GET() {
  const posts = await fetchAllPublishedPosts(300);
  
  const imageUrls = posts
    .filter((post) => post.imageUrl)
    .map((post) => ({
      url: `${SITE_URL}/posts/${post.slug}`,
      image: post.imageUrl!,
      title: post.title,
      publishedAt: post.publishedAt || post.createdAt || new Date(),
    }));

  const imageSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${imageUrls.map((item) => `  <url>
    <loc>${item.url}</loc>
    <lastmod>${new Date(item.publishedAt).toISOString().substring(0, 10)}</lastmod>
    <image:image>
      <image:loc>${item.image}</image:loc>
      <image:title>${escapeXml(item.title)}</image:title>
      <image:caption>${escapeXml(item.title)}</image:caption>
    </image:image>
  </url>`).join('\n')}
</urlset>`;

  return new NextResponse(imageSitemap, {
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
