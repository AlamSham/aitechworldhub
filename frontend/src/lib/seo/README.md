# SEO Infrastructure

This directory contains the core SEO infrastructure for the AITechWorldHub blog platform.

## Overview

The SEO infrastructure provides comprehensive search engine optimization features including:

- **Structured Data Generation**: JSON-LD schema markup for 10 schema types (✅ Implemented)
- **Metadata Management**: Open Graph, Twitter Cards, and canonical URLs
- **Sitemap Generation**: Main, news, image, and index sitemaps
- **Validation**: Schema and sitemap validation against specifications (✅ Implemented)
- **Internal Linking**: Intelligent related post suggestions
- **Search Console Integration**: Automatic sitemap submission
- **Performance Optimization**: Caching and lazy loading

## Structured Data Generators (Task 2 - Completed)

The structured data generator provides JSON-LD schema markup for 10 schema types to enable rich snippets and improved search visibility.

### Supported Schema Types

1. **BlogPosting** - Blog post articles with author, publisher, dates
2. **Article** - News-style content (alternative to BlogPosting)
3. **Person** - Author pages with expertise and social links
4. **BreadcrumbList** - Navigation breadcrumbs
5. **WebSite** - Homepage with search action
6. **CollectionPage** - Topic hub pages with related posts
7. **FAQPage** - FAQ content for FAQ rich results
8. **HowTo** - How-to guides for HowTo rich results
9. **ImageObject** - Images with captions and dimensions
10. **Organization** - Publisher information

### Quick Start

```typescript
import {
  generateBlogPosting,
  generatePerson,
  generateBreadcrumb,
  validateSchema,
  minifyJsonLd,
} from '@/lib/seo';

// Generate BlogPosting schema for a blog post
const schema = generateBlogPosting({
  _id: '123',
  title: 'Understanding Neural Networks',
  slug: 'understanding-neural-networks',
  excerpt: 'Learn the fundamentals of neural networks...',
  content: 'Full content...',
  imageUrl: '/images/neural-networks.jpg',
  publishedAt: new Date('2024-01-15'),
  author: {
    name: 'Dr. Sarah Johnson',
    slug: 'sarah-johnson',
    bio: 'AI researcher',
  },
  category: 'Machine Learning',
  tags: ['Neural Networks', 'Deep Learning'],
  wordCount: 2500,
});

// Validate the schema
const validation = validateSchema(schema);
if (!validation.valid) {
  console.error('Schema errors:', validation.errors);
}

// Minify for production
const jsonLd = minifyJsonLd(schema);
```

### Next.js Integration

```tsx
import { generateBlogPosting, minifyJsonLd } from '@/lib/seo';

export default function BlogPostPage({ post }) {
  const schema = generateBlogPosting(post);
  const jsonLd = minifyJsonLd(schema);
  
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />
      <article>
        <h1>{post.title}</h1>
        <p>{post.excerpt}</p>
        {/* Rest of the content */}
      </article>
    </>
  );
}
```

### Schema Generator API

#### `generateBlogPosting(post: PublishedPost): BlogPostingSchema`

Generates BlogPosting schema for blog post pages.

**Required fields:**
- `title` - Post title (becomes headline)
- `excerpt` - Post excerpt (becomes description)
- `author.name` - Author name

**Optional fields:**
- `imageUrl` - Featured image URL
- `publishedAt` - Publication date
- `updatedAt` - Last modified date
- `category` - Article section
- `tags` - Keywords array
- `wordCount` - Word count

#### `generateArticle(post: PublishedPost): ArticleSchema`

Generates Article schema (alternative to BlogPosting for news content).

#### `generatePerson(author: Author): PersonSchema`

Generates Person schema for author pages.

#### `generateBreadcrumb(items: Array<{name: string, path: string}>): BreadcrumbListSchema`

Generates BreadcrumbList schema for navigation.

#### `generateWebSite(): WebSiteSchema`

Generates WebSite schema for homepage with search action.

#### `generateCollectionPage(hub: TopicHub): CollectionPageSchema`

Generates CollectionPage schema for topic hub pages.

