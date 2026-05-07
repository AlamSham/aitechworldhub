/**
 * Structured Data Generator
 * 
 * Generates JSON-LD structured data for various schema types to enable
 * rich snippets and improved search engine visibility.
 * 
 * Supports 10 schema types:
 * - BlogPosting: Blog post articles
 * - Article: News-style content
 * - Person: Author pages
 * - BreadcrumbList: Navigation breadcrumbs
 * - WebSite: Homepage with search action
 * - CollectionPage: Topic hub pages
 * - FAQPage: FAQ content
 * - HowTo: How-to guides
 * - ImageObject: Images in posts
 * - Organization: Publisher information
 */

import { SEO_CONFIG } from '../seo-config';
import { escapeJsonLd, formatDateTimeISO, normalizeUrl } from './utils';
import type {
  BlogPostingSchema,
  ArticleSchema,
  PersonSchema,
  BreadcrumbListSchema,
  BreadcrumbItem,
  WebSiteSchema,
  CollectionPageSchema,
  FAQPageSchema,
  FAQItem,
  HowToSchema,
  HowToStep,
  ImageObjectSchema,
  OrganizationSchema,
  ValidationResult,
  ValidationError,
  ValidationWarning,
} from '../../types/seo';

// ============================================================================
// Type Definitions for Input Data
// ============================================================================

/**
 * Published post data structure
 */
export interface PublishedPost {
  _id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  imageUrl?: string;
  publishedAt?: Date | string;
  updatedAt?: Date | string;
  createdAt?: Date | string;
  author: {
    name: string;
    slug?: string;
    bio?: string;
    imageUrl?: string;
  };
  category?: string;
  tags?: string[];
  focusKeyword?: string;
  wordCount?: number;
}

/**
 * Author data structure
 */
export interface Author {
  name: string;
  slug: string;
  bio?: string;
  imageUrl?: string;
  jobTitle?: string;
  expertise?: string[];
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
}

/**
 * Topic hub data structure
 */
export interface TopicHub {
  title: string;
  slug: string;
  description: string;
  posts?: Array<{
    title: string;
    slug: string;
  }>;
}

/**
 * Image data structure
 */
export interface ImageData {
  url: string;
  caption?: string;
  width?: number;
  height?: number;
  format?: string;
}

// ============================================================================
// Schema Generators
// ============================================================================

/**
 * Generate BlogPosting schema for blog post pages
 * 
 * @param post - Published post data
 * @returns BlogPosting schema with all required properties
 * 
 * @example
 * const schema = generateBlogPosting(post);
 * // Returns complete BlogPosting schema with headline, author, publisher, etc.
 */
export function generateBlogPosting(post: PublishedPost): BlogPostingSchema {
  const postUrl = normalizeUrl(`/posts/${post.slug}`);
  const imageUrls = post.imageUrl ? [normalizeUrl(post.imageUrl)] : undefined;
  
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: escapeJsonLd(post.title),
    description: escapeJsonLd(post.excerpt),
    image: imageUrls,
    datePublished: post.publishedAt ? formatDateTimeISO(post.publishedAt) : undefined,
    dateModified: post.updatedAt ? formatDateTimeISO(post.updatedAt) : undefined,
    author: generatePerson({
      name: post.author.name,
      slug: post.author.slug || '',
      bio: post.author.bio,
      imageUrl: post.author.imageUrl,
    }),
    publisher: generateOrganization(),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': postUrl,
    },
    articleSection: post.category ? escapeJsonLd(post.category) : undefined,
    keywords: post.tags ? post.tags.map(tag => escapeJsonLd(tag)) : undefined,
    wordCount: post.wordCount,
    isAccessibleForFree: true,
  };
}

/**
 * Generate Article schema for news-style content
 * Alternative to BlogPosting for more formal articles
 * 
 * @param post - Published post data
 * @returns Article schema with all required properties
 */
