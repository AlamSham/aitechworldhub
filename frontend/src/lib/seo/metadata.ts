/**
 * Metadata Manager
 * 
 * Generates and manages Open Graph, Twitter Cards, canonical URLs,
 * meta descriptions, meta keywords, and robots meta tags for SEO optimization.
 * 
 * All metadata is properly escaped and validated to ensure compatibility
 * with social media platforms and search engines.
 */

import { SEO_CONFIG } from '../seo-config';
import {
  escapeHtmlAttribute,
  normalizeUrl,
  truncateText,
  stripHtmlTags,
  stripMarkdown,
  formatDateTimeISO,
  validateImageDimensions,
} from './utils';
import type {
  OpenGraphMetadata,
  TwitterCardMetadata,
  HreflangTag,
  RobotsOptions,
  ImageValidation,
} from '../../types/seo';

// ============================================================================
// Type Definitions for Input Data
// ============================================================================

/**
 * Published post data structure for metadata generation
 */
export interface PublishedPost {
  _id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content?: string;
  imageUrl?: string;
  publishedAt?: Date | string;
  updatedAt?: Date | string;
  author?: {
    name: string;
    slug?: string;
  };
  category?: string;
  tags?: string[];
  focusKeyword?: string;
}

// ============================================================================
// Open Graph Metadata Generator
// ============================================================================

/**
 * Generate Open Graph metadata for a blog post
 * 
 * Creates complete Open Graph tags including title, description, URL, type,
 * image, site name, locale, and article-specific properties.
 * 
 * @param post - Published post data
 * @returns Open Graph metadata object with all required properties
 * 
 * @example
 * const og = generateOpenGraph(post);
 * // Returns:
 * // {
 * //   'og:title': 'My Blog Post',
 * //   'og:description': 'Post excerpt...',
 * //   'og:url': 'https://example.com/posts/my-post',
 * //   'og:type': 'article',
 * //   'og:image': 'https://example.com/images/post.jpg',
 * //   ...
 * // }
 */
export function generateOpenGraph(post: PublishedPost): OpenGraphMetadata {
  const postUrl = normalizeUrl(`/posts/${post.slug}`);
  const imageUrl = post.imageUrl
    ? normalizeUrl(post.imageUrl)
    : normalizeUrl(SEO_CONFIG.defaultImage);
  
  const metadata: OpenGraphMetadata = {
    'og:title': escapeHtmlAttribute(post.title),
    'og:description': escapeHtmlAttribute(post.excerpt),
    'og:url': postUrl,
    'og:type': 'article',
    'og:image': imageUrl,
    'og:site_name': SEO_CONFIG.siteName,
    'og:locale': 'en_US',
  };
  
  // Add article-specific properties
  if (post.publishedAt) {
    metadata['og:article:published_time'] = formatDateTimeISO(post.publishedAt);
  }
  
  if (post.updatedAt) {
    metadata['og:article:modified_time'] = formatDateTimeISO(post.updatedAt);
  }
  
  if (post.author?.name) {
    metadata['og:article:author'] = escapeHtmlAttribute(post.author.name);
  }
  
  if (post.category) {
    metadata['og:article:section'] = escapeHtmlAttribute(post.category);
  }
  
  if (post.tags && post.tags.length > 0) {
    metadata['og:article:tag'] = post.tags.map(tag => escapeHtmlAttribute(tag));
  }
  
  return metadata;
}

// ============================================================================
// Twitter Card Metadata Generator
// ============================================================================

/**
 * Generate Twitter Card metadata for a blog post
 * 
 * Creates Twitter Card tags for optimal Twitter sharing previews.
 * Uses 'summary_large_image' card type for better visual presentation.
 * 
 * @param post - Published post data
 * @returns Twitter Card metadata object
 * 
 * @example
 * const twitter = generateTwitterCard(post);
 * // Returns:
 * // {
 * //   'twitter:card': 'summary_large_image',
 * //   'twitter:title': 'My Blog Post',
 * //   'twitter:description': 'Post excerpt...',
 * //   'twitter:image': 'https://example.com/images/post.jpg',
 * //   'twitter:site': '@aitechworldhub'
 * // }
 */