#### `generateFAQPage(faqs: Array<{question: string, answer: string}>): FAQPageSchema`

Generates FAQPage schema for FAQ content.

#### `generateHowTo(data: HowToData): HowToSchema`

Generates HowTo schema for how-to guides.

#### `generateImageObject(image: ImageData): ImageObjectSchema`

Generates ImageObject schema for images.

#### `generateOrganization(): OrganizationSchema`

Generates Organization schema for publisher information.

### Schema Validation

```typescript
import { validateSchema } from '@/lib/seo';

const validation = validateSchema(schema);

// Check validation result
if (validation.valid) {
  console.log('Schema is valid!');
} else {
  console.error('Validation errors:', validation.errors);
  console.warn('Validation warnings:', validation.warnings);
}

// Validation result structure
interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];    // Missing required properties, invalid types
  warnings: ValidationWarning[]; // Missing recommended properties
}
```

### Examples

See `examples/structured-data-examples.ts` for comprehensive examples of all schema types including:

- Blog post with BlogPosting schema
- Author page with Person schema
- Topic hub with CollectionPage schema
- FAQ section with FAQPage schema
- How-to guide with HowTo schema
- Complete page with multiple schemas

## Overview

## Directory Structure

```
frontend/src/lib/seo/
├── index.ts                    # Module entry point with all exports
├── utils.ts                    # Base utility functions
├── structured-data.ts          # Structured data (JSON-LD) generators
├── README.md                   # This file
├── examples/                   # Usage examples
│   └── structured-data-examples.ts
└── __tests__/                  # Unit tests
    ├── utils.test.ts           # Tests for utility functions
    └── structured-data.test.ts # Tests for structured data generators
```

## Configuration

SEO configuration is centralized in `frontend/src/lib/seo-config.ts`:

```typescript
import { SEO_CONFIG } from '@/lib/seo-config';

// Access configuration
console.log(SEO_CONFIG.siteName);
console.log(SEO_CONFIG.sitemap.maxUrlsPerFile);
console.log(SEO_CONFIG.cache.structuredDataTTL);
```

## Type Definitions

All SEO-related types are defined in `frontend/src/types/seo.ts`:

```typescript
import type {
  BlogPostingSchema,
  OpenGraphMetadata,
  SitemapEntry,
  ValidationResult,
} from '@/types/seo';
```

## Utility Functions

### URL Utilities

```typescript
import { normalizeUrl, isHttpsUrl } from '@/lib/seo';

// Normalize URLs to absolute HTTPS format
const url = normalizeUrl('/posts/my-post'); // 'https://aitechworldhub.com/posts/my-post'

// Check if URL is HTTPS
const isSecure = isHttpsUrl('https://example.com'); // true
```

### Date Utilities

```typescript
import { formatDateISO, selectMostRecentDate } from '@/lib/seo';

// Format dates for sitemaps
const date = formatDateISO(new Date()); // '2024-01-15'

// Select most recent date (updatedAt > publishedAt > createdAt)
const lastmod = selectMostRecentDate({
  updatedAt: post.updatedAt,
  publishedAt: post.publishedAt,
  createdAt: post.createdAt,
});
```

### String Utilities

```typescript
import { escapeJsonLd, generateMetaDescription } from '@/lib/seo';

// Escape special characters for JSON-LD
const safe = escapeJsonLd('Hello "World"'); // 'Hello \\"World\\"'

// Generate meta description (150-160 chars, word boundaries preserved)
const description = generateMetaDescription(post.content);
```

### Validation Utilities

```typescript
import { isValidPriority, isValidChangefreq, isValidISODate } from '@/lib/seo';

// Validate sitemap values
const validPriority = isValidPriority(0.8); // true
const validChangefreq = isValidChangefreq('weekly'); // true
const validDate = isValidISODate('2024-01-15'); // true
```

### JSON-LD Utilities

