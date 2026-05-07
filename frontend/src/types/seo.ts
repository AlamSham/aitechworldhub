/**
 * SEO Type Definitions
 * 
 * TypeScript types for all SEO-related data structures including
 * structured data schemas, metadata, sitemaps, and validation results.
 */

import type { Thing, WithContext } from 'schema-dts';

// ============================================================================
// Structured Data Schema Types
// ============================================================================

/**
 * BlogPosting Schema
 * Used for blog post pages to enable Article rich results
 */
export type BlogPostingSchema = WithContext<{
  '@type': 'BlogPosting';
  headline: string;
  description: string;
  image?: string | string[];
  datePublished?: string;
  dateModified?: string;
  author: PersonSchema | PersonSchema[];
  publisher: OrganizationSchema;
  mainEntityOfPage: {
    '@type': 'WebPage';
    '@id': string;
  };
  articleSection?: string;
  keywords?: string | string[];
  citation?: string[];
  wordCount?: number;
  isAccessibleForFree: boolean;
}>;

/**
 * Article Schema
 * Alternative to BlogPosting for news-style content
 */
export type ArticleSchema = WithContext<{
  '@type': 'Article';
  headline: string;
  description: string;
  image?: string | string[];
  datePublished?: string;
  dateModified?: string;
  author: PersonSchema | PersonSchema[];
  publisher: OrganizationSchema;
  mainEntityOfPage: {
    '@type': 'WebPage';
    '@id': string;
  };
  articleSection?: string;
  keywords?: string | string[];
  wordCount?: number;
  isAccessibleForFree: boolean;
}>;

/**
 * Person Schema
 * Used for author pages and author information in articles
 */
export type PersonSchema = WithContext<{
  '@type': 'Person';
  name: string;
  url?: string;
  jobTitle?: string;
  description?: string;
  knowsAbout?: string | string[];
  sameAs?: string[];
  image?: string;
}>;

/**
 * BreadcrumbList Schema
 * Used for breadcrumb navigation on all pages
 */
export type BreadcrumbListSchema = WithContext<{
  '@type': 'BreadcrumbList';
  itemListElement: BreadcrumbItem[];
}>;

export type BreadcrumbItem = {
  '@type': 'ListItem';
  position: number;
  name: string;
  item: string;
};

/**
 * WebSite Schema
 * Used for homepage to enable sitelinks search box
 */
export type WebSiteSchema = WithContext<{
  '@type': 'WebSite';
  name: string;
  url: string;
  publisher: OrganizationSchema;
  inLanguage: string;
  description: string;
  potentialAction?: {
    '@type': 'SearchAction';
    target: {
      '@type': 'EntryPoint';
      urlTemplate: string;
    };
    'query-input': string;
  };
}>;

/**
 * CollectionPage Schema
 * Used for topic hub pages listing related posts
 */
export type CollectionPageSchema = WithContext<{
  '@type': 'CollectionPage';
  name: string;
  description: string;
  url: string;
  hasPart?: Array<{
    '@type': 'BlogPosting';
    headline: string;
    url: string;
  }>;
}>;

/**
 * FAQPage Schema
 * Used for pages with FAQ content to enable FAQ rich results
 */
export type FAQPageSchema = WithContext<{
  '@type': 'FAQPage';
  mainEntity: FAQItem[];
}>;

export type FAQItem = {
  '@type': 'Question';
  name: string;
  acceptedAnswer: {
    '@type': 'Answer';
    text: string;
  };
};

/**
 * HowTo Schema
 * Used for how-to guides to enable HowTo rich results
 */
export type HowToSchema = WithContext<{
  '@type': 'HowTo';
  name: string;
  description: string;
  step: HowToStep[];
  totalTime?: string;
  tool?: string | string[];
  supply?: string | string[];
}>;

export type HowToStep = {
  '@type': 'HowToStep';
  name: string;
  text: string;
  url?: string;
  image?: string;
};

/**
 * ImageObject Schema
 * Used for images in blog posts to enable image search
 */
export type ImageObjectSchema = WithContext<{
  '@type': 'ImageObject';
  contentUrl: string;
  url: string;
  caption?: string;
  width?: number;
  height?: number;
  encodingFormat?: string;
}>;

/**
 * Organization Schema
 * Used for publisher information across all pages
 */
export type OrganizationSchema = WithContext<{
  '@type': 'Organization';
  name: string;
  url: string;
  logo: {
    '@type': 'ImageObject';
    url: string;
  };
  email?: string;
  description?: string;
  sameAs?: string[];
}>;

