import { MetadataRoute } from 'next';
import { fetchAllPublishedPosts } from '../src/lib/site-taxonomy';
import { TOPIC_HUBS } from '../src/lib/site-taxonomy';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://aitechworldhub.com';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const posts = await fetchAllPublishedPosts(300);
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/'],
        disallow: [
          '/admin/',
          '/api/',
          '/_next/',
          '/static/',
          '/node_modules/',
          '/.git/',
          '/.env',
        ],
      },
    ],
    sitemap: [
      `${SITE_URL}/sitemap.xml`,
      `${SITE_URL}/news-sitemap.xml`,
      `${SITE_URL}/image-sitemap.xml`,
      `${SITE_URL}/sitemap-index.xml`,
    ],
  };
}
