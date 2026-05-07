/**
 * SEO Utility Functions
 * 
 * Base utility functions for common SEO operations including
 * URL normalization, date formatting, string escaping, and validation helpers.
 */

import { SEO_CONFIG } from '../seo-config';

// ============================================================================
// URL Utilities
// ============================================================================

/**
 * Normalize a URL to absolute HTTPS format with consistent formatting
 * 
 * @param path - Relative or absolute path
 * @returns Normalized absolute HTTPS URL without trailing slash
 * 
 * @example
 * normalizeUrl('/posts/my-post/') // 'https://aitechworldhub.com/posts/my-post'
 * normalizeUrl('posts/my-post') // 'https://aitechworldhub.com/posts/my-post'
 */
export function normalizeUrl(path: string): string {
  // Remove trailing slash from base URL
  const baseUrl = SEO_CONFIG.siteUrl.replace(/\/$/, '');
  
  // Ensure path starts with /
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  // Remove trailing slash from path (except for root)
  const normalizedPath = cleanPath === '/' ? cleanPath : cleanPath.replace(/\/$/, '');
  
  return `${baseUrl}${normalizedPath}`;
}

/**
 * Check if a URL is absolute (has protocol)
 * 
 * @param url - URL to check
 * @returns True if URL is absolute
 */
export function isAbsoluteUrl(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

/**
 * Check if a URL uses HTTPS protocol
 * 
 * @param url - URL to check
 * @returns True if URL uses HTTPS
 */
export function isHttpsUrl(url: string): boolean {
  return /^https:\/\//i.test(url);
}

/**
 * Encode URL components properly
 * 
 * @param str - String to encode
 * @returns URL-encoded string
 */
export function encodeUrlComponent(str: string): string {
  return encodeURIComponent(str)
    .replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
}

// ============================================================================
// Date Utilities
// ============================================================================

/**
 * Format a date to ISO 8601 format (YYYY-MM-DD)
 * 
 * @param date - Date to format
 * @returns ISO 8601 date string
 * 
 * @example
 * formatDateISO(new Date('2024-01-15')) // '2024-01-15'
 */
export function formatDateISO(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(d.getTime())) {
    throw new Error(`Invalid date: ${date}`);
  }
  
  return d.toISOString().split('T')[0];
}

/**
 * Format a date to full ISO 8601 format with time (YYYY-MM-DDTHH:mm:ss.sssZ)
 * 
 * @param date - Date to format
 * @returns Full ISO 8601 datetime string
 * 
 * @example
 * formatDateTimeISO(new Date('2024-01-15T10:30:00')) // '2024-01-15T10:30:00.000Z'
 */
export function formatDateTimeISO(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(d.getTime())) {
    throw new Error(`Invalid date: ${date}`);
  }
  
  return d.toISOString();
}

/**
 * Check if a date is in the future
 * 
 * @param date - Date to check
 * @returns True if date is in the future
 */
export function isFutureDate(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.getTime() > Date.now();
}

/**
 * Check if a date is within the last N days
 * 
 * @param date - Date to check
 * @param days - Number of days
 * @returns True if date is within the last N days
 */
export function isWithinLastDays(date: Date | string, days: number): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
  return d.getTime() >= cutoff;
}

/**
 * Select the most recent date from multiple date fields
 * Priority: updatedAt > publishedAt > createdAt
 * 
 * @param dates - Object with optional date fields
 * @returns Most recent date or current date if none provided
 */
export function selectMostRecentDate(dates: {
  updatedAt?: Date | string | null;
  publishedAt?: Date | string | null;
  createdAt?: Date | string | null;
}): Date {
  if (dates.updatedAt) {
    return typeof dates.updatedAt === 'string' ? new Date(dates.updatedAt) : dates.updatedAt;
  }
  if (dates.publishedAt) {
    return typeof dates.publishedAt === 'string' ? new Date(dates.publishedAt) : dates.publishedAt;
  }
  if (dates.createdAt) {
    return typeof dates.createdAt === 'string' ? new Date(dates.createdAt) : dates.createdAt;
  }
  return new Date();
}