export function generateArticle(post: PublishedPost): ArticleSchema {
  const postUrl = normalizeUrl(`/posts/${post.slug}`);
  const imageUrls = post.imageUrl ? [normalizeUrl(post.imageUrl)] : undefined;
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: escapeJsonLd(post.title),
    description: escapeJsonLd(post.excerpt),
    image: imageUrls,
    datePublished: post.publishedAt ? formatDateTimeISO(post.publishedAt) : undefined,
    dateModified: post.updatedAt ? formatDateTimeISO(post.updatedAt) : undefined,
    author: generatePerson({
      name: post.author.name,
      slug: post.author.slug || '',
      bio: post.author.bio,
      imageUrl: post.author.imageUrl,
    }),
    publisher: generateOrganization(),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': postUrl,
    },
    articleSection: post.category ? escapeJsonLd(post.category) : undefined,
    keywords: post.tags ? post.tags.map(tag => escapeJsonLd(tag)) : undefined,
    wordCount: post.wordCount,
    isAccessibleForFree: true,
  };
}

/**
 * Generate Person schema for author pages and author information
 * 
 * @param author - Author data
 * @returns Person schema with name, bio, expertise, and social links
 */
export function generatePerson(author: Author): PersonSchema {
  const authorUrl = author.slug ? normalizeUrl(`/authors/${author.slug}`) : undefined;
  const imageUrl = author.imageUrl ? normalizeUrl(author.imageUrl) : undefined;
  
  // Build sameAs array from social links
  const sameAs: string[] = [];
  if (author.socialLinks?.twitter) {
    sameAs.push(author.socialLinks.twitter);
  }
  if (author.socialLinks?.linkedin) {
    sameAs.push(author.socialLinks.linkedin);
  }
  if (author.socialLinks?.github) {
    sameAs.push(author.socialLinks.github);
  }
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: escapeJsonLd(author.name),
    url: authorUrl,
    jobTitle: author.jobTitle ? escapeJsonLd(author.jobTitle) : undefined,
    description: author.bio ? escapeJsonLd(author.bio) : undefined,
    knowsAbout: author.expertise ? author.expertise.map(e => escapeJsonLd(e)) : undefined,
    sameAs: sameAs.length > 0 ? sameAs : undefined,
    image: imageUrl,
  };
}

/**
 * Generate BreadcrumbList schema for navigation breadcrumbs
 * 
 * @param items - Array of breadcrumb items with name and path
 * @returns BreadcrumbList schema with itemListElement array
 * 
 * @example
 * const breadcrumbs = generateBreadcrumb([
 *   { name: 'Home', path: '/' },
 *   { name: 'Posts', path: '/posts' },
 *   { name: 'My Post', path: '/posts/my-post' }
 * ]);
 */
export function generateBreadcrumb(
  items: Array<{ name: string; path: string }>
): BreadcrumbListSchema {
  const itemListElement: BreadcrumbItem[] = items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: escapeJsonLd(item.name),
    item: normalizeUrl(item.path),
  }));
  
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement,
  };
}

/**
 * Generate WebSite schema for homepage with search action
 * Enables sitelinks search box in Google search results
 * 
 * @returns WebSite schema with search action
 */
export function generateWebSite(): WebSiteSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SEO_CONFIG.siteName,
    url: SEO_CONFIG.siteUrl,
    publisher: generateOrganization(),
    inLanguage: 'en-US',
    description: escapeJsonLd(SEO_CONFIG.defaultDescription),
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SEO_CONFIG.siteUrl}/posts?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Generate CollectionPage schema for topic hub pages
 * 
 * @param hub - Topic hub data
 * @returns CollectionPage schema with hasPart array of related posts
 */
export function generateCollectionPage(hub: TopicHub): CollectionPageSchema {
  const hubUrl = normalizeUrl(`/topics/${hub.slug}`);
  
  const hasPart = hub.posts?.map(post => ({
    '@type': 'BlogPosting' as const,
    headline: escapeJsonLd(post.title),
    url: normalizeUrl(`/posts/${post.slug}`),
  }));
  
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: escapeJsonLd(hub.title),
    description: escapeJsonLd(hub.description),
    url: hubUrl,
    hasPart,
  };
}

/**
 * Generate FAQPage schema for FAQ content
 * Enables FAQ rich results in search
 * 
 * @param faqs - Array of FAQ items with question and answer
 * @returns FAQPage schema with mainEntity array
 * 
 * @example
 * const schema = generateFAQPage([
 *   { question: 'What is AI?', answer: 'Artificial Intelligence is...' },
 *   { question: 'How does ML work?', answer: 'Machine Learning works by...' }
 * ]);
 */
