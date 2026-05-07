/**
 * SEO Configuration
 * 
 * Site-wide SEO settings and defaults for the AITechWorldHub blog.
 * This configuration is used by the SEO system for structured data generation,
 * metadata management, sitemap generation, and search console integration.
 */

export const SEO_CONFIG = {
  // Site Information
  siteName: 'AITechWorldHub',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://aitechworldhub.com',
  defaultImage: '/images/default-og-image.jpg',
  defaultDescription: 'Latest AI news, insights, and analysis from the world of artificial intelligence and machine learning.',
  
  // Organization Information
  organization: {
    name: 'AITechWorldHub',
    email: 'contact@aitechworldhub.com',
    logo: '/images/logo.png',
    description: 'Your trusted source for AI technology news and insights',
  },
  
  // Social Media Profiles
  socialProfiles: {
    twitter: '@aitechworldhub',
    facebook: 'https://facebook.com/aitechworldhub',
    linkedin: 'https://linkedin.com/company/aitechworldhub',
    github: 'https://github.com/aitechworldhub',
  },
  
  // Sitemap Configuration
  sitemap: {
    maxUrlsPerFile: 50000,
    maxFileSize: 50 * 1024 * 1024, // 50MB in bytes
    
    // Default changefreq values by page type
    changefreqDefaults: {
      homepage: 'daily' as const,
      posts: 'weekly' as const,
      topics: 'weekly' as const,
      authors: 'weekly' as const,
      staticAbout: 'monthly' as const,
      staticContact: 'monthly' as const,
      staticLegal: 'yearly' as const,
    },
    
    // Default priority values by page type
    priorityDefaults: {
      homepage: 1.0,
      posts: 0.8,
      topics: 0.7,
      authors: 0.6,
      staticAbout: 0.5,
      staticContact: 0.5,
      staticLegal: 0.3,
    },
  },
  
  // Cache Configuration (TTL in seconds)
  cache: {
    structuredDataTTL: 3600, // 1 hour
    metadataTTL: 3600, // 1 hour
    sitemapTTL: 300, // 5 minutes
    relatedPostsTTL: 1800, // 30 minutes
    validationCacheTTL: 86400, // 24 hours
  },
  
  // Performance Thresholds
  performance: {
    maxGenerationTime: 100, // milliseconds
    maxValidationTime: 30000, // 30 seconds for 10,000 URLs
    maxParseTime: 50, // milliseconds for 10KB JSON-LD
  },
  
  // Metadata Defaults
  metadata: {
    descriptionMinLength: 150,
    descriptionMaxLength: 160,
    ogImageMinWidth: 1200,
    ogImageMinHeight: 630,
    twitterCard: 'summary_large_image' as const,
  },
  
  // Robots Configuration
  robots: {
    allowedPaths: ['/'],
    disallowedPaths: ['/admin/', '/api/', '/_next/'],
    crawlDelay: 1, // seconds
    crawlDelayExceptions: ['Googlebot'], // User agents without crawl delay
  },
  
  // Search Console Configuration
  searchConsole: {
    google: {
      rateLimit: 200, // requests per day
      rateLimitWindow: 86400000, // 24 hours in milliseconds
      timeout: 30000, // 30 seconds
      retryAttempts: 3,
      retryDelays: [60000, 300000, 900000], // 1min, 5min, 15min
    },
    bing: {
      timeout: 30000, // 30 seconds
      retryAttempts: 3,
      retryDelays: [60000, 300000, 900000], // 1min, 5min, 15min
    },
  },
  
  // Internal Linking Configuration
  internalLinking: {
    maxRelatedPosts: 5,
    maxTopicHubs: 3,
    maxContextualLinks: 10,
    relevanceWeights: {
      tagOverlap: 0.4,
      categoryMatch: 0.3,
      keywordSimilarity: 0.2,
      contentSimilarity: 0.1,
    },
  },
  
  // News Sitemap Configuration
  newsSitemap: {
    maxAgeDays: 2, // Only include posts from last 2 days
    publicationName: 'AITechWorldHub',
  },
} as const;

// Type exports for use throughout the application
export type SEOConfig = typeof SEO_CONFIG;
export type ChangeFreq = 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
export type TwitterCardType = 'summary' | 'summary_large_image';
export type RobotsDirective = 'index' | 'noindex' | 'follow' | 'nofollow';

// Helper function to get full URL
export function getFullUrl(path: string): string {
  const baseUrl = SEO_CONFIG.siteUrl.replace(/\/$/, ''); // Remove trailing slash
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}

// Helper function to get default image URL
export function getDefaultImageUrl(): string {
  return getFullUrl(SEO_CONFIG.defaultImage);
}

// Helper function to validate image dimensions
export function meetsImageRequirements(width: number, height: number): boolean {
  return (
    width >= SEO_CONFIG.metadata.ogImageMinWidth &&
    height >= SEO_CONFIG.metadata.ogImageMinHeight
  );
}