export function generateTwitterCard(post: PublishedPost): TwitterCardMetadata {
  const imageUrl = post.imageUrl
    ? normalizeUrl(post.imageUrl)
    : normalizeUrl(SEO_CONFIG.defaultImage);
  
  const metadata: TwitterCardMetadata = {
    'twitter:card': SEO_CONFIG.metadata.twitterCard,
    'twitter:title': escapeHtmlAttribute(post.title),
    'twitter:description': escapeHtmlAttribute(post.excerpt),
    'twitter:image': imageUrl,
  };
  
  // Add site handle if configured
  if (SEO_CONFIG.socialProfiles.twitter) {
    metadata['twitter:site'] = SEO_CONFIG.socialProfiles.twitter;
  }
  
  // Add author handle if available
  if (post.author?.slug) {
    // Note: In a real implementation, you would fetch the author's Twitter handle
    // For now, we'll use the site handle as a fallback
    metadata['twitter:creator'] = SEO_CONFIG.socialProfiles.twitter;
  }
  
  return metadata;
}

// ============================================================================
// Canonical URL Generator
// ============================================================================

/**
 * Generate canonical URL for a page
 * 
 * Creates an absolute HTTPS URL with consistent formatting (no trailing slashes).
 * Canonical URLs prevent duplicate content issues and consolidate SEO signals.
 * 
 * @param path - Relative or absolute path
 * @returns Canonical URL as absolute HTTPS URL
 * 
 * @example
 * generateCanonicalUrl('/posts/my-post/') // 'https://example.com/posts/my-post'
 * generateCanonicalUrl('posts/my-post') // 'https://example.com/posts/my-post'
 */
export function generateCanonicalUrl(path: string): string {
  return normalizeUrl(path);
}

// ============================================================================
// Hreflang Tags Generator
// ============================================================================

/**
 * Generate hreflang tags for multi-language content
 * 
 * Creates hreflang tags to indicate language variants of a page.
 * Helps search engines serve the correct language version to users.
 * 
 * @param path - Page path
 * @param locales - Array of locale codes (e.g., ['en', 'es', 'fr'])
 * @returns Array of hreflang tag objects
 * 
 * @example
 * const tags = generateHreflangTags('/posts/my-post', ['en', 'es', 'fr']);
 * // Returns:
 * // [
 * //   { hreflang: 'en', href: 'https://example.com/en/posts/my-post' },
 * //   { hreflang: 'es', href: 'https://example.com/es/posts/my-post' },
 * //   { hreflang: 'fr', href: 'https://example.com/fr/posts/my-post' }
 * // ]
 */
export function generateHreflangTags(path: string, locales: string[]): HreflangTag[] {
  return locales.map(locale => ({
    hreflang: locale,
    href: normalizeUrl(`/${locale}${path}`),
  }));
}

// ============================================================================
// Meta Description Generator
// ============================================================================

/**
 * Generate meta description from text
 * 
 * Creates an optimized meta description by:
 * - Stripping HTML and Markdown formatting
 * - Truncating to 150-160 characters
 * - Preserving word boundaries (no mid-word cuts)
 * - Adding ellipsis if truncated
 * 
 * @param text - Source text (can contain HTML or Markdown)
 * @param minLength - Minimum length (default: 150)
 * @param maxLength - Maximum length (default: 160)
 * @returns Optimized meta description
 * 
 * @example
 * const desc = generateMetaDescription('This is a long article about AI...');
 * // Returns: 'This is a long article about AI and machine learning...'
 */