/**
 * Union type of all supported schema types
 */
export type SchemaType =
  | BlogPostingSchema
  | ArticleSchema
  | PersonSchema
  | BreadcrumbListSchema
  | WebSiteSchema
  | CollectionPageSchema
  | FAQPageSchema
  | HowToSchema
  | ImageObjectSchema
  | OrganizationSchema;

// ============================================================================
// Metadata Types
// ============================================================================

/**
 * Open Graph Metadata
 * Used for social media sharing previews
 */
export type OpenGraphMetadata = {
  'og:title': string;
  'og:description': string;
  'og:url': string;
  'og:type': 'article' | 'website';
  'og:image': string;
  'og:site_name': string;
  'og:locale': string;
  'og:article:published_time'?: string;
  'og:article:modified_time'?: string;
  'og:article:author'?: string;
  'og:article:section'?: string;
  'og:article:tag'?: string[];
};

/**
 * Twitter Card Metadata
 * Used for Twitter sharing previews
 */
export type TwitterCardMetadata = {
  'twitter:card': 'summary' | 'summary_large_image';
  'twitter:title': string;
  'twitter:description': string;
  'twitter:image': string;
  'twitter:site'?: string;
  'twitter:creator'?: string;
};

/**
 * Hreflang Tag
 * Used for multi-language content
 */
export type HreflangTag = {
  hreflang: string;
  href: string;
};

/**
 * Robots Meta Tag Options
 */
export type RobotsOptions = {
  index?: boolean;
  follow?: boolean;
  maxImagePreview?: 'none' | 'standard' | 'large';
  maxSnippet?: number;
  maxVideoPreview?: number;
};

/**
 * Image Validation Result
 */
export type ImageValidation = {
  valid: boolean;
  width: number;
  height: number;
  meetsRequirements: boolean; // >= 1200x630
  error?: string;
};

// ============================================================================
// Sitemap Types
// ============================================================================

/**
 * Main Sitemap Entry
 */
export type SitemapEntry = {
  url: string;
  lastmod: string; // ISO 8601 format
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number; // 0.0 to 1.0
};

/**
 * News Sitemap Entry
 */
export type NewsSitemapEntry = {
  url: string;
  publicationDate: string; // ISO 8601 format
  publicationName: string;
  title: string;
};

/**
 * Image Sitemap Entry
 */
export type ImageSitemapEntry = {
  pageUrl: string;
  images: {
    loc: string;
    caption?: string;
    title?: string;
  }[];
};

/**
 * Sitemap Index Entry
 */
export type SitemapIndexEntry = {
  loc: string;
  lastmod: string; // ISO 8601 format
};

// ============================================================================
// Validation Types
// ============================================================================

/**
 * Schema Validation Result
 */
export type ValidationResult = {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
};

export type ValidationError = {
  property: string;
  message: string;
  value?: unknown;
};

export type ValidationWarning = {
  property: string;
  message: string;
  value?: unknown;
};

/**
 * Sitemap Validation Result
 */
export type SitemapValidationResult = {
  valid: boolean;
  errors: SitemapError[];
  warnings: SitemapWarning[];
  stats: {
    urlCount: number;
    fileSize: number;
    validationTime: number;
  };
};

export type SitemapError = {
  type: 'xml_structure' | 'url_format' | 'date_format' | 'value_range' | 'size_limit';
  message: string;
  line?: number;
  url?: string;
};

export type SitemapWarning = {
  type: 'accessibility' | 'performance' | 'best_practice';
  message: string;
  url?: string;
};

/**
 * URL Validation Result
 */
export type UrlValidationResult = {
  url: string;
  accessible: boolean;
  statusCode: number;
  responseTime: number;
  error?: string;
};

// ============================================================================
// Parse Error Types
// ============================================================================

/**
 * JSON-LD Parse Error
 */
export type ParseError = {
  message: string;
  line: number;
  column: number;
};

// ============================================================================
// Internal Linking Types
// ============================================================================

/**
 * Related Post with Relevance Score
 */
export type RelatedPost = {
  post: {
    _id: string;
    title: string;
    slug: string;
    excerpt: string;
    imageUrl?: string;
    publishedAt: Date;
  };
  relevanceScore: number;
  matchReason: 'tags' | 'category' | 'keyword' | 'content';
};

