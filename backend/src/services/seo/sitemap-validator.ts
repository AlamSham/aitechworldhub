import { XMLParser } from 'fast-xml-parser';

// ==========================================
// Sitemap Validator Service
// ==========================================
// Validates sitemap XML structure, URL format, dates, and value ranges
// Follows Google's sitemap protocol specifications

export interface SitemapValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  urlCount: number;
  sitemapType: 'urlset' | 'sitemapindex' | 'news' | 'image' | 'unknown';
}

export interface SitemapValidationOptions {
  maxUrls?: number;
  maxFileSize?: number;
  requireHttps?: boolean;
  validateDates?: boolean;
  validateUrls?: boolean;
}

const DEFAULT_OPTIONS: SitemapValidationOptions = {
  maxUrls: 50000,
  maxFileSize: 50 * 1024 * 1024, // 50MB
  requireHttps: true,
  validateDates: true,
  validateUrls: true,
};

// ==========================================
// URL Validation
// ==========================================

export function isValidUrl(url: string, options: SitemapValidationOptions = {}): boolean {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  try {
    const parsedUrl = new URL(url);
    
    if (opts.requireHttps && parsedUrl.protocol !== 'https:') {
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
}

export function validateUrlFormat(url: string, options: SitemapValidationOptions = {}): string | null {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  if (!url || url.length > 2048) {
    return 'URL must be between 1 and 2048 characters';
  }
  
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return 'URL must start with http:// or https://';
  }
  
  if (opts.requireHttps && !url.startsWith('https://')) {
    return 'URL must use HTTPS protocol';
  }
  
  try {
    new URL(url);
  } catch {
    return 'URL is not properly formatted';
  }
  
  return null;
}

// ==========================================
// Date Validation
// ==========================================

export function isValidDate(dateString: string): boolean {
  if (!dateString) return false;
  
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

export function validateDate(dateString: string): string | null {
  if (!dateString) {
    return 'Date is required';
  }
  
  if (!isValidDate(dateString)) {
    return `Invalid date format: ${dateString}`;
  }
  
  const date = new Date(dateString);
  const now = new Date();
  
  if (date > now) {
    return 'Date cannot be in the future';
  }
  
  return null;
}

export function formatDate(date: Date): string {
  return date.toISOString().substring(0, 10);
}

// ==========================================
// Value Range Validation
// ==========================================

export function isValidPriority(priority: string | number): boolean {
  const num = typeof priority === 'string' ? parseFloat(priority) : priority;
  return !isNaN(num) && num >= 0 && num <= 1;
}

export function validatePriority(priority: string | number): string | null {
  if (priority === undefined || priority === null) {
    return 'Priority is required';
  }
  
  const num = typeof priority === 'string' ? parseFloat(priority) : priority;
  
  if (isNaN(num)) {
    return `Priority must be a number, got: ${priority}`;
  }
  
  if (num < 0 || num > 1) {
    return `Priority must be between 0 and 1, got: ${num}`;
  }
  
  return null;
}

export function isValidChangeFrequency(freq: string): boolean {
  const validFreqs = ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'];
  return validFreqs.includes(freq.toLowerCase());
}

export function validateChangeFrequency(freq: string): string | null {
  if (!freq) {
    return 'Change frequency is required';
  }
  
  if (!isValidChangeFrequency(freq)) {
    return `Invalid change frequency: ${freq}. Valid values: always, hourly, daily, weekly, monthly, yearly, never`;
  }
  
  return null;
}

// ==========================================
// XML Structure Validation
// ==========================================

export function validateSitemapXml(xml: string, options: SitemapValidationOptions = {}): SitemapValidationResult {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const result: SitemapValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    urlCount: 0,
    sitemapType: 'unknown',
  };

  try {
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '',
      parseAttributeValue: true,
    });

    const parsed = parser.parse(xml);

    // Determine sitemap type
    if (parsed.urlset) {
      result.sitemapType = 'urlset';
    } else if (parsed.sitemapindex) {
      result.sitemapType = 'sitemapindex';
    } else if (parsed['news:sitemapindex']) {
      result.sitemapType = 'news';
    } else if (parsed.urlset?.['image:image']) {
      result.sitemapType = 'image';
    } else {
      result.errors.push('Unknown sitemap type');
      result.isValid = false;
      return result;
    }

    // Validate based on type
    if (result.sitemapType === 'urlset') {
      validateUrlset(parsed.urlset, result, opts);
    } else if (result.sitemapType === 'sitemapindex') {
      validateSitemapindex(parsed.sitemapindex, result, opts);
    } else if (result.sitemapType === 'news') {
      validateNewsSitemap(parsed, result, opts);
    } else if (result.sitemapType === 'image') {
      validateImageSitemap(parsed, result, opts);
    }

  } catch (error) {
    result.errors.push(`XML parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    result.isValid = false;
  }

  return result;
}

function validateUrlset(urlset: any, result: SitemapValidationResult, options: SitemapValidationOptions): void {
  const urls = Array.isArray(urlset.url) ? urlset.url : [urlset.url];
  
  result.urlCount = urls.length;
  
  if (urls.length > options.maxUrls) {
    result.errors.push(`URL count (${urls.length}) exceeds maximum (${options.maxUrls})`);
    result.isValid = false;
  }

  urls.forEach((url: any, index: number) => {
    const urlStr = url.loc;
    
    if (!urlStr) {
      result.errors.push(`URL at index ${index} is missing loc element`);
      result.isValid = false;
      return;
    }

    const urlError = validateUrlFormat(urlStr, options);
    if (urlError) {
      result.errors.push(`URL at index ${index}: ${urlError}`);
      result.isValid = false;
    }

    if (options.validateDates && url.lastmod) {
      const dateError = validateDate(url.lastmod);
      if (dateError) {
        result.warnings.push(`URL at index ${index}: ${dateError}`);
      }
    }

    if (url.changefreq) {
      const freqError = validateChangeFrequency(url.changefreq);
      if (freqError) {
        result.warnings.push(`URL at index ${index}: ${freqError}`);
      }
    }

    if (url.priority) {
      const priorityError = validatePriority(url.priority);
      if (priorityError) {
        result.warnings.push(`URL at index ${index}: ${priorityError}`);
      }
    }
  });
}

function validateSitemapindex(sitemapindex: any, result: SitemapValidationResult, options: SitemapValidationOptions): void {
  const sitemaps = Array.isArray(sitemapindex.sitemap) ? sitemapindex.sitemap : [sitemapindex.sitemap];
  
  sitemaps.forEach((sitemap: any, index: number) => {
    const loc = sitemap.loc;
    
    if (!loc) {
      result.errors.push(`Sitemap at index ${index} is missing loc element`);
      result.isValid = false;
      return;
    }

    const urlError = validateUrlFormat(loc, options);
    if (urlError) {
      result.errors.push(`Sitemap at index ${index}: ${urlError}`);
      result.isValid = false;
    }

    if (options.validateDates && sitemap.lastmod) {
      const dateError = validateDate(sitemap.lastmod);
      if (dateError) {
        result.warnings.push(`Sitemap at index ${index}: ${dateError}`);
      }
    }
  });
}

function validateNewsSitemap(parsed: any, result: SitemapValidationResult, options: SitemapValidationOptions): void {
  const sitemaps = Array.isArray(parsed['news:sitemapindex'].sitemap) 
    ? parsed['news:sitemapindex'].sitemap 
    : [parsed['news:sitemapindex'].sitemap];
  
  result.urlCount = sitemaps.length;
  
  sitemaps.forEach((sitemap: any, index: number) => {
    const loc = sitemap.loc;
    
    if (!loc) {
      result.errors.push(`News sitemap at index ${index} is missing loc element`);
      result.isValid = false;
      return;
    }

    const urlError = validateUrlFormat(loc, options);
    if (urlError) {
      result.errors.push(`News sitemap at index ${index}: ${urlError}`);
      result.isValid = false;
    }

    if (options.validateDates && sitemap.lastmod) {
      const dateError = validateDate(sitemap.lastmod);
      if (dateError) {
        result.warnings.push(`News sitemap at index ${index}: ${dateError}`);
      }
    }
  });
}

function validateImageSitemap(parsed: any, result: SitemapValidationResult, options: SitemapValidationOptions): void {
  const urlset = parsed.urlset;
  const urls = Array.isArray(urlset.url) ? urlset.url : [urlset.url];
  
  result.urlCount = urls.length;
  
  if (urls.length > options.maxUrls) {
    result.errors.push(`URL count (${urls.length}) exceeds maximum (${options.maxUrls})`);
    result.isValid = false;
  }

  urls.forEach((url: any, index: number) => {
    const urlStr = url.loc;
    
    if (!urlStr) {
      result.errors.push(`URL at index ${index} is missing loc element`);
      result.isValid = false;
      return;
    }

    const urlError = validateUrlFormat(urlStr, options);
    if (urlError) {
      result.errors.push(`URL at index ${index}: ${urlError}`);
      result.isValid = false;
    }

    if (url['image:image']) {
      const images = Array.isArray(url['image:image']) ? url['image:image'] : [url['image:image']];
      
      images.forEach((image: any, imgIndex: number) => {
        if (!image.loc) {
          result.errors.push(`Image at URL index ${index}, image ${imgIndex} is missing loc`);
          result.isValid = false;
        }
      });
    }
  });
}

// ==========================================
// Validation Error Reporting
// ==========================================

export interface ValidationError {
  type: 'error' | 'warning';
  message: string;
  context?: string;
}

export function formatValidationErrors(result: SitemapValidationResult): string {
  const lines: string[] = [];
  
  lines.push(`Sitemap Validation Result: ${result.isValid ? 'PASSED' : 'FAILED'}`);
  lines.push(`Sitemap Type: ${result.sitemapType}`);
  lines.push(`URL Count: ${result.urlCount}`);
  lines.push('');
  
  if (result.errors.length > 0) {
    lines.push('Errors:');
    result.errors.forEach((error, index) => {
      lines.push(`  ${index + 1}. ${error}`);
    });
    lines.push('');
  }
  
  if (result.warnings.length > 0) {
    lines.push('Warnings:');
    result.warnings.forEach((warning, index) => {
      lines.push(`  ${index + 1}. ${warning}`);
    });
  }
  
  return lines.join('\n');
}

// ==========================================
// Export all functions
// ==========================================

export default {
  isValidUrl,
  validateUrlFormat,
  isValidDate,
  validateDate,
  formatDate,
  isValidPriority,
  validatePriority,
  isValidChangeFrequency,
  validateChangeFrequency,
  validateSitemapXml,
  formatValidationErrors,
};