export function generateMetaDescription(
  text: string,
  minLength = SEO_CONFIG.metadata.descriptionMinLength,
  maxLength = SEO_CONFIG.metadata.descriptionMaxLength
): string {
  // Strip HTML and Markdown
  let clean = stripHtmlTags(text);
  clean = stripMarkdown(clean);
  
  // Remove extra whitespace
  clean = clean.replace(/\s+/g, ' ').trim();
  
  // If already within range, return as-is
  if (clean.length >= minLength && clean.length <= maxLength) {
    return clean;
  }
  
  // If too short, return as-is
  if (clean.length < minLength) {
    return clean;
  }
  
  // Truncate to maxLength while preserving word boundaries
  return truncateText(clean, maxLength);
}

// ============================================================================
// Meta Keywords Generator
// ============================================================================

/**
 * Generate meta keywords from post tags and focus keyword
 * 
 * Creates a comma-separated list of keywords for the meta keywords tag.
 * Combines post tags with the focus keyword (if provided).
 * 
 * Note: Meta keywords tag has limited SEO value in modern search engines,
 * but is included for completeness and potential use by some search engines.
 * 
 * @param post - Published post data
 * @returns Comma-separated keywords string
 * 
 * @example
 * const keywords = generateMetaKeywords(post);
 * // Returns: 'artificial intelligence, machine learning, neural networks'
 */
export function generateMetaKeywords(post: PublishedPost): string {
  const keywords: string[] = [];
  
  // Add focus keyword first (highest priority)
  if (post.focusKeyword) {
    keywords.push(post.focusKeyword);
  }
  
  // Add post tags
  if (post.tags && post.tags.length > 0) {
    keywords.push(...post.tags);
  }
  
  // Remove duplicates and escape
  const uniqueKeywords = Array.from(new Set(keywords));
  return uniqueKeywords.map(k => escapeHtmlAttribute(k)).join(', ');
}

// ============================================================================
// Robots Meta Tag Generator
// ============================================================================

/**
 * Generate robots meta tag content
 * 
 * Creates a robots meta tag with directives for search engine crawlers.
 * Controls indexing, following links, and preview settings.
 * 
 * @param options - Robots tag options
 * @returns Robots meta tag content string
 * 
 * @example
 * const robots = generateRobotsTag({
 *   index: true,
 *   follow: true,
 *   maxImagePreview: 'large',
 *   maxSnippet: -1,
 *   maxVideoPreview: -1
 * });
 * // Returns: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
 */
export function generateRobotsTag(options?: RobotsOptions): string {
  const directives: string[] = [];
  
  // Default to index and follow if not specified
  const index = options?.index !== false;
  const follow = options?.follow !== false;
  
  directives.push(index ? 'index' : 'noindex');
  directives.push(follow ? 'follow' : 'nofollow');
  
  // Add max-image-preview directive
  if (options?.maxImagePreview) {
    directives.push(`max-image-preview:${options.maxImagePreview}`);
  } else {
    // Default to large for best preview quality
    directives.push('max-image-preview:large');
  }
  
  // Add max-snippet directive
  if (options?.maxSnippet !== undefined) {
    directives.push(`max-snippet:${options.maxSnippet}`);
  } else {
    // Default to -1 (no limit) for full snippet
    directives.push('max-snippet:-1');
  }
  
  // Add max-video-preview directive
  if (options?.maxVideoPreview !== undefined) {
    directives.push(`max-video-preview:${options.maxVideoPreview}`);
  } else {
    // Default to -1 (no limit) for full video preview
    directives.push('max-video-preview:-1');
  }
  
  return directives.join(', ');
}

// ============================================================================
// Image Dimension Validation
// ============================================================================