```typescript
import { minifyJsonLd, formatJsonLd, parseJsonLd } from '@/lib/seo';

// Minify JSON-LD for production
const minified = minifyJsonLd(schema); // Removes whitespace

// Format JSON-LD for debugging
const formatted = formatJsonLd(schema); // Pretty-printed with indentation

// Parse JSON-LD string
const result = parseJsonLd(jsonLdString);
if (result.success) {
  console.log(result.data);
} else {
  console.error(`Parse error at line ${result.line}, column ${result.column}`);
}
```

## Usage Examples

### Basic Setup

```typescript
import { SEO_CONFIG, normalizeUrl, generateMetaDescription } from '@/lib/seo';
import type { BlogPostingSchema } from '@/types/seo';

// Generate canonical URL
const canonicalUrl = normalizeUrl(`/posts/${post.slug}`);

// Generate meta description
const description = generateMetaDescription(post.content);
```

### Structured Data Generation

```typescript
import { escapeJsonLd, minifyJsonLd } from '@/lib/seo';
import type { BlogPostingSchema } from '@/types/seo';

const schema: BlogPostingSchema = {
  '@context': 'https://schema.org',
  '@type': 'BlogPosting',
  headline: escapeJsonLd(post.title),
  description: escapeJsonLd(post.excerpt),
  // ... other properties
};

// Minify for production
const jsonLd = minifyJsonLd(schema);
```

### Sitemap Entry Generation

```typescript
import { normalizeUrl, formatDateISO, selectMostRecentDate } from '@/lib/seo';
import { SEO_CONFIG } from '@/lib/seo-config';
import type { SitemapEntry } from '@/types/seo';

const entry: SitemapEntry = {
  url: normalizeUrl(`/posts/${post.slug}`),
  lastmod: formatDateISO(selectMostRecentDate(post)),
  changefreq: SEO_CONFIG.sitemap.changefreqDefaults.posts,
  priority: SEO_CONFIG.sitemap.priorityDefaults.posts,
};
```

## Performance Considerations

### Caching

All SEO operations support caching with configurable TTLs:

- Structured data: 1 hour (3600s)
- Metadata: 1 hour (3600s)
- Sitemaps: 5 minutes (300s)
- Related posts: 30 minutes (1800s)

### Performance Thresholds

The system enforces performance thresholds:

- Schema generation: < 100ms
- Sitemap validation: < 30s for 10,000 URLs
- JSON-LD parsing: < 50ms for 10KB

Use `measureExecutionTime` to verify:

```typescript
import { measureExecutionTime, isWithinPerformanceThreshold } from '@/lib/seo';
import { SEO_CONFIG } from '@/lib/seo-config';

const [result, duration] = await measureExecutionTime(() => generateSchema(post));

if (!isWithinPerformanceThreshold(duration, SEO_CONFIG.performance.maxGenerationTime)) {
  console.warn(`Schema generation took ${duration}ms (threshold: ${SEO_CONFIG.performance.maxGenerationTime}ms)`);
}
```

## Error Handling

All utility functions include proper error handling:

```typescript
import { formatDateISO, parseJsonLd } from '@/lib/seo';

// Date formatting with error handling
try {
  const date = formatDateISO('invalid-date');
} catch (error) {
  console.error('Invalid date:', error.message);
}

// JSON-LD parsing with error reporting
const result = parseJsonLd(jsonLdString);
if (!result.success) {
  console.error(`Parse error at line ${result.line}, column ${result.column}: ${result.error}`);
}
```

## Testing

Unit tests are located in `__tests__/utils.test.ts`. Run tests with:

```bash
npm test
```

## Next Steps

This infrastructure provides the foundation for:

1. **Structured Data Generator** (Task 2): Generate JSON-LD schemas
2. **Metadata Manager** (Task 3): Generate Open Graph and Twitter Cards
3. **Sitemap Generator** (Task 5): Generate XML sitemaps
4. **Sitemap Validator** (Task 6): Validate sitemap structure
5. **Internal Linking Engine** (Task 9): Find related posts

## References

- [Schema.org Documentation](https://schema.org/)
- [Google Search Central](https://developers.google.com/search)
- [Open Graph Protocol](https://ogp.me/)
- [Twitter Cards](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)
- [Sitemap Protocol](https://www.sitemaps.org/protocol.html)