// ============================================================================
// String Utilities
// ============================================================================

/**
 * Escape special characters for JSON-LD
 * Handles quotes, newlines, HTML entities, and Unicode
 * 
 * @param str - String to escape
 * @returns Escaped string safe for JSON-LD
 */
export function escapeJsonLd(str: string): string {
  return str
    .replace(/\\/g, '\\\\') // Escape backslashes
    .replace(/"/g, '\\"') // Escape double quotes
    .replace(/\n/g, '\\n') // Escape newlines
    .replace(/\r/g, '\\r') // Escape carriage returns
    .replace(/\t/g, '\\t') // Escape tabs
    .replace(/\f/g, '\\f') // Escape form feeds
    .replace(/\b/g, '\\b'); // Escape backspaces
}

/**
 * Escape special characters for HTML attributes
 * 
 * @param str - String to escape
 * @returns Escaped string safe for HTML attributes
 */
export function escapeHtmlAttribute(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Strip HTML tags from a string
 * 
 * @param html - HTML string
 * @returns Plain text without HTML tags
 */
export function stripHtmlTags(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

/**
 * Strip Markdown formatting from a string
 * 
 * @param markdown - Markdown string
 * @returns Plain text without Markdown formatting
 */
export function stripMarkdown(markdown: string): string {
  return markdown
    .replace(/#{1,6}\s+/g, '') // Remove headers
    .replace(/\*\*(.+?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.+?)\*/g, '$1') // Remove italic
    .replace(/\[(.+?)\]\(.+?\)/g, '$1') // Remove links
    .replace(/`(.+?)`/g, '$1') // Remove inline code
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/>\s+/g, '') // Remove blockquotes
    .replace(/[-*+]\s+/g, '') // Remove list markers
    .replace(/\d+\.\s+/g, ''); // Remove numbered list markers
}

/**
 * Truncate text to a maximum length while preserving word boundaries
 * 
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @param ellipsis - Ellipsis string to append (default: '...')
 * @returns Truncated text
 * 
 * @example
 * truncateText('This is a long text', 10) // 'This is...'
 */
export function truncateText(text: string, maxLength: number, ellipsis = '...'): string {
  if (text.length <= maxLength) {
    return text;
  }
  
  // Find the last space before maxLength
  const truncated = text.slice(0, maxLength - ellipsis.length);
  const lastSpace = truncated.lastIndexOf(' ');
  
  if (lastSpace > 0) {
    return truncated.slice(0, lastSpace) + ellipsis;
  }
  
  return truncated + ellipsis;
}

/**
 * Generate a meta description from text
 * Strips HTML/Markdown, truncates to 150-160 characters, preserves word boundaries
 * 
 * @param text - Source text
 * @param minLength - Minimum length (default: 150)
 * @param maxLength - Maximum length (default: 160)
 * @returns Meta description
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
// Validation Utilities
// ============================================================================

/**
 * Validate that a value is within a numeric range
 * 
 * @param value - Value to validate
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (inclusive)
 * @returns True if value is within range
 */
export function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

/**
 * Validate that a string is a valid changefreq value
 * 
 * @param value - Value to validate
 * @returns True if value is a valid changefreq
 */
export function isValidChangefreq(value: string): boolean {
  const validValues = ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'];
  return validValues.includes(value);
}

/**
 * Validate that a number is a valid priority value (0.0 to 1.0)
 * 
 * @param value - Value to validate
 * @returns True if value is a valid priority
 */
export function isValidPriority(value: number): boolean {
  return isInRange(value, 0.0, 1.0);
}

/**
 * Validate that a string is a valid ISO 8601 date
 * 
 * @param value - Value to validate
 * @returns True if value is a valid ISO 8601 date
 */
export function isValidISODate(value: string): boolean {
  // Check format: YYYY-MM-DD or full ISO 8601
  const isoDateRegex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z)?$/;
  
  if (!isoDateRegex.test(value)) {
    return false;
  }
  
  // Check if date is valid
  const date = new Date(value);
  return !isNaN(date.getTime());
}

/**
 * Validate image dimensions meet minimum requirements
 * 
 * @param width - Image width
 * @param height - Image height
 * @returns True if dimensions meet requirements (>= 1200x630)
 */
export function validateImageDimensions(width: number, height: number): boolean {
  return (
    width >= SEO_CONFIG.metadata.ogImageMinWidth &&
    height >= SEO_CONFIG.metadata.ogImageMinHeight
  );
}

// ============================================================================
// JSON-LD Utilities
// ============================================================================

/**
 * Minify JSON-LD by removing unnecessary whitespace
 * 
 * @param jsonLd - JSON-LD object or string
 * @returns Minified JSON-LD string
 */
export function minifyJsonLd(jsonLd: unknown): string {
  if (typeof jsonLd === 'string') {
    return JSON.stringify(JSON.parse(jsonLd));
  }
  return JSON.stringify(jsonLd);
}

/**
 * Format JSON-LD with proper indentation
 * 
 * @param jsonLd - JSON-LD object or string
 * @param indent - Number of spaces for indentation (default: 2)
 * @returns Formatted JSON-LD string
 */
export function formatJsonLd(jsonLd: unknown, indent = 2): string {
  if (typeof jsonLd === 'string') {
    return JSON.stringify(JSON.parse(jsonLd), null, indent);
  }
  return JSON.stringify(jsonLd, null, indent);
}

/**
 * Parse JSON-LD string into object
 * 
 * @param jsonLdString - JSON-LD string
 * @returns Parsed object or error
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

// ============================================================================
// Performance Utilities
// ============================================================================

/**
 * Measure execution time of a function
 * 
 * @param fn - Function to measure
 * @returns Tuple of [result, duration in milliseconds]
 */
export async function measureExecutionTime<T>(
  fn: () => T | Promise<T>
): Promise<[T, number]> {
  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;
  return [result, duration];
}

/**
 * Check if execution time is within threshold
 * 
 * @param duration - Duration in milliseconds
 * @param threshold - Threshold in milliseconds
 * @returns True if duration is within threshold
 */
export function isWithinPerformanceThreshold(duration: number, threshold: number): boolean {
  return duration <= threshold;
}

// ============================================================================
// Array Utilities
// ============================================================================

/**
 * Remove duplicate values from an array
 * 
 * @param arr - Array with potential duplicates
 * @returns Array with unique values
 */
export function uniqueArray<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

/**
 * Chunk an array into smaller arrays of specified size
 * 
 * @param arr - Array to chunk
 * @param size - Size of each chunk
 * @returns Array of chunks
 */
export function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

// ============================================================================
// Error Utilities
// ============================================================================

/**
 * Create a structured error log object
 * 
 * @param component - Component name
 * @param message - Error message
 * @param context - Additional context
 * @returns Structured error log
 */
export function createErrorLog(
  component: string,
  message: string,
  context: Record<string, unknown> = {}
): {
  timestamp: Date;
  level: 'error';
  component: string;
  message: string;
  context: Record<string, unknown>;
} {
  return {
    timestamp: new Date(),
    level: 'error',
    component,
    message,
    context,
  };
}

/**
 * Create a structured warning log object
 * 
 * @param component - Component name
 * @param message - Warning message
 * @param context - Additional context
 * @returns Structured warning log
 */
export function createWarningLog(
  component: string,
  message: string,
  context: Record<string, unknown> = {}
): {
  timestamp: Date;
  level: 'warn';
  component: string;
  message: string;
  context: Record<string, unknown>;
} {
  return {
    timestamp: new Date(),
    level: 'warn',
    component,
    message,
    context,
  };
}
