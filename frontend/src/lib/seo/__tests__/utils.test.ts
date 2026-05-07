/**
 * Unit tests for SEO utility functions
 */

import {
  normalizeUrl,
  isAbsoluteUrl,
  isHttpsUrl,
  formatDateISO,
  formatDateTimeISO,
  isWithinLastDays,
  selectMostRecentDate,
  escapeJsonLd,
  stripHtmlTags,
  stripMarkdown,
  truncateText,
  generateMetaDescription,
  isValidChangefreq,
  isValidPriority,
  isValidISODate,
  minifyJsonLd,
  formatJsonLd,
  parseJsonLd,
} from '../utils';

describe('URL Utilities', () => {
  describe('normalizeUrl', () => {
    it('should normalize relative paths to absolute HTTPS URLs', () => {
      const result = normalizeUrl('/posts/my-post');
      expect(result).toMatch(/^https:\/\//);
      expect(result).toContain('/posts/my-post');
    });

    it('should remove trailing slashes', () => {
      const result = normalizeUrl('/posts/my-post/');
      expect(result).not.toMatch(/\/$/);
    });

    it('should handle paths without leading slash', () => {
      const result = normalizeUrl('posts/my-post');
      expect(result).toContain('/posts/my-post');
    });
  });

  describe('isAbsoluteUrl', () => {
    it('should return true for absolute URLs', () => {
      expect(isAbsoluteUrl('https://example.com')).toBe(true);
      expect(isAbsoluteUrl('http://example.com')).toBe(true);
    });

    it('should return false for relative URLs', () => {
      expect(isAbsoluteUrl('/posts/my-post')).toBe(false);
      expect(isAbsoluteUrl('posts/my-post')).toBe(false);
    });
  });

  describe('isHttpsUrl', () => {
    it('should return true for HTTPS URLs', () => {
      expect(isHttpsUrl('https://example.com')).toBe(true);
    });

    it('should return false for HTTP URLs', () => {
      expect(isHttpsUrl('http://example.com')).toBe(false);
    });
  });
});

describe('Date Utilities', () => {
  describe('formatDateISO', () => {
    it('should format date to YYYY-MM-DD', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      expect(formatDateISO(date)).toBe('2024-01-15');
    });

    it('should handle string dates', () => {
      expect(formatDateISO('2024-01-15')).toBe('2024-01-15');
    });

    it('should throw error for invalid dates', () => {
      expect(() => formatDateISO('invalid')).toThrow('Invalid date');
    });
  });

  describe('formatDateTimeISO', () => {
    it('should format date to full ISO 8601', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      const result = formatDateTimeISO(date);
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });
  });

  describe('isWithinLastDays', () => {
    it('should return true for recent dates', () => {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      expect(isWithinLastDays(yesterday, 2)).toBe(true);
    });

    it('should return false for old dates', () => {
      const oldDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
      expect(isWithinLastDays(oldDate, 2)).toBe(false);
    });
  });

  describe('selectMostRecentDate', () => {
    it('should prioritize updatedAt over publishedAt', () => {
      const dates = {
        updatedAt: new Date('2024-01-20'),
        publishedAt: new Date('2024-01-15'),
        createdAt: new Date('2024-01-10'),
      };
      const result = selectMostRecentDate(dates);
      expect(result.toISOString()).toContain('2024-01-20');
    });

    it('should use publishedAt if updatedAt is missing', () => {
      const dates = {
        publishedAt: new Date('2024-01-15'),
        createdAt: new Date('2024-01-10'),
      };
      const result = selectMostRecentDate(dates);
      expect(result.toISOString()).toContain('2024-01-15');
    });

    it('should use createdAt if others are missing', () => {
      const dates = {
        createdAt: new Date('2024-01-10'),
      };
      const result = selectMostRecentDate(dates);
      expect(result.toISOString()).toContain('2024-01-10');
    });
  });
});

