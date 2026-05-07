# Technical Design Document: SEO Improvement Feature

## Overview

This document defines the technical design for implementing comprehensive SEO improvements to the AITechWorldHub blog platform. The system will address the current poor search visibility (7 out of 18+ pages indexed, 217 impressions, 11 clicks over 3 months) by implementing structured data generation, optimized metadata management, advanced sitemap systems, validation engines, search console integration, and intelligent internal linking.

### Goals

- Achieve 95%+ indexing rate across all published content
- Generate 1,500+ impressions and 75+ clicks within 3 months
- Enable rich snippets on 80%+ of blog posts
- Automate sitemap generation, validation, and submission
- Implement comprehensive structured data for 10 schema types
- Build intelligent internal linking system for improved navigation and SEO

### Technology Stack

- **Frontend**: Next.js 14+ (App Router), TypeScript, React
- **Backend**: Node.js, Express, MongoDB
- **SEO Libraries**: 
  - `schema-dts` for TypeScript schema definitions
  - `fast-xml-parser` for sitemap generation and validation
  - `googleapis` for Google Search Console API
  - `axios` for Bing Webmaster Tools API
- **Validation**: JSON Schema validation, XML schema validation
- **Caching**: Next.js ISR (Incremental Static Regeneration), in-memory caching

### Design Principles

1. **Performance First**: All SEO operations must complete within 100ms to avoid impacting page load times
2. **Validation at Every Step**: Validate structured data and sitemaps before rendering/submission
3. **Graceful Degradation**: SEO features should fail gracefully without breaking page rendering
4. **Caching Strategy**: Aggressive caching with smart invalidation to minimize computation
5. **Incremental Enhancement**: Build on existing sitemap and structured data implementations
6. **API Rate Limiting**: Respect search engine API quotas and implement retry logic

## Architecture

### System Architecture Diagram