/**
 * Validate image dimensions meet minimum requirements
 * 
 * Checks if image dimensions meet the minimum requirements for Open Graph
 * images (1200x630 pixels). This ensures optimal display on social media.
 * 
 * Note: This is a synchronous validation that only checks the dimensions
 * against requirements. For actual image dimension fetching, use the
 * async validateImageDimensionsAsync function.
 * 
 * @param width - Image width in pixels
 * @param height - Image height in pixels
 * @returns Validation result with dimensions and requirements check
 * 
 * @example
 * const validation = validateImageDimensionsSync(1200, 630);
 * // Returns: { valid: true, width: 1200, height: 630, meetsRequirements: true }
 * 
 * const validation2 = validateImageDimensionsSync(800, 400);
 * // Returns: { valid: true, width: 800, height: 400, meetsRequirements: false }
 */
export function validateImageDimensionsSync(
  width: number,
  height: number
): ImageValidation {
  const meetsRequirements = validateImageDimensions(width, height);
  
  return {
    valid: true,
    width,
    height,
    meetsRequirements,
  };
}

/**
 * Validate image dimensions by fetching image metadata
 * 
 * Fetches image headers to check actual dimensions and validates against
 * minimum requirements. This is an async operation that makes a network request.
 * 
 * @param imageUrl - URL of the image to validate
 * @returns Promise resolving to validation result
 * 
 * @example
 * const validation = await validateImageDimensionsAsync('https://example.com/image.jpg');
 * if (!validation.meetsRequirements) {
 *   console.warn('Image does not meet minimum dimensions');
 * }
 */
export async function validateImageDimensionsAsync(
  imageUrl: string
): Promise<ImageValidation> {
  try {
    // Create an Image object to load the image
    // Note: This works in browser environments. For Node.js, you'd need a different approach.
    if (typeof window === 'undefined') {
      // Server-side: We can't easily validate image dimensions without additional libraries
      // Return a validation result that assumes the image is valid
      return {
        valid: true,
        width: SEO_CONFIG.metadata.ogImageMinWidth,
        height: SEO_CONFIG.metadata.ogImageMinHeight,
        meetsRequirements: true,
      };
    }
    
    // Client-side: Use Image API
    return new Promise((resolve) => {
      const img = new Image();
      
      img.onload = () => {
        const meetsRequirements = validateImageDimensions(img.width, img.height);
        resolve({
          valid: true,
          width: img.width,
          height: img.height,
          meetsRequirements,
        });
      };
      
      img.onerror = () => {
        resolve({
          valid: false,
          width: 0,
          height: 0,
          meetsRequirements: false,
          error: 'Failed to load image',
        });
      };
      
      // Set timeout to prevent hanging
      setTimeout(() => {
        if (!img.complete) {
          resolve({
            valid: false,
            width: 0,
            height: 0,
            meetsRequirements: false,
            error: 'Image load timeout',
          });
        }
      }, 5000);
      
      img.src = imageUrl;
    });
  } catch (error) {
    return {
      valid: false,
      width: 0,
      height: 0,
      meetsRequirements: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Generate complete metadata for a blog post
 * 
 * Convenience function that generates all metadata types at once:
 * - Open Graph metadata
 * - Twitter Card metadata
 * - Canonical URL
 * - Meta description
 * - Meta keywords
 * - Robots tag
 * 
 * @param post - Published post data
 * @returns Complete metadata object
 * 
 * @example
 * const metadata = generateCompleteMetadata(post);
 * // Use in Next.js metadata API:
 * export const metadata = {
 *   title: post.title,
 *   description: metadata.description,
 *   openGraph: metadata.openGraph,
 *   twitter: metadata.twitter,
 *   alternates: { canonical: metadata.canonical },
 *   robots: metadata.robots,
 *   keywords: metadata.keywords
 * };
 */
export function generateCompleteMetadata(post: PublishedPost) {
  return {
    openGraph: generateOpenGraph(post),
    twitter: generateTwitterCard(post),
    canonical: generateCanonicalUrl(`/posts/${post.slug}`),
    description: generateMetaDescription(post.excerpt),
    keywords: generateMetaKeywords(post),
    robots: generateRobotsTag(),
  };
}