describe('String Utilities', () => {
  describe('escapeJsonLd', () => {
    it('should escape double quotes', () => {
      expect(escapeJsonLd('Hello "World"')).toBe('Hello \\"World\\"');
    });

    it('should escape newlines', () => {
      expect(escapeJsonLd('Hello\nWorld')).toBe('Hello\\nWorld');
    });

    it('should escape backslashes', () => {
      expect(escapeJsonLd('Hello\\World')).toBe('Hello\\\\World');
    });
  });

  describe('stripHtmlTags', () => {
    it('should remove HTML tags', () => {
      expect(stripHtmlTags('<p>Hello <strong>World</strong></p>')).toBe('Hello World');
    });

    it('should handle nested tags', () => {
      expect(stripHtmlTags('<div><p>Hello</p></div>')).toBe('Hello');
    });
  });

  describe('stripMarkdown', () => {
    it('should remove markdown headers', () => {
      expect(stripMarkdown('# Hello World')).toBe('Hello World');
    });

    it('should remove bold formatting', () => {
      expect(stripMarkdown('Hello **World**')).toBe('Hello World');
    });

    it('should remove links', () => {
      expect(stripMarkdown('[Hello](https://example.com)')).toBe('Hello');
    });
  });

  describe('truncateText', () => {
    it('should truncate long text', () => {
      const text = 'This is a very long text that needs to be truncated';
      const result = truncateText(text, 20);
      expect(result.length).toBeLessThanOrEqual(20);
      expect(result).toContain('...');
    });

    it('should preserve word boundaries', () => {
      const text = 'This is a test';
      const result = truncateText(text, 10);
      expect(result).not.toContain('is a t'); // Should not cut mid-word
    });

    it('should not truncate short text', () => {
      const text = 'Short';
      expect(truncateText(text, 20)).toBe('Short');
    });
  });

  describe('generateMetaDescription', () => {
    it('should generate description within 150-160 characters', () => {
      const longText = 'a'.repeat(200);
      const result = generateMetaDescription(longText);
      expect(result.length).toBeGreaterThanOrEqual(150);
      expect(result.length).toBeLessThanOrEqual(160);
    });

    it('should strip HTML tags', () => {
      const html = '<p>This is a <strong>test</strong> description</p>';
      const result = generateMetaDescription(html);
      expect(result).not.toContain('<');
      expect(result).not.toContain('>');
    });

    it('should strip Markdown', () => {
      const markdown = '# This is a **test** description';
      const result = generateMetaDescription(markdown);
      expect(result).not.toContain('#');
      expect(result).not.toContain('**');
    });
  });
});

describe('Validation Utilities', () => {
  describe('isValidChangefreq', () => {
    it('should return true for valid values', () => {
      expect(isValidChangefreq('daily')).toBe(true);
      expect(isValidChangefreq('weekly')).toBe(true);
      expect(isValidChangefreq('monthly')).toBe(true);
    });

    it('should return false for invalid values', () => {
      expect(isValidChangefreq('invalid')).toBe(false);
      expect(isValidChangefreq('sometimes')).toBe(false);
    });
  });

  describe('isValidPriority', () => {
    it('should return true for values between 0.0 and 1.0', () => {
      expect(isValidPriority(0.0)).toBe(true);
      expect(isValidPriority(0.5)).toBe(true);
      expect(isValidPriority(1.0)).toBe(true);
    });

    it('should return false for values outside range', () => {
      expect(isValidPriority(-0.1)).toBe(false);
      expect(isValidPriority(1.1)).toBe(false);
    });
  });

  describe('isValidISODate', () => {
    it('should return true for valid ISO dates', () => {
      expect(isValidISODate('2024-01-15')).toBe(true);
      expect(isValidISODate('2024-01-15T10:30:00.000Z')).toBe(true);
    });

    it('should return false for invalid dates', () => {
      expect(isValidISODate('2024-13-01')).toBe(false);
      expect(isValidISODate('invalid')).toBe(false);
    });
  });
});

describe('JSON-LD Utilities', () => {
  describe('minifyJsonLd', () => {
    it('should remove whitespace from JSON-LD', () => {
      const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: 'Test',
      };
      const result = minifyJsonLd(jsonLd);
      expect(result).not.toContain('\n');
      expect(result).not.toContain('  ');
    });
  });

  describe('formatJsonLd', () => {
    it('should format JSON-LD with indentation', () => {
      const jsonLd = { '@context': 'https://schema.org', '@type': 'BlogPosting' };
      const result = formatJsonLd(jsonLd);
      expect(result).toContain('\n');
      expect(result).toContain('  ');
    });
  });

  describe('parseJsonLd', () => {
    it('should parse valid JSON-LD', () => {
      const jsonLdString = '{"@context":"https://schema.org","@type":"BlogPosting"}';
      const result = parseJsonLd(jsonLdString);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveProperty('@context');
      }
    });

    it('should return error for invalid JSON-LD', () => {
      const invalidJson = '{"@context":"https://schema.org",';
      const result = parseJsonLd(invalidJson);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeTruthy();
        expect(result.line).toBeGreaterThan(0);
      }
    });
  });
});