export function generateFAQPage(
  faqs: Array<{ question: string; answer: string }>
): FAQPageSchema {
  const mainEntity: FAQItem[] = faqs.map(faq => ({
    '@type': 'Question',
    name: escapeJsonLd(faq.question),
    acceptedAnswer: {
      '@type': 'Answer',
      text: escapeJsonLd(faq.answer),
    },
  }));
  
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity,
  };
}

/**
 * Generate HowTo schema for how-to guides
 * Enables HowTo rich results in search
 * 
 * @param data - HowTo guide data with name, description, and steps
 * @returns HowTo schema with step array
 * 
 * @example
 * const schema = generateHowTo({
 *   name: 'How to Train a Neural Network',
 *   description: 'Step-by-step guide to training neural networks',
 *   steps: [
 *     { name: 'Prepare Data', text: 'Clean and normalize your dataset' },
 *     { name: 'Build Model', text: 'Define your neural network architecture' }
 *   ],
 *   totalTime: 'PT2H',
 *   tools: ['Python', 'TensorFlow']
 * });
 */
export function generateHowTo(data: {
  name: string;
  description: string;
  steps: Array<{
    name: string;
    text: string;
    url?: string;
    image?: string;
  }>;
  totalTime?: string;
  tools?: string[];
  supplies?: string[];
}): HowToSchema {
  const step: HowToStep[] = data.steps.map(s => ({
    '@type': 'HowToStep',
    name: escapeJsonLd(s.name),
    text: escapeJsonLd(s.text),
    url: s.url ? normalizeUrl(s.url) : undefined,
    image: s.image ? normalizeUrl(s.image) : undefined,
  }));
  
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: escapeJsonLd(data.name),
    description: escapeJsonLd(data.description),
    step,
    totalTime: data.totalTime,
    tool: data.tools ? data.tools.map(t => escapeJsonLd(t)) : undefined,
    supply: data.supplies ? data.supplies.map(s => escapeJsonLd(s)) : undefined,
  };
}

/**
 * Generate ImageObject schema for images in blog posts
 * Improves image search visibility
 * 
 * @param image - Image data with URL, caption, dimensions, and format
 * @returns ImageObject schema
 */
export function generateImageObject(image: ImageData): ImageObjectSchema {
  const imageUrl = normalizeUrl(image.url);
  
  return {
    '@context': 'https://schema.org',
    '@type': 'ImageObject',
    contentUrl: imageUrl,
    url: imageUrl,
    caption: image.caption ? escapeJsonLd(image.caption) : undefined,
    width: image.width,
    height: image.height,
    encodingFormat: image.format,
  };
}

/**
 * Generate Organization schema for publisher information
 * Used across all pages to identify the publisher
 * 
 * @returns Organization schema with name, logo, and social profiles
 */
export function generateOrganization(): OrganizationSchema {
  const logoUrl = normalizeUrl(SEO_CONFIG.organization.logo);
  
  // Build sameAs array from social profiles
  const sameAs: string[] = [];
  if (SEO_CONFIG.socialProfiles.twitter) {
    sameAs.push(`https://twitter.com/${SEO_CONFIG.socialProfiles.twitter.replace('@', '')}`);
  }
  if (SEO_CONFIG.socialProfiles.facebook) {
    sameAs.push(SEO_CONFIG.socialProfiles.facebook);
  }
  if (SEO_CONFIG.socialProfiles.linkedin) {
    sameAs.push(SEO_CONFIG.socialProfiles.linkedin);
  }
  if (SEO_CONFIG.socialProfiles.github) {
    sameAs.push(SEO_CONFIG.socialProfiles.github);
  }
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SEO_CONFIG.organization.name,
    url: SEO_CONFIG.siteUrl,
    logo: {
      '@type': 'ImageObject',
      url: logoUrl,
    },
    email: SEO_CONFIG.organization.email,
    description: escapeJsonLd(SEO_CONFIG.organization.description),
    sameAs: sameAs.length > 0 ? sameAs : undefined,
  };
}

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validate a schema object against Schema.org specifications
 * Checks for required properties, valid data types, and proper formatting
 * 
 * @param schema - Schema object to validate
 * @returns Validation result with errors and warnings
 */