\`\`\`mermaid
graph TB
    subgraph "Frontend Layer (Next.js)"
        A[Page Components] --> B[SEO Service]
        B --> C[Structured Data Generator]
        B --> D[Metadata Manager]
        B --> E[Internal Linking Engine]
        
        F[Sitemap Routes] --> G[Sitemap Generator]
        H[Robots Route] --> I[Robots Manager]
    end
    
    subgraph "Backend Layer (Express)"
        J[SEO Controller] --> K[Validation Service]
        J --> L[Search Console Submitter]
        J --> M[SEO Monitoring Service]
        
        K --> N[Sitemap Validator]
        K --> O[Schema Validator]
        
        L --> P[Google Search Console API]
        L --> Q[Bing Webmaster API]
        
        M --> R[Analytics Aggregator]
    end
    
    subgraph "Data Layer"
        S[(MongoDB)]
        T[Cache Layer]
    end
    
    subgraph "External Services"
        P
        Q
        U[Google Rich Results Test API]
    end
    
    C --> K
    G --> N
    J --> S
    B --> T
    G --> T
    M --> P
    O --> U
    
    style A fill:#e1f5ff
    style B fill:#e1f5ff
    style J fill:#fff4e1
    style S fill:#f0f0f0
    style P fill:#e8f5e9
    style Q fill:#e8f5e9

\`\`\`

### Component Interaction Flow

\`\`\`mermaid
sequenceDiagram
    participant User
    participant Page
    participant SEOService
    participant StructuredDataGen
    participant MetadataManager
    participant Cache
    participant Validator
    
    User->>Page: Request /posts/[slug]
    Page->>SEOService: generatePageSEO(post)
    
    SEOService->>Cache: checkCache(post.slug)
    alt Cache Hit
        Cache-->>SEOService: cachedSEOData
    else Cache Miss
        SEOService->>StructuredDataGen: generateSchemas(post)
        StructuredDataGen->>Validator: validateSchema(jsonLd)
        Validator-->>StructuredDataGen: validationResult
        StructuredDataGen-->>SEOService: schemas
        
        SEOService->>MetadataManager: generateMetadata(post)
        MetadataManager-->>SEOService: metadata
        
        SEOService->>Cache: storeCache(seoData, 1hour)
    end
    
    SEOService-->>Page: seoData
    Page-->>User: Rendered Page with SEO

\`\`\`

## Components and Interfaces

### 1. Structured Data Generator

**Purpose**: Generate JSON-LD structured data for 10 schema types with validation.

**Location**: `frontend/src/lib/seo/structured-data.ts`

**Interface**:

\`\`\`typescript
interface StructuredDataGenerator {
  // Core generation methods
  generateBlogPosting(post: PublishedPost): BlogPostingSchema;
  generateArticle(post: PublishedPost): ArticleSchema;
  generatePerson(author: Author): PersonSchema;
  generateBreadcrumb(path: BreadcrumbItem[]): BreadcrumbListSchema;
  generateWebSite(): WebSiteSchema;
  generateCollectionPage(hub: TopicHub, posts: PublishedPost[]): CollectionPageSchema;
  generateFAQPage(faqs: FAQItem[]): FAQPageSchema;
  generateHowTo(steps: HowToStep[]): HowToSchema;
  generateImageObject(image: ImageData): ImageObjectSchema;
  generateOrganization(): OrganizationSchema;
  
  // Utility methods
  validateSchema(schema: unknown): ValidationResult;
  minifyJsonLd(schema: unknown): string;
  parseJsonLd(jsonLdString: string): Schema | ParseError;
  formatJsonLd(schema: Schema): string;
}

// Type definitions
type BlogPostingSchema = {
  '@context': 'https://schema.org';
  '@type': 'BlogPosting';
  headline: string;
  description: string;
  image?: string[];
  datePublished?: string;
  dateModified?: string;
  author: PersonSchema;
  publisher: OrganizationSchema;
  mainEntityOfPage: { '@type': 'WebPage'; '@id': string };
  articleSection?: string;
  keywords?: string[];
  citation?: string[];
  wordCount?: number;
  isAccessibleForFree: boolean;
};

type ValidationResult = {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
};

type ParseError = {
  message: string;
  line: number;
  column: number;
};
\`\`\`

**Implementation Details**:

1. **Schema Generation**:
   - Use `schema-dts` for TypeScript type safety
   - Validate all required properties before generation
   - Escape special characters in strings (quotes, newlines, HTML entities)
   - Handle missing optional properties gracefully

2. **Validation**:
   - Validate against Schema.org vocabulary
   - Check required properties for each schema type
   - Validate data types (string, number, date, URL)
   - Validate URL formats and date formats (ISO 8601)

3. **Parser and Pretty Printer**:
   - Parse JSON-LD strings into typed Schema objects
   - Detect and report syntax errors with line/column numbers
   - Format schemas with proper indentation (2 spaces)
   - Preserve nested object hierarchy and array order
   - Support round-trip: parse → format → parse produces equivalent object

4. **Performance**:
   - Cache generated schemas for 1 hour per page
   - Minify JSON-LD for production (remove whitespace)
   - Complete generation within 50ms per schema
   - Lazy-load non-critical schemas (FAQ, HowTo) after initial render

### 2. Metadata Manager

**Purpose**: Generate and manage Open Graph, Twitter Cards, and canonical URLs.

**Location**: `frontend/src/lib/seo/metadata.ts`

**Interface**:

\`\`\`typescript
interface MetadataManager {
  generateOpenGraph(post: PublishedPost): OpenGraphMetadata;
  generateTwitterCard(post: PublishedPost): TwitterCardMetadata;
  generateCanonicalUrl(path: string): string;
  generateHreflangTags(path: string, locales: string[]): HreflangTag[];
  generateMetaDescription(text: string, maxLength?: number): string;
  generateMetaKeywords(post: PublishedPost): string;
  generateRobotsTag(options?: RobotsOptions): string;
  validateImageDimensions(imageUrl: string): Promise<ImageValidation>;
}

type OpenGraphMetadata = {
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

type TwitterCardMetadata = {
  'twitter:card': 'summary' | 'summary_large_image';
  'twitter:title': string;
  'twitter:description': string;
  'twitter:image': string;
  'twitter:site'?: string;
};

type RobotsOptions = {
  index?: boolean;
  follow?: boolean;
  maxImagePreview?: 'none' | 'standard' | 'large';
  maxSnippet?: number;
  maxVideoPreview?: number;
};

type ImageValidation = {
  valid: boolean;
  width: number;
  height: number;
  meetsRequirements: boolean; // >= 1200x630
};
\`\`\`

**Implementation Details**:

1. **Open Graph Generation**:
   - Ensure og:image dimensions are at least 1200x630 pixels
   - Validate image URL accessibility before rendering
   - Include article-specific tags for blog posts
   - Escape special characters in content

2. **Meta Description**:
   - Truncate to 150-160 characters
   - Preserve word boundaries (don't cut mid-word)
   - Add ellipsis if truncated
   - Remove markdown formatting and HTML tags

3. **Canonical URLs**:
   - Always use absolute URLs with HTTPS
   - Remove trailing slashes for consistency
   - Handle query parameters appropriately
   - Support custom canonical URLs for syndicated content

4. **Image Validation**:
   - Fetch image headers to check dimensions
   - Cache validation results for 24 hours
   - Fallback to default image if validation fails
   - Timeout after 5 seconds

### 3. Sitemap Generator

**Purpose**: Generate main, news, image, and index sitemaps with proper formatting.

**Location**: `frontend/app/sitemap-*.ts` (multiple files)

**Interface**:

\`\`\`typescript
interface SitemapGenerator {
  generateMainSitemap(): Promise<SitemapEntry[]>;
  generateNewsSitemap(): Promise<NewsSitemapEntry[]>;
  generateImageSitemap(): Promise<ImageSitemapEntry[]>;
  generateSitemapIndex(): Promise<SitemapIndexEntry[]>;
}

type SitemapEntry = {
  url: string;
  lastmod: string; // ISO 8601 format
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number; // 0.0 to 1.0
};

type NewsSitemapEntry = {
  url: string;
  publicationDate: string;
  publicationName: string;
  title: string;
};

type ImageSitemapEntry = {
  pageUrl: string;
  images: {
    loc: string;
    caption?: string;
    title?: string;
  }[];
};

type SitemapIndexEntry = {
  loc: string;
  lastmod: string;
};
\`\`\`

**Implementation Details**:

1. **Main Sitemap**:
   - Include all published posts, topic hubs, author pages, static pages
   - Use post's `updatedAt` as `lastmod`, fallback to `publishedAt` or `createdAt`
   - Set appropriate `changefreq` and `priority` based on page type:
     - Homepage: daily, 1.0
     - Blog posts: weekly, 0.8
     - Topic hubs: weekly, 0.7
     - Author pages: weekly, 0.6
     - Static pages: monthly/yearly, 0.3-0.5
   - Limit to 50,000 URLs per file
   - Split into multiple files if needed

2. **News Sitemap**:
   - Include only posts published within last 2 days
   - Include publication name, date, and title
   - Update every hour to capture new posts
   - Follow Google News sitemap specifications

3. **Image Sitemap**:
   - Extract all images from blog post content
   - Include featured images and inline images
   - Add captions from alt text or image metadata
   - Group images by page URL

4. **Sitemap Index**:
   - Create when total URLs exceed 50,000
   - Reference all sub-sitemaps (main, news, images, paginated)
   - Update lastmod when any sub-sitemap changes

5. **Performance**:
   - Use ISR with 5-minute revalidation
   - Generate asynchronously without blocking
   - Cache sitemap XML for 5 minutes
   - Compress with gzip for serving

### 4. Sitemap Validator

**Purpose**: Validate sitemap structure and content against XML schema and search engine requirements.

**Location**: `backend/src/services/seo/sitemap-validator.ts`

**Interface**:

\`\`\`typescript
interface SitemapValidator {
  validateSitemap(xml: string): Promise<SitemapValidationResult>;
  validateNewsSitemap(xml: string): Promise<SitemapValidationResult>;
  validateImageSitemap(xml: string): Promise<SitemapValidationResult>;
  validateSitemapIndex(xml: string): Promise<SitemapValidationResult>;
  validateUrls(urls: string[]): Promise<UrlValidationResult[]>;
}

type SitemapValidationResult = {
  valid: boolean;
  errors: SitemapError[];
  warnings: SitemapWarning[];
  stats: {
    urlCount: number;
    fileSize: number;
    validationTime: number;
  };
};

type SitemapError = {
  type: 'xml_structure' | 'url_format' | 'date_format' | 'value_range' | 'size_limit';
  message: string;
  line?: number;
  url?: string;
};

type UrlValidationResult = {
  url: string;
  accessible: boolean;
  statusCode: number;
  responseTime: number;
};
\`\`\`

**Implementation Details**:

1. **XML Structure Validation**:
   - Validate against Sitemap 0.9 protocol XML schema
   - Check for well-formed XML
   - Verify required elements (urlset, url, loc)
   - Validate namespace declarations

2. **URL Validation**:
   - Verify all URLs are absolute with HTTPS protocol
   - Check URL format (valid characters, proper encoding)
   - Optionally verify URLs return HTTP 200 (configurable)
   - Batch URL checks to avoid overwhelming server

3. **Date Validation**:
   - Verify lastmod dates are in W3C Datetime format
   - Support both YYYY-MM-DD and full ISO 8601
   - Check dates are not in the future
   - Validate news sitemap publication dates are within 2 days

4. **Value Range Validation**:
   - Verify changefreq is one of allowed values
   - Verify priority is between 0.0 and 1.0
   - Check URL count doesn't exceed 50,000
   - Check file size doesn't exceed 50MB uncompressed

5. **Performance**:
   - Complete validation within 30 seconds for 10,000 URLs
   - Use streaming XML parser for large files
   - Parallel URL accessibility checks (max 10 concurrent)
   - Timeout individual URL checks after 5 seconds

### 5. Search Console Submitter

**Purpose**: Automatically submit sitemaps to Google Search Console and Bing Webmaster Tools.

**Location**: `backend/src/services/seo/search-console-submitter.ts`

**Interface**:

\`\`\`typescript
interface SearchConsoleSubmitter {
  submitToGoogle(sitemapUrl: string): Promise<SubmissionResult>;
  submitToBing(sitemapUrl: string): Promise<SubmissionResult>;
  submitUrlForIndexing(url: string, provider: 'google' | 'bing'): Promise<IndexingResult>;
  getSubmissionHistory(limit?: number): Promise<SubmissionRecord[]>;
  retryFailedSubmissions(): Promise<RetryResult>;
}

type SubmissionResult = {
  success: boolean;
  provider: 'google' | 'bing';
  sitemapUrl: string;
  timestamp: Date;
  response?: unknown;
  error?: string;
};

type IndexingResult = {
  success: boolean;
  url: string;
  provider: 'google' | 'bing';
  status: 'submitted' | 'indexed' | 'error';
  message?: string;
};

type SubmissionRecord = {
  _id: string;
  provider: 'google' | 'bing';
  sitemapUrl: string;
  status: 'success' | 'failed' | 'pending';
  attempts: number;
  lastAttempt: Date;
  response?: unknown;
  error?: string;
};

type RetryResult = {
  attempted: number;
  succeeded: number;
  failed: number;
};
\`\`\`

**Implementation Details**:

1. **Google Search Console Integration**:
   - Use Google Indexing API for sitemap submission
   - Use OAuth 2.0 with service account credentials
   - Store credentials in environment variables
   - Rate limit to 200 requests per day
   - Submit individual URLs for immediate indexing on publish

2. **Bing Webmaster Tools Integration**:
   - Use Bing Webmaster API for sitemap submission
   - Use API key authentication
   - Store API key in environment variables
   - No strict rate limits but implement reasonable throttling

3. **Retry Logic**:
   - Retry failed submissions up to 3 times
   - Use exponential backoff: 1 min, 5 min, 15 min
   - Store submission history in MongoDB
   - Send alert notification after all retries fail

4. **Submission History**:
   - Store all submission attempts with timestamps
   - Track success/failure status
   - Store API responses for debugging
   - Provide admin dashboard view of submission history

5. **Error Handling**:
   - Timeout requests after 30 seconds
   - Handle authentication errors gracefully
   - Log all errors with context
   - Continue operation even if one provider fails

### 6. Robots Manager

**Purpose**: Generate and serve optimized robots.txt configuration.

**Location**: `frontend/app/robots.ts`

**Interface**:

\`\`\`typescript
interface RobotsManager {
  generateRobotsTxt(): RobotsTxtConfig;
  addDisallowRule(userAgent: string, path: string): void;
  addAllowRule(userAgent: string, path: string): void;
  addSitemapReference(sitemapUrl: string): void;
  setCrawlDelay(userAgent: string, seconds: number): void;
}

type RobotsTxtConfig = {
  rules: RobotsRule[];
  sitemaps: string[];
  host?: string;
};

type RobotsRule = {
  userAgent: string;
  allow?: string[];
  disallow?: string[];
  crawlDelay?: number;
};
\`\`\`

**Implementation Details**:

1. **Default Configuration**:
   - Allow all user agents to crawl root path "/"
   - Disallow "/admin/", "/api/", "/_next/"
   - Reference main sitemap, news sitemap, image sitemap
   - Set crawl-delay of 1 second for all agents except Googlebot

2. **Query Parameter Handling**:
   - Disallow URLs with "?page=" to prevent duplicate content
   - Allow other query parameters for tracking

3. **Special User Agent Rules**:
   - No crawl-delay for Googlebot
   - Allow Googlebot full access to allowed paths

4. **Format**:
   - Serve with "text/plain" content type
   - Return HTTP 200 status code
   - Follow Robots Exclusion Protocol standard
   - Use proper line endings (CRLF or LF)

### 7. Internal Linking Engine

**Purpose**: Analyze content and suggest relevant internal links.

**Location**: `frontend/src/lib/seo/internal-linking.ts`

**Interface**:

\`\`\`typescript
interface InternalLinkingEngine {
  findRelatedPosts(post: PublishedPost, limit?: number): Promise<RelatedPost[]>;
  findRelevantTopicHubs(post: PublishedPost, limit?: number): TopicHub[];
  suggestContextualLinks(content: string, allPosts: PublishedPost[]): ContextualLink[];
  calculateRelevanceScore(post1: PublishedPost, post2: PublishedPost): number;
}

type RelatedPost = {
  post: PublishedPost;
  relevanceScore: number;
  matchReason: 'tags' | 'category' | 'keyword' | 'content';
};

type ContextualLink = {
  anchorText: string;
  targetPost: PublishedPost;
  position: number; // character position in content
  confidence: number; // 0-1
};
\`\`\`

**Implementation Details**:

1. **Related Posts Algorithm**:
   - Calculate relevance score based on:
     - Tag overlap (40% weight)
     - Category match (30% weight)
     - Focus keyword similarity (20% weight)
     - Content similarity (10% weight)
   - Sort by relevance score descending
   - Return top N posts (default 5)
   - Exclude current post from results
   - Only include published posts

2. **Topic Hub Matching**:
   - Match post tags against topic hub keywords
   - Match post category against topic hub category
   - Match focus keyword against topic hub description
   - Return top 3 most relevant hubs

3. **Contextual Link Suggestions**:
   - Extract keywords from post content
   - Match keywords against other post titles and tags
   - Suggest anchor text based on matched keywords
   - Provide confidence score based on match quality
   - Limit to 5-10 suggestions per post

4. **Performance**:
   - Cache related posts for 30 minutes
   - Cache topic hub suggestions for 30 minutes
   - Use in-memory cache for frequently accessed data
   - Invalidate cache when content is published/updated

### 8. SEO Monitoring Service

**Purpose**: Track indexing status, search visibility, and identify optimization opportunities.

**Location**: `backend/src/services/seo/monitoring.ts`

**Interface**:

\`\`\`typescript
interface SEOMonitoringService {
  fetchSearchConsoleData(): Promise<SearchConsoleData>;
  calculateIndexingRate(): Promise<IndexingRate>;
  findUnindexedPages(): Promise<UnindexedPage[]>;
  validateStructuredData(): Promise<StructuredDataReport>;
  findBrokenLinks(): Promise<BrokenLink[]>;
  findMissingMetadata(): Promise<MetadataIssue[]>;
  generateWeeklyReport(): Promise<SEOReport>;
  sendWeeklyEmail(report: SEOReport): Promise<void>;
}

type SearchConsoleData = {
  impressions: number;
  clicks: number;
  ctr: number;
  averagePosition: number;
  period: { start: Date; end: Date };
  topPages: PagePerformance[];
};

type IndexingRate = {
  totalPages: number;
  indexedPages: number;
  rate: number; // percentage
  lastUpdated: Date;
};

type UnindexedPage = {
  url: string;
  reason: string;
  discoveredDate: Date;
};

type StructuredDataReport = {
  totalPages: number;
  validPages: number;
  pagesWithErrors: number;
  pagesWithWarnings: number;
  errors: StructuredDataError[];
  warnings: StructuredDataWarning[];
};

type BrokenLink = {
  sourceUrl: string;
  targetUrl: string;
  statusCode: number;
  lastChecked: Date;
};

type MetadataIssue = {
  url: string;
  issues: ('missing_description' | 'missing_og_image' | 'missing_canonical' | 'description_too_long' | 'description_too_short')[];
};

type SEOReport = {
  period: { start: Date; end: Date };
  indexingRate: IndexingRate;
  searchConsoleData: SearchConsoleData;
  topIssues: string[];
  recommendations: string[];
};
\`\`\`

**Implementation Details**:

1. **Search Console Integration**:
   - Fetch data daily via scheduled job
   - Query last 30 days of data
   - Store historical data in MongoDB
   - Calculate trends (week-over-week, month-over-month)

2. **Indexing Rate Calculation**:
   - Count total published pages
   - Query Google Search Console for indexed pages
   - Calculate percentage
   - Track changes over time

3. **Structured Data Validation**:
   - Use Google Rich Results Test API
   - Validate all published pages
   - Cache results for 24 hours
   - Report errors and warnings

4. **Broken Link Detection**:
   - Crawl all internal links weekly
   - Check HTTP status codes
   - Report 404s and 500s
   - Suggest fixes (redirects, updates)

5. **Weekly Reporting**:
   - Generate report every Monday
   - Include key metrics and trends
   - Highlight top issues
   - Provide actionable recommendations
   - Send via email to admin

## Data Models

### SEO Configuration

\`\`\`typescript
// MongoDB Schema: seo_config
type SEOConfig = {
  _id: string;
  siteName: string;
  siteUrl: string;
  defaultImage: string;
  organizationName: string;
  organizationEmail: string;
  socialProfiles: {
    twitter?: string;
    facebook?: string;
    linkedin?: string;
    github?: string;
  };
  searchConsole: {
    google: {
      serviceAccountEmail: string;
      privateKey: string; // encrypted
      propertyUrl: string;
    };
    bing: {
      apiKey: string; // encrypted
      siteUrl: string;
    };
  };
  sitemapConfig: {
    maxUrlsPerFile: number; // default 50000
    changefreqDefaults: {
      homepage: 'daily';
      posts: 'weekly';
      topics: 'weekly';
      authors: 'weekly';
      static: 'monthly';
    };
    priorityDefaults: {
      homepage: 1.0;
      posts: 0.8;
      topics: 0.7;
      authors: 0.6;
      static: 0.5;
    };
  };
  cacheConfig: {
    structuredDataTTL: number; // seconds, default 3600
    metadataTTL: number; // seconds, default 3600
    sitemapTTL: number; // seconds, default 300
    relatedPostsTTL: number; // seconds, default 1800
  };
  createdAt: Date;
  updatedAt: Date;
};
\`\`\`

### Sitemap Submission History

\`\`\`typescript
// MongoDB Schema: sitemap_submissions
type SitemapSubmission = {
  _id: string;
  provider: 'google' | 'bing';
  sitemapUrl: string;
  sitemapType: 'main' | 'news' | 'image' | 'index';
  status: 'success' | 'failed' | 'pending';
  attempts: number;
  lastAttempt: Date;
  nextRetry?: Date;
  response?: {
    statusCode: number;
    body: unknown;
  };
  error?: {
    message: string;
    code: string;
  };
  createdAt: Date;
  updatedAt: Date;
};
\`\`\`

### SEO Monitoring Data

\`\`\`typescript
// MongoDB Schema: seo_metrics
type SEOMetrics = {
  _id: string;
  date: Date;
  indexingRate: {
    totalPages: number;
    indexedPages: number;
    rate: number;
  };
  searchConsole: {
    impressions: number;
    clicks: number;
    ctr: number;
    averagePosition: number;
  };
  topPages: {
    url: string;
    impressions: number;
    clicks: number;
    ctr: number;
    position: number;
  }[];
  unindexedPages: {
    url: string;
    reason: string;
  }[];
  structuredDataIssues: {
    url: string;
    errors: number;
    warnings: number;
  }[];
  createdAt: Date;
};
\`\`\`

### Structured Data Validation Cache

\`\`\`typescript
// MongoDB Schema: schema_validation_cache
type SchemaValidationCache = {
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
  expiresAt: Date; // TTL index, 24 hours
};
\`\`\`

### Internal Links Cache

\`\`\`typescript
// In-memory cache structure (Redis or Node.js Map)
type InternalLinksCache = {
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
  expiresAt: Date; // 30 minutes
};
\`\`\`


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, I identified the following testable properties. Through reflection, I've eliminated redundancy by:

1. **Combining schema generation properties**: Properties 1.1-1.10 all test schema generation with required properties. These can be consolidated into a single comprehensive property that validates any schema type contains its required properties.

2. **Consolidating validation properties**: Properties 1.11, 2.9, 4.1, and 12.5 all test validation against specifications. These can be combined into a universal validation property.

3. **Merging round-trip properties**: Properties 12.4, 12.6, and 12.7 all test round-trip parsing/formatting. These are subsumed by a single comprehensive round-trip property.

4. **Combining filtering properties**: Properties 3.11 and 7.8 both test filtering for published posts only. These can be combined into a single property.

5. **Consolidating URL formatting properties**: Properties 2.3, 3.12, 4.2, and 7.10 all test URL formatting. These can be combined into a single property about URL normalization.

6. **Merging caching properties**: Properties 9.8, 10.3, 10.4, and 10.5 all test caching behavior with different TTLs. These can be combined into a single property about cache behavior.

### Property 1: Schema Generation Completeness

*For any* content type (blog post, author, topic hub, FAQ, HowTo) and its corresponding schema type, the Structured_Data_Generator SHALL generate a schema object that contains all required properties defined by Schema.org for that type.

**Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.6, 1.7, 1.8, 1.9, 1.10**

### Property 2: Schema Validation

*For any* generated structured data schema, the schema SHALL pass validation against Schema.org specifications and produce valid JSON-LD format.

**Validates: Requirements 1.11, 2.9, 12.5**

### Property 3: Special Character Escaping

*For any* content containing special characters (quotes, newlines, HTML entities, Unicode), the generated structured data and metadata SHALL properly escape these characters to produce valid JSON-LD and HTML attributes.

**Validates: Requirements 1.12, 2.9**

### Property 4: Metadata Completeness

*For any* blog post, the Metadata_Manager SHALL generate complete Open Graph and Twitter Card metadata with all required properties.

**Validates: Requirements 2.1, 2.2, 2.7, 2.8**

### Property 5: Meta Description Truncation

*For any* input text, the Metadata_Manager SHALL generate a meta description between 150-160 characters that preserves word boundaries and adds ellipsis if truncated.

**Validates: Requirement 2.6**

### Property 6: URL Normalization

*For any* page path or URL input, the system SHALL normalize it to an absolute HTTPS URL with consistent formatting (no trailing slashes, proper encoding).

**Validates: Requirements 2.3, 3.12, 4.2, 7.10**

### Property 7: Sitemap Structure Validity

*For any* collection of pages, the Sitemap_Generator SHALL produce XML sitemaps that conform to the Sitemap 0.9 protocol with valid structure, required elements, and proper formatting.

**Validates: Requirements 3.1, 3.2, 3.3, 4.1**

### Property 8: Sitemap Filtering

*For any* collection of posts with varying statuses, the Sitemap_Generator and Internal_Linking_Engine SHALL include only posts with status "published" in sitemaps and related post suggestions.

**Validates: Requirements 3.11, 7.8**

### Property 9: Sitemap Pagination

*For any* collection of URLs, when the count exceeds 50,000 or size exceeds 50MB, the Sitemap_Generator SHALL split the sitemap into multiple files and create a sitemap index.

**Validates: Requirements 3.4, 3.10, 4.7, 4.8**

### Property 10: Date Selection Priority

*For any* post with updatedAt, publishedAt, and createdAt dates, the Sitemap_Generator SHALL select lastmod in priority order: updatedAt > publishedAt > createdAt.

**Validates: Requirement 3.9**

### Property 11: Changefreq and Priority Assignment

*For any* page of a specific type (homepage, blog post, topic hub, author page, static page), the Sitemap_Generator SHALL assign the correct changefreq and priority values according to the specification.

**Validates: Requirements 3.5, 3.6, 3.7, 3.8**

### Property 12: News Sitemap Date Filtering

*For any* collection of posts with varying publication dates, the Sitemap_Generator SHALL include only posts published within the last 2 days in the news sitemap.

**Validates: Requirements 3.2, 4.9**

### Property 13: Validation Error Reporting

*For any* invalid sitemap (wrong date format, invalid changefreq, out-of-range priority, non-HTTPS URLs), the Sitemap_Validator SHALL return a detailed error report specifying the violation type and location.

**Validates: Requirements 4.4, 4.5, 4.6, 4.11**

### Property 14: Rate Limiting

*For any* sequence of API requests to Google Search Console, the Search_Console_Submitter SHALL enforce a rate limit of 200 requests per day and reject requests exceeding this limit.

**Validates: Requirement 5.10**

### Property 15: Related Posts Relevance Sorting

*For any* blog post and collection of candidate posts, the Internal_Linking_Engine SHALL return related posts sorted by relevance score in descending order, with the current post excluded.

**Validates: Requirements 7.6, 7.7**

### Property 16: Related Posts Limit

*For any* blog post, the Internal_Linking_Engine SHALL return at most 5 related posts and at most 3 relevant topic hubs.

**Validates: Requirements 7.1, 7.2**

### Property 17: Anchor Text Descriptiveness

*For any* internal link, the Internal_Linking_Engine SHALL generate anchor text that is descriptive (contains meaningful keywords from the target page) and not generic (not "click here", "read more", etc.).

**Validates: Requirement 7.9**

### Property 18: JSON-LD Minification

*For any* structured data schema, the minification process SHALL remove all unnecessary whitespace while preserving the semantic meaning and producing valid JSON-LD.

**Validates: Requirement 10.1**

### Property 19: Gzip Compression Round-Trip

*For any* sitemap XML content, compressing with gzip and then decompressing SHALL produce content equivalent to the original.

**Validates: Requirement 10.2**

### Property 20: Cache Behavior

*For any* SEO asset (structured data, metadata, sitemap, internal links) with a specified TTL, the system SHALL return cached data for requests within the TTL period and regenerate data for requests after the TTL expires.

**Validates: Requirements 9.8, 10.3, 10.4, 10.5**

### Property 21: Cache Invalidation

*For any* cached SEO data, when the underlying content is published or updated, the system SHALL invalidate the cache and regenerate the data on the next request.

**Validates: Requirement 10.10**

### Property 22: Image Attribute Presence

*For any* image rendered on a page, the system SHALL include width and height attributes to prevent layout shift.

**Validates: Requirement 11.2**

### Property 23: Schema Parser Round-Trip

*For any* valid Schema object, the sequence parse(format(parse(jsonLd))) SHALL produce a Schema object equivalent to parse(jsonLd), preserving nested object hierarchy and array order.

**Validates: Requirements 12.4, 12.6, 12.7**

### Property 24: Parser Error Reporting

*For any* invalid JSON-LD string, the parser SHALL return a descriptive error with line number and column position indicating where the syntax error occurred.

**Validates: Requirement 12.2**

### Property 25: Schema Type Support

*For any* of the 10 defined Schema_Types (BlogPosting, Article, Person, Breadcrumb, WebSite, CollectionPage, FAQPage, HowTo, ImageObject, Organization), the Structured_Data_Generator SHALL successfully parse and format schemas of that type.

**Validates: Requirement 12.8**


## Error Handling

### Error Handling Strategy

The SEO system implements a multi-layered error handling approach to ensure graceful degradation and maintain page functionality even when SEO features fail.

### Error Categories

1. **Validation Errors**: Schema validation failures, sitemap validation failures
2. **External API Errors**: Google Search Console API failures, Bing Webmaster API failures, Rich Results Test API failures
3. **Data Errors**: Missing required fields, invalid data formats, database query failures
4. **Performance Errors**: Timeout errors, rate limit exceeded errors
5. **Network Errors**: HTTP request failures, DNS resolution failures

### Error Handling Patterns

#### 1. Structured Data Generation Errors

**Strategy**: Fail gracefully, log errors, render page without structured data

\`\`\`typescript
try {
  const schema = generateBlogPosting(post);
  validateSchema(schema);
  return schema;
} catch (error) {
  logger.error('Structured data generation failed', {
    postId: post._id,
    error: error.message,
    stack: error.stack
  });
  // Return null, page renders without structured data
  return null;
}
\`\`\`

**Fallback**: Page renders successfully without structured data. User experience is not impacted.

#### 2. Metadata Generation Errors

**Strategy**: Use default values, log warnings

\`\`\`typescript
try {
  const metadata = generateMetadata(post);
  return metadata;
} catch (error) {
  logger.warn('Metadata generation failed, using defaults', {
    postId: post._id,
    error: error.message
  });
  return {
    title: post.title || 'AITechWorldHub',
    description: post.excerpt || 'Latest AI news and insights',
    image: DEFAULT_OG_IMAGE,
    url: `${SITE_URL}/posts/${post.slug}`
  };
}
\`\`\`

**Fallback**: Use default metadata values to ensure social sharing still works.

#### 3. Sitemap Generation Errors

**Strategy**: Return cached sitemap if available, otherwise return minimal sitemap

\`\`\`typescript
try {
  const sitemap = await generateSitemap();
  await validateSitemap(sitemap);
  await cacheSitemap(sitemap);
  return sitemap;
} catch (error) {
  logger.error('Sitemap generation failed', { error: error.message });
  
  // Try to return cached sitemap
  const cached = await getCachedSitemap();
  if (cached) {
    logger.info('Returning cached sitemap due to generation failure');
    return cached;
  }
  
  // Return minimal sitemap with just homepage
  return generateMinimalSitemap();
}
\`\`\`

**Fallback**: Serve cached sitemap or minimal sitemap with essential pages only.

#### 4. Sitemap Validation Errors

**Strategy**: Log detailed errors, allow submission with warnings

\`\`\`typescript
const validationResult = await validateSitemap(xml);

if (validationResult.errors.length > 0) {
  logger.error('Sitemap validation failed', {
    errors: validationResult.errors,
    stats: validationResult.stats
  });
  throw new ValidationError('Sitemap contains errors', validationResult.errors);
}

if (validationResult.warnings.length > 0) {
  logger.warn('Sitemap validation warnings', {
    warnings: validationResult.warnings
  });
  // Continue with submission despite warnings
}
\`\`\`

**Fallback**: Block submission on errors, allow submission with warnings.

#### 5. Search Console Submission Errors

**Strategy**: Retry with exponential backoff, log failures, send alerts

\`\`\`typescript
async function submitWithRetry(sitemapUrl: string, maxAttempts = 3) {
  let attempt = 0;
  const delays = [60000, 300000, 900000]; // 1min, 5min, 15min
  
  while (attempt < maxAttempts) {
    try {
      const result = await submitToGoogle(sitemapUrl);
      logger.info('Sitemap submitted successfully', { sitemapUrl, attempt });
      return result;
    } catch (error) {
      attempt++;
      logger.error('Sitemap submission failed', {
        sitemapUrl,
        attempt,
        error: error.message
      });
      
      if (attempt < maxAttempts) {
        await sleep(delays[attempt - 1]);
      } else {
        // All retries failed, send alert
        await sendAlert({
          type: 'sitemap_submission_failed',
          sitemapUrl,
          error: error.message
        });
        throw error;
      }
    }
  }
}
\`\`\`

**Fallback**: Retry up to 3 times, then alert admin. Sitemap is still accessible at URL for manual submission.

#### 6. External API Timeout Errors

**Strategy**: Set timeouts, handle gracefully

\`\`\`typescript
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 30000); // 30 second timeout

try {
  const response = await fetch(apiUrl, {
    signal: controller.signal,
    headers: { Authorization: `Bearer ${token}` }
  });
  clearTimeout(timeout);
  return await response.json();
} catch (error) {
  clearTimeout(timeout);
  
  if (error.name === 'AbortError') {
    logger.error('API request timed out', { apiUrl });
    throw new TimeoutError('Request exceeded 30 second timeout');
  }
  
  throw error;
}
\`\`\`

**Fallback**: Treat timeout as failure, trigger retry logic or return cached data.

#### 7. Rate Limit Errors

**Strategy**: Track request counts, reject requests exceeding limits

\`\`\`typescript
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  
  async checkLimit(key: string, limit: number, windowMs: number): Promise<boolean> {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    
    // Remove requests outside the window
    const validRequests = requests.filter(time => now - time < windowMs);
    
    if (validRequests.length >= limit) {
      logger.warn('Rate limit exceeded', { key, limit, windowMs });
      return false;
    }
    
    validRequests.push(now);
    this.requests.set(key, validRequests);
    return true;
  }
}

// Usage
const canSubmit = await rateLimiter.checkLimit('google-indexing-api', 200, 86400000); // 200/day
if (!canSubmit) {
  throw new RateLimitError('Daily quota exceeded for Google Indexing API');
}
\`\`\`

**Fallback**: Queue requests for next day, alert admin if quota is consistently exceeded.

#### 8. Cache Errors

**Strategy**: Regenerate data if cache fails

\`\`\`typescript
async function getCachedOrGenerate<T>(
  key: string,
  generator: () => Promise<T>,
  ttl: number
): Promise<T> {
  try {
    const cached = await cache.get(key);
    if (cached) {
      return cached as T;
    }
  } catch (error) {
    logger.warn('Cache retrieval failed', { key, error: error.message });
    // Continue to generation
  }
  
  const data = await generator();
  
  try {
    await cache.set(key, data, ttl);
  } catch (error) {
    logger.warn('Cache storage failed', { key, error: error.message });
    // Data is still returned, just not cached
  }
  
  return data;
}
\`\`\`

**Fallback**: If cache fails, regenerate data on every request. Performance impact but functionality maintained.

### Error Logging

All errors are logged with structured data for debugging:

\`\`\`typescript
interface ErrorLog {
  timestamp: Date;
  level: 'error' | 'warn' | 'info';
  component: string;
  message: string;
  context: Record<string, unknown>;
  stack?: string;
}

// Example
logger.error('Structured data validation failed', {
  component: 'StructuredDataGenerator',
  postId: post._id,
  schemaType: 'BlogPosting',
  validationErrors: errors,
  stack: error.stack
});
\`\`\`

### Error Monitoring

- **Sentry Integration**: Capture and track errors in production
- **Alert Thresholds**: Send alerts when error rates exceed thresholds
- **Dashboard**: Display error metrics in admin dashboard
- **Weekly Reports**: Include error summary in weekly SEO reports

## Testing Strategy

### Testing Approach

The SEO improvement feature requires a dual testing approach combining property-based testing for core logic and integration testing for external services.

### 1. Property-Based Testing

**Purpose**: Verify universal properties hold across all valid inputs

**Framework**: `fast-check` for TypeScript/JavaScript

**Configuration**:
- Minimum 100 iterations per property test
- Each test tagged with feature name and property number
- Tag format: `Feature: seo-improvement, Property {number}: {property_text}`

**Property Tests to Implement**:

#### Schema Generation Tests

\`\`\`typescript
import fc from 'fast-check';

describe('Property 1: Schema Generation Completeness', () => {
  it('generates complete BlogPosting schema for any post', () => {
    fc.assert(
      fc.property(
        arbitraryPublishedPost(),
        (post) => {
          const schema = generateBlogPosting(post);
          
          // Verify all required properties are present
          expect(schema).toHaveProperty('@context', 'https://schema.org');
          expect(schema).toHaveProperty('@type', 'BlogPosting');
          expect(schema).toHaveProperty('headline');
          expect(schema).toHaveProperty('description');
          expect(schema).toHaveProperty('author');
          expect(schema).toHaveProperty('publisher');
          expect(schema).toHaveProperty('mainEntityOfPage');
          expect(schema).toHaveProperty('isAccessibleForFree', true);
        }
      ),
      { numRuns: 100 }
    );
  });
  
  // Tag: Feature: seo-improvement, Property 1: Schema Generation Completeness
});
\`\`\`

#### Validation Tests

\`\`\`typescript
describe('Property 2: Schema Validation', () => {
  it('validates any generated schema against Schema.org', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          arbitraryBlogPostingSchema(),
          arbitraryPersonSchema(),
          arbitraryBreadcrumbSchema()
        ),
        (schema) => {
          const result = validateSchema(schema);
          expect(result.valid).toBe(true);
          expect(result.errors).toHaveLength(0);
        }
      ),
      { numRuns: 100 }
    );
  });
  
  // Tag: Feature: seo-improvement, Property 2: Schema Validation
});
\`\`\`

#### Parser Round-Trip Tests

\`\`\`typescript
describe('Property 23: Schema Parser Round-Trip', () => {
  it('preserves schema through parse-format-parse cycle', () => {
    fc.assert(
      fc.property(
        arbitrarySchemaObject(),
        (schema) => {
          const jsonLd = formatJsonLd(schema);
          const parsed1 = parseJsonLd(jsonLd);
          const formatted = formatJsonLd(parsed1);
          const parsed2 = parseJsonLd(formatted);
          
          expect(parsed2).toEqual(parsed1);
        }
      ),
      { numRuns: 100 }
    );
  });
  
  // Tag: Feature: seo-improvement, Property 23: Schema Parser Round-Trip
});
\`\`\`

#### Sitemap Generation Tests

\`\`\`typescript
describe('Property 7: Sitemap Structure Validity', () => {
  it('generates valid XML sitemap for any page collection', () => {
    fc.assert(
      fc.property(
        fc.array(arbitraryPage(), { minLength: 1, maxLength: 1000 }),
        async (pages) => {
          const sitemap = await generateMainSitemap(pages);
          const validation = await validateSitemap(sitemap);
          
          expect(validation.valid).toBe(true);
          expect(validation.errors).toHaveLength(0);
        }
      ),
      { numRuns: 100 }
    );
  });
  
  // Tag: Feature: seo-improvement, Property 7: Sitemap Structure Validity
});
\`\`\`

### 2. Unit Testing

**Purpose**: Test specific examples, edge cases, and error conditions

**Framework**: Jest

**Unit Tests to Implement**:

#### Metadata Generation

\`\`\`typescript
describe('MetadataManager', () => {
  it('generates Open Graph tags for a blog post', () => {
    const post = createMockPost({
      title: 'Test Post',
      excerpt: 'Test excerpt',
      imageUrl: 'https://example.com/image.jpg'
    });
    
    const og = generateOpenGraph(post);
    
    expect(og['og:title']).toBe('Test Post');
    expect(og['og:description']).toBe('Test excerpt');
    expect(og['og:image']).toBe('https://example.com/image.jpg');
    expect(og['og:type']).toBe('article');
  });
  
  it('truncates long descriptions to 150-160 characters', () => {
    const longText = 'a'.repeat(200);
    const description = generateMetaDescription(longText);
    
    expect(description.length).toBeGreaterThanOrEqual(150);
    expect(description.length).toBeLessThanOrEqual(160);
    expect(description).toMatch(/\.\.\.$/); // ends with ellipsis
  });
  
  it('handles missing image gracefully', () => {
    const post = createMockPost({ imageUrl: undefined });
    const og = generateOpenGraph(post);
    
    expect(og['og:image']).toBe(DEFAULT_OG_IMAGE);
  });
});
\`\`\`

#### Robots.txt Generation

\`\`\`typescript
describe('RobotsManager', () => {
  it('generates robots.txt with required rules', () => {
    const robotsTxt = generateRobotsTxt();
    
    expect(robotsTxt).toContain('User-agent: *');
    expect(robotsTxt).toContain('Allow: /');
    expect(robotsTxt).toContain('Disallow: /admin/');
    expect(robotsTxt).toContain('Disallow: /api/');
    expect(robotsTxt).toContain('Disallow: /_next/');
    expect(robotsTxt).toContain('Sitemap: https://aitechworldhub.com/sitemap.xml');
  });
  
  it('sets crawl-delay for all agents except Googlebot', () => {
    const robotsTxt = generateRobotsTxt();
    
    expect(robotsTxt).toContain('Crawl-delay: 1');
    expect(robotsTxt).toContain('User-agent: Googlebot');
    expect(robotsTxt).not.toContain('User-agent: Googlebot\nCrawl-delay');
  });
});
\`\`\`

### 3. Integration Testing

**Purpose**: Test external API integrations, database operations, and end-to-end flows

**Framework**: Jest with mocked external services

**Integration Tests to Implement**:

#### Search Console Submission

\`\`\`typescript
describe('SearchConsoleSubmitter Integration', () => {
  let mockGoogleApi: jest.Mocked<GoogleIndexingAPI>;
  
  beforeEach(() => {
    mockGoogleApi = createMockGoogleApi();
  });
  
  it('submits sitemap to Google Search Console', async () => {
    mockGoogleApi.submitSitemap.mockResolvedValue({ success: true });
    
    const result = await submitToGoogle('https://example.com/sitemap.xml');
    
    expect(result.success).toBe(true);
    expect(mockGoogleApi.submitSitemap).toHaveBeenCalledWith(
      'https://example.com/sitemap.xml'
    );
  });
  
  it('retries on failure with exponential backoff', async () => {
    mockGoogleApi.submitSitemap
      .mockRejectedValueOnce(new Error('Network error'))
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({ success: true });
    
    const result = await submitWithRetry('https://example.com/sitemap.xml');
    
    expect(result.success).toBe(true);
    expect(mockGoogleApi.submitSitemap).toHaveBeenCalledTimes(3);
  });
  
  it('sends alert after all retries fail', async () => {
    mockGoogleApi.submitSitemap.mockRejectedValue(new Error('Network error'));
    const mockAlert = jest.fn();
    
    await expect(
      submitWithRetry('https://example.com/sitemap.xml', mockAlert)
    ).rejects.toThrow('Network error');
    
    expect(mockAlert).toHaveBeenCalledWith({
      type: 'sitemap_submission_failed',
      sitemapUrl: 'https://example.com/sitemap.xml',
      error: 'Network error'
    });
  });
});
\`\`\`

#### SEO Monitoring

\`\`\`typescript
describe('SEOMonitoringService Integration', () => {
  it('fetches and stores Search Console data', async () => {
    const mockData = {
      impressions: 1500,
      clicks: 75,
      ctr: 0.05,
      averagePosition: 12.5
    };
    
    mockSearchConsoleApi.query.mockResolvedValue(mockData);
    
    await fetchSearchConsoleData();
    
    const stored = await db.collection('seo_metrics').findOne({
      date: { $gte: startOfDay(new Date()) }
    });
    
    expect(stored.searchConsole).toEqual(mockData);
  });
  
  it('calculates indexing rate correctly', async () => {
    const totalPages = 100;
    const indexedPages = 85;
    
    mockSearchConsoleApi.getIndexStatus.mockResolvedValue({ indexedPages });
    jest.spyOn(db, 'countPublishedPages').mockResolvedValue(totalPages);
    
    const rate = await calculateIndexingRate();
    
    expect(rate.totalPages).toBe(100);
    expect(rate.indexedPages).toBe(85);
    expect(rate.rate).toBe(85);
  });
});
\`\`\`

### 4. End-to-End Testing

**Purpose**: Test complete user flows and page rendering

**Framework**: Playwright

**E2E Tests to Implement**:

\`\`\`typescript
describe('SEO Features E2E', () => {
  it('renders blog post with complete structured data', async ({ page }) => {
    await page.goto('/posts/test-post');
    
    // Check structured data is present
    const jsonLd = await page.locator('script[type="application/ld+json"]').allTextContents();
    expect(jsonLd.length).toBeGreaterThan(0);
    
    const blogPosting = JSON.parse(jsonLd.find(s => s.includes('BlogPosting')));
    expect(blogPosting['@type']).toBe('BlogPosting');
    expect(blogPosting.headline).toBeTruthy();
    expect(blogPosting.author).toBeTruthy();
  });
  
  it('renders Open Graph meta tags', async ({ page }) => {
    await page.goto('/posts/test-post');
    
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
    const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content');
    
    expect(ogTitle).toBeTruthy();
    expect(ogImage).toMatch(/^https:\/\//);
  });
  
  it('generates accessible sitemap', async ({ page }) => {
    const response = await page.goto('/sitemap.xml');
    
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('xml');
    
    const xml = await response.text();
    expect(xml).toContain('<urlset');
    expect(xml).toContain('<url>');
    expect(xml).toContain('<loc>');
  });
});
\`\`\`

### 5. Performance Testing

**Purpose**: Verify performance requirements are met

**Framework**: Jest with performance measurements

\`\`\`typescript
describe('Performance Requirements', () => {
  it('generates structured data within 100ms', async () => {
    const post = createMockPost();
    
    const start = performance.now();
    await generateAllSchemas(post);
    const duration = performance.now() - start;
    
    expect(duration).toBeLessThan(100);
  });
  
  it('validates sitemap within 30 seconds for 10,000 URLs', async () => {
    const sitemap = await generateLargeSitemap(10000);
    
    const start = performance.now();
    await validateSitemap(sitemap);
    const duration = performance.now() - start;
    
    expect(duration).toBeLessThan(30000);
  });
  
  it('parses schema within 50ms for 10KB JSON-LD', async () => {
    const largeSchema = generateLargeSchema(10 * 1024); // 10KB
    
    const start = performance.now();
    parseJsonLd(largeSchema);
    const duration = performance.now() - start;
    
    expect(duration).toBeLessThan(50);
  });
});
\`\`\`

### Test Coverage Goals

- **Unit Tests**: 90%+ code coverage
- **Property Tests**: All 25 correctness properties implemented
- **Integration Tests**: All external API integrations covered
- **E2E Tests**: Critical user flows covered
- **Performance Tests**: All performance requirements verified

### Continuous Integration

- Run unit tests and property tests on every commit
- Run integration tests on pull requests
- Run E2E tests before deployment
- Run performance tests weekly
- Generate coverage reports and track trends