/**
 * Contextual Link Suggestion
 */
export type ContextualLink = {
  anchorText: string;
  targetPost: {
    _id: string;
    title: string;
    slug: string;
  };
  position: number; // character position in content
  confidence: number; // 0-1
};

/**
 * Topic Hub Reference
 */
export type TopicHub = {
  slug: string;
  title: string;
  description: string;
  keywords: string[];
  category?: string;
};

// ============================================================================
// Search Console Types
// ============================================================================

/**
 * Sitemap Submission Result
 */
export type SubmissionResult = {
  success: boolean;
  provider: 'google' | 'bing';
  sitemapUrl: string;
  timestamp: Date;
  response?: unknown;
  error?: string;
};

/**
 * URL Indexing Result
 */
export type IndexingResult = {
  success: boolean;
  url: string;
  provider: 'google' | 'bing';
  status: 'submitted' | 'indexed' | 'error';
  message?: string;
};

/**
 * Submission History Record
 */
export type SubmissionRecord = {
  _id: string;
  provider: 'google' | 'bing';
  sitemapUrl: string;
  status: 'success' | 'failed' | 'pending';
  attempts: number;
  lastAttempt: Date;
  nextRetry?: Date;
  response?: unknown;
  error?: string;
};

/**
 * Retry Result
 */
export type RetryResult = {
  attempted: number;
  succeeded: number;
  failed: number;
};

// ============================================================================
// Monitoring Types
// ============================================================================

/**
 * Search Console Data
 */
export type SearchConsoleData = {
  impressions: number;
  clicks: number;
  ctr: number;
  averagePosition: number;
  period: {
    start: Date;
    end: Date;
  };
  topPages: PagePerformance[];
};

export type PagePerformance = {
  url: string;
  impressions: number;
  clicks: number;
  ctr: number;
  position: number;
};

/**
 * Indexing Rate
 */
export type IndexingRate = {
  totalPages: number;
  indexedPages: number;
  rate: number; // percentage
  lastUpdated: Date;
};

/**
 * Unindexed Page
 */
export type UnindexedPage = {
  url: string;
  reason: string;
  discoveredDate: Date;
};

/**
 * Structured Data Report
 */
export type StructuredDataReport = {
  totalPages: number;
  validPages: number;
  pagesWithErrors: number;
  pagesWithWarnings: number;
  errors: StructuredDataError[];
  warnings: StructuredDataWarning[];
};

export type StructuredDataError = {
  url: string;
  schemaType: string;
  property: string;
  message: string;
};

export type StructuredDataWarning = {
  url: string;
  schemaType: string;
  property: string;
  message: string;
};

/**
 * Broken Link
 */
export type BrokenLink = {
  sourceUrl: string;
  targetUrl: string;
  statusCode: number;
  lastChecked: Date;
};

/**
 * Metadata Issue
 */
export type MetadataIssue = {
  url: string;
  issues: (
    | 'missing_description'
    | 'missing_og_image'
    | 'missing_canonical'
    | 'description_too_long'
    | 'description_too_short'
  )[];
};

/**
 * SEO Report
 */
export type SEOReport = {
  period: {
    start: Date;
    end: Date;
  };
  indexingRate: IndexingRate;
  searchConsoleData: SearchConsoleData;
  topIssues: string[];
  recommendations: string[];
};

// ============================================================================
// Robots.txt Types
// ============================================================================

/**
 * Robots.txt Configuration
 */
export type RobotsTxtConfig = {
  rules: RobotsRule[];
  sitemaps: string[];
  host?: string;
};

export type RobotsRule = {
  userAgent: string;
  allow?: string[];
  disallow?: string[];
  crawlDelay?: number;
};

// ============================================================================
// Cache Types
// ============================================================================

/**
 * Internal Links Cache Entry
 */
export type InternalLinksCache = {
  postSlug: string;
  relatedPosts: {
    slug: string;
    title: string;
    relevanceScore: number;
  }[];
  topicHubs: {
    slug: string;
    title: string;
  }[];
  cachedAt: Date;
  expiresAt: Date;
};

/**
 * Schema Validation Cache Entry
 */
export type SchemaValidationCache = {
  _id: string;
  url: string;
  schemaType: string;
  valid: boolean;
  errors: {
    message: string;
    property: string;
  }[];
  warnings: {
    message: string;
    property: string;
  }[];
  richResultsEligible: boolean;
  lastValidated: Date;
  expiresAt: Date;
};