export function validateSchema(schema: unknown): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  
  // Check if schema is an object
  if (!schema || typeof schema !== 'object') {
    errors.push({
      property: 'schema',
      message: 'Schema must be an object',
      value: schema,
    });
    return { valid: false, errors, warnings };
  }
  
  const schemaObj = schema as Record<string, unknown>;
  
  // Check for required @context
  if (!schemaObj['@context']) {
    errors.push({
      property: '@context',
      message: 'Missing required @context property',
    });
  } else if (schemaObj['@context'] !== 'https://schema.org') {
    errors.push({
      property: '@context',
      message: '@context must be "https://schema.org"',
      value: schemaObj['@context'],
    });
  }
  
  // Check for required @type
  if (!schemaObj['@type']) {
    errors.push({
      property: '@type',
      message: 'Missing required @type property',
    });
  }
  
  // Type-specific validation
  const schemaType = schemaObj['@type'] as string;
  
  switch (schemaType) {
    case 'BlogPosting':
    case 'Article':
      validateBlogPostingOrArticle(schemaObj, errors, warnings);
      break;
    case 'Person':
      validatePerson(schemaObj, errors, warnings);
      break;
    case 'BreadcrumbList':
      validateBreadcrumbList(schemaObj, errors, warnings);
      break;
    case 'WebSite':
      validateWebSite(schemaObj, errors, warnings);
      break;
    case 'CollectionPage':
      validateCollectionPage(schemaObj, errors, warnings);
      break;
    case 'FAQPage':
      validateFAQPage(schemaObj, errors, warnings);
      break;
    case 'HowTo':
      validateHowTo(schemaObj, errors, warnings);
      break;
    case 'ImageObject':
      validateImageObject(schemaObj, errors, warnings);
      break;
    case 'Organization':
      validateOrganization(schemaObj, errors, warnings);
      break;
    default:
      warnings.push({
        property: '@type',
        message: `Unknown schema type: ${schemaType}`,
        value: schemaType,
      });
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate BlogPosting or Article schema
 */
function validateBlogPostingOrArticle(
  schema: Record<string, unknown>,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  // Required properties
  if (!schema.headline) {
    errors.push({ property: 'headline', message: 'Missing required headline property' });
  }
  if (!schema.description) {
    errors.push({ property: 'description', message: 'Missing required description property' });
  }
  if (!schema.author) {
    errors.push({ property: 'author', message: 'Missing required author property' });
  }
  if (!schema.publisher) {
    errors.push({ property: 'publisher', message: 'Missing required publisher property' });
  }
  if (!schema.mainEntityOfPage) {
    errors.push({ property: 'mainEntityOfPage', message: 'Missing required mainEntityOfPage property' });
  }
  if (schema.isAccessibleForFree === undefined) {
    errors.push({ property: 'isAccessibleForFree', message: 'Missing required isAccessibleForFree property' });
  }
  
  // Recommended properties
  if (!schema.image) {
    warnings.push({ property: 'image', message: 'Recommended image property is missing' });
  }
  if (!schema.datePublished) {
    warnings.push({ property: 'datePublished', message: 'Recommended datePublished property is missing' });
  }
}

/**
 * Validate Person schema
 */
function validatePerson(
  schema: Record<string, unknown>,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  if (!schema.name) {
    errors.push({ property: 'name', message: 'Missing required name property' });
  }
}

/**
 * Validate BreadcrumbList schema
 */
function validateBreadcrumbList(
  schema: Record<string, unknown>,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  if (!schema.itemListElement) {
    errors.push({ property: 'itemListElement', message: 'Missing required itemListElement property' });
  } else if (!Array.isArray(schema.itemListElement)) {
    errors.push({ property: 'itemListElement', message: 'itemListElement must be an array' });
  } else if (schema.itemListElement.length === 0) {
    errors.push({ property: 'itemListElement', message: 'itemListElement must not be empty' });
  }
}

/**
 * Validate WebSite schema
 */
function validateWebSite(
  schema: Record<string, unknown>,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  if (!schema.name) {
    errors.push({ property: 'name', message: 'Missing required name property' });
  }
  if (!schema.url) {
    errors.push({ property: 'url', message: 'Missing required url property' });
  }
}

/**
 * Validate CollectionPage schema
 */
function validateCollectionPage(
  schema: Record<string, unknown>,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  if (!schema.name) {
    errors.push({ property: 'name', message: 'Missing required name property' });
  }
  if (!schema.description) {
    errors.push({ property: 'description', message: 'Missing required description property' });
  }
  if (!schema.url) {
    errors.push({ property: 'url', message: 'Missing required url property' });
  }
}

/**
 * Validate FAQPage schema
 */
function validateFAQPage(
  schema: Record<string, unknown>,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  if (!schema.mainEntity) {
    errors.push({ property: 'mainEntity', message: 'Missing required mainEntity property' });
  } else if (!Array.isArray(schema.mainEntity)) {
    errors.push({ property: 'mainEntity', message: 'mainEntity must be an array' });
  } else if (schema.mainEntity.length === 0) {
    errors.push({ property: 'mainEntity', message: 'mainEntity must not be empty' });
  }
}

/**
 * Validate HowTo schema
 */
function validateHowTo(
  schema: Record<string, unknown>,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  if (!schema.name) {
    errors.push({ property: 'name', message: 'Missing required name property' });
  }
  if (!schema.step) {
    errors.push({ property: 'step', message: 'Missing required step property' });
  } else if (!Array.isArray(schema.step)) {
    errors.push({ property: 'step', message: 'step must be an array' });
  } else if (schema.step.length === 0) {
    errors.push({ property: 'step', message: 'step must not be empty' });
  }
}

/**
 * Validate ImageObject schema
 */
function validateImageObject(
  schema: Record<string, unknown>,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  if (!schema.contentUrl) {
    errors.push({ property: 'contentUrl', message: 'Missing required contentUrl property' });
  }
  if (!schema.url) {
    errors.push({ property: 'url', message: 'Missing required url property' });
  }
}

/**
 * Validate Organization schema
 */
function validateOrganization(
  schema: Record<string, unknown>,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  if (!schema.name) {
    errors.push({ property: 'name', message: 'Missing required name property' });
  }
  if (!schema.url) {
    errors.push({ property: 'url', message: 'Missing required url property' });
  }
  if (!schema.logo) {
    warnings.push({ property: 'logo', message: 'Recommended logo property is missing' });
  }
}

// ============================================================================
// JSON-LD Utilities
// ============================================================================

/**
 * Minify JSON-LD by removing unnecessary whitespace
 * Reduces file size for production use
 * 
 * @param schema - Schema object or JSON-LD string
 * @returns Minified JSON-LD string
 */
export function minifyJsonLd(schema: unknown): string {
  if (typeof schema === 'string') {
    return JSON.stringify(JSON.parse(schema));
  }
  return JSON.stringify(schema);
}

/**
 * Format JSON-LD with proper indentation for debugging
 * 
 * @param schema - Schema object or JSON-LD string
 * @param indent - Number of spaces for indentation (default: 2)
 * @returns Formatted JSON-LD string
 */
export function formatJsonLd(schema: unknown, indent = 2): string {
  if (typeof schema === 'string') {
    return JSON.stringify(JSON.parse(schema), null, indent);
  }
  return JSON.stringify(schema, null, indent);
}

/**
 * Parse JSON-LD string into object
 * 
 * @param jsonLdString - JSON-LD string to parse
 * @returns Parsed object or error with line/column information
 */
export function parseJsonLd(jsonLdString: string): { success: true; data: unknown } | { success: false; error: string; line: number; column: number } {
  try {
    const data = JSON.parse(jsonLdString);
    return { success: true, data };
  } catch (error) {
    if (error instanceof SyntaxError) {
      // Extract line and column from error message
      const match = error.message.match(/position (\d+)/);
      const position = match ? parseInt(match[1], 10) : 0;
      
      // Calculate line and column
      const lines = jsonLdString.slice(0, position).split('\n');
      const line = lines.length;
      const column = lines[lines.length - 1].length + 1;
      
      return {
        success: false,
        error: error.message,
        line,
        column,
      };
    }
    
    return {
      success: false,
      error: 'Unknown parsing error',
      line: 0,
      column: 0,
    };
  }
}
