import { MetadataRoute } from 'next';
import { fetchPublishedPosts } from '../src/lib/api';

export const dynamic = 'force-dynamic';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://aitechworldhub.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Base routes
  const routes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${SITE_URL}/posts`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/disclaimer`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  // Dynamically fetch all published posts to add to sitemap
  try {
    const posts = await fetchPublishedPosts();
    
    const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
      url: `${SITE_URL}/posts/${post.slug}`,
      // Use the publishedAt or createdAt date, fallback to current
      lastModified: new Date(post.publishedAt || post.createdAt || Date.now()),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    return [...routes, ...postRoutes];
  } catch (error) {
    console.error('Failed to fetch posts for sitemap:', error);
    return routes;
  }
}
