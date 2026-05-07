/**
 * Unit Tests for Metadata Manager
 * 
 * Tests all metadata generation functions including Open Graph,
 * Twitter Cards, canonical URLs, meta descriptions, keywords, and robots tags.
 */

import {
  generateOpenGraph,
  generateTwitterCard,
  generateCanonicalUrl,
  generateHreflangTags,
  generateMetaDescription,
  generateMetaKeywords,
  generateRobotsTag,
  validateImageDimensionsSync,
  generateCompleteMetadata,
  type PublishedPost,
} from '../metadata';

// Mock SEO_CONFIG
jest.mock('../../seo-config', () => ({
  SEO_CONFIG: {
    siteName: 'AITechWorldHub',
    siteUrl: 'https://aitechworldhub.com',
    defaultImage: '/images/default-og-image.jpg',
    organization: {
      name: 'AITechWorldHub',
      email: 'contact@aitechworldhub.com',
      logo: '/images/logo.png',
      description: 'Your trusted source for AI technology news',
    },
    socialProfiles: {
      twitter: '@aitechworldhub',
      facebook: 'https://facebook.com/aitechworldhub',
      linkedin: 'https://linkedin.com/company/aitechworldhub',
      github: 'https://github.com/aitechworldhub',
    },
    metadata: {
      descriptionMinLength: 150,
      descriptionMaxLength: 160,
      ogImageMinWidth: 1200,
      ogImageMinHeight: 630,
      twitterCard: 'summary_large_image' as const,
    },
  },
}));

// Helper function to create mock post
function createMockPost(overrides?: Partial<PublishedPost>): PublishedPost {
  return {
    _id: '123',
    title: 'Test Blog Post',
    slug: 'test-blog-post',
    excerpt: 'This is a test excerpt for the blog post.',
    content: 'Full content of the blog post...',
    imageUrl: 'https://example.com/image.jpg',
    publishedAt: new Date('2024-01-15T10:00:00Z'),
    updatedAt: new Date('2024-01-16T12:00:00Z'),
    author: {
      name: 'John Doe',
      slug: 'john-doe',
    },
    category: 'AI Technology',
    tags: ['artificial intelligence', 'machine learning', 'neural networks'],
    focusKeyword: 'AI technology',
    ...overrides,
  };
}

describe('Metadata Manager', () => {
  describe('generateOpenGraph', () => {
    it('generates complete Open Graph metadata for a blog post', () => {
      const post = createMockPost();
      const og = generateOpenGraph(post);
      
      expect(og['og:title']).toBe('Test Blog Post');
      expect(og['og:description']).toBe('This is a test excerpt for the blog post.');
      expect(og['og:url']).toBe('https://aitechworldhub.com/posts/test-blog-post');
      expect(og['og:type']).toBe('article');
      expect(og['og:image']).toBe('https://example.com/image.jpg');
      expect(og['og:site_name']).toBe('AITechWorldHub');
      expect(og['og:locale']).toBe('en_US');
    });
    
    it('includes article-specific properties', () => {
      const post = createMockPost();
      const og = generateOpenGraph(post);
      
      expect(og['og:article:published_time']).toBe('2024-01-15T10:00:00.000Z');
      expect(og['og:article:modified_time']).toBe('2024-01-16T12:00:00.000Z');
      expect(og['og:article:author']).toBe('John Doe');
      expect(og['og:article:section']).toBe('AI Technology');
      expect(og['og:article:tag']).toEqual([
        'artificial intelligence',
        'machine learning',
        'neural networks',
      ]);
    });
    
    it('uses default image when post has no image', () => {
      const post = createMockPost({ imageUrl: undefined });
      const og = generateOpenGraph(post);
      
      expect(og['og:image']).toBe('https://aitechworldhub.com/images/default-og-image.jpg');
    });
    
    it('handles missing optional properties gracefully', () => {
      const post = createMockPost({
        publishedAt: undefined,
        updatedAt: undefined,
        author: undefined,
        category: undefined,
        tags: undefined,
      });
      const og = generateOpenGraph(post);
      
      expect(og['og:title']).toBe('Test Blog Post');
      expect(og['og:description']).toBe('This is a test excerpt for the blog post.');
      expect(og['og:article:published_time']).toBeUndefined();
      expect(og['og:article:modified_time']).toBeUndefined();
      expect(og['og:article:author']).toBeUndefined();
      expect(og['og:article:section']).toBeUndefined();
      expect(og['og:article:tag']).toBeUndefined();
    });
    
    it('escapes special characters in metadata', () => {
      const post = createMockPost({
        title: 'Test & "Special" <Characters>',
        excerpt: 'Excerpt with & and "quotes"',
      });
      const og = generateOpenGraph(post);
      
      expect(og['og:title']).toBe('Test &amp; &quot;Special&quot; &lt;Characters&gt;');
      expect(og['og:description']).toBe('Excerpt with &amp; and &quot;quotes&quot;');
    });
  });
  
  describe('generateTwitterCard', () => {
    it('generates complete Twitter Card metadata', () => {
      const post = createMockPost();
      const twitter = generateTwitterCard(post);
      
      expect(twitter['twitter:card']).toBe('summary_large_image');
      expect(twitter['twitter:title']).toBe('Test Blog Post');
      expect(twitter['twitter:description']).toBe('This is a test excerpt for the blog post.');
      expect(twitter['twitter:image']).toBe('https://example.com/image.jpg');
      expect(twitter['twitter:site']).toBe('@aitechworldhub');
    });
    
    it('uses default image when post has no image', () => {
      const post = createMockPost({ imageUrl: undefined });
      const twitter = generateTwitterCard(post);
      
      expect(twitter['twitter:image']).toBe('https://aitechworldhub.com/images/default-og-image.jpg');
    });
    
    it('includes creator handle when author is present', () => {
      const post = createMockPost();
      const twitter = generateTwitterCard(post);
      
      expect(twitter['twitter:creator']).toBe('@aitechworldhub');
    });
    
    it('escapes special characters in metadata', () => {
      const post = createMockPost({
        title: 'Test & "Special" <Characters>',
        excerpt: 'Excerpt with & and "quotes"',
      });
      const twitter = generateTwitterCard(post);
      
      expect(twitter['twitter:title']).toBe('Test &amp; &quot;Special&quot; &lt;Characters&gt;');
      expect(twitter['twitter:description']).toBe('Excerpt with &amp; and &quot;quotes&quot;');
    });
  });
  
  describe('generateCanonicalUrl', () => {
    it('generates absolute HTTPS URL', () => {
      const url = generateCanonicalUrl('/posts/my-post');
      expect(url).toBe('https://aitechworldhub.com/posts/my-post');
    });
    
    it('removes trailing slashes', () => {
      const url = generateCanonicalUrl('/posts/my-post/');
      expect(url).toBe('https://aitechworldhub.com/posts/my-post');
    });
    
    it('handles paths without leading slash', () => {
      const url = generateCanonicalUrl('posts/my-post');
      expect(url).toBe('https://aitechworldhub.com/posts/my-post');
    });
    
    it('handles root path', () => {
      const url = generateCanonicalUrl('/');
      expect(url).toBe('https://aitechworldhub.com/');
    });
  });
  
  describe('generateHreflangTags', () => {
    it('generates hreflang tags for multiple locales', () => {
      const tags = generateHreflangTags('/posts/my-post', ['en', 'es', 'fr']);
      
      expect(tags).toEqual([
        { hreflang: 'en', href: 'https://aitechworldhub.com/en/posts/my-post' },
        { hreflang: 'es', href: 'https://aitechworldhub.com/es/posts/my-post' },
        { hreflang: 'fr', href: 'https://aitechworldhub.com/fr/posts/my-post' },
      ]);
    });
    
    it('handles empty locale array', () => {
      const tags = generateHreflangTags('/posts/my-post', []);
      expect(tags).toEqual([]);
    });
  });
  
  describe('generateMetaDescription', () => {
    it('returns text as-is when within 150-160 character range', () => {
      const text = 'a'.repeat(155);
      const description = generateMetaDescription(text);
      expect(description).toBe(text);
      expect(description.length).toBe(155);
    });
    
    it('truncates long text to 150-160 characters', () => {
      const text = 'This is a very long text that exceeds the maximum length for meta descriptions and needs to be truncated to fit within the optimal range for search engine display.';
      const description = generateMetaDescription(text);
      
      expect(description.length).toBeGreaterThanOrEqual(150);
      expect(description.length).toBeLessThanOrEqual(160);
      expect(description).toMatch(/\.\.\.$/); // ends with ellipsis
    });
    
    it('preserves word boundaries when truncating', () => {
      const text = 'This is a very long text that exceeds the maximum length for meta descriptions and needs to be truncated to fit within the optimal range for search engine display.';
      const description = generateMetaDescription(text);
      
      // Should not cut mid-word
      expect(description).not.toMatch(/\w\.\.\.$/);
      expect(description).toMatch(/\s\.\.\.$/);
    });
    
    it('returns short text as-is', () => {
      const text = 'Short text';
      const description = generateMetaDescription(text);
      expect(description).toBe('Short text');
    });
    
    it('strips HTML tags', () => {
      const text = '<p>This is <strong>HTML</strong> content with <a href="#">links</a>.</p>';
      const description = generateMetaDescription(text);
      expect(description).toBe('This is HTML content with links.');
    });
    
    it('strips Markdown formatting', () => {
      const text = '# Heading\n\nThis is **bold** and *italic* text with [links](url).';
      const description = generateMetaDescription(text);
      expect(description).toBe('Heading This is bold and italic text with links.');
    });
    
    it('removes extra whitespace', () => {
      const text = 'This   has    extra     whitespace';
      const description = generateMetaDescription(text);
      expect(description).toBe('This has extra whitespace');
    });
  });
  
  describe('generateMetaKeywords', () => {
    it('generates keywords from focus keyword and tags', () => {
      const post = createMockPost();
      const keywords = generateMetaKeywords(post);
      
      expect(keywords).toBe('AI technology, artificial intelligence, machine learning, neural networks');
    });
    
    it('prioritizes focus keyword first', () => {
      const post = createMockPost();
      const keywords = generateMetaKeywords(post);
      
      expect(keywords.startsWith('AI technology')).toBe(true);
    });
    
    it('handles missing focus keyword', () => {
      const post = createMockPost({ focusKeyword: undefined });
      const keywords = generateMetaKeywords(post);
      
      expect(keywords).toBe('artificial intelligence, machine learning, neural networks');
    });
    
    it('handles missing tags', () => {
      const post = createMockPost({ tags: undefined });
      const keywords = generateMetaKeywords(post);
      
      expect(keywords).toBe('AI technology');
    });
    
    it('handles missing both focus keyword and tags', () => {
      const post = createMockPost({ focusKeyword: undefined, tags: undefined });
      const keywords = generateMetaKeywords(post);
      
      expect(keywords).toBe('');
    });
    
    it('removes duplicate keywords', () => {
      const post = createMockPost({
        focusKeyword: 'AI',
        tags: ['AI', 'machine learning', 'AI'],
      });
      const keywords = generateMetaKeywords(post);
      
      expect(keywords).toBe('AI, machine learning');
    });
    
    it('escapes special characters', () => {
      const post = createMockPost({
        focusKeyword: 'AI & ML',
        tags: ['<tag>', '"quoted"'],
      });
      const keywords = generateMetaKeywords(post);
      
      expect(keywords).toContain('&amp;');
      expect(keywords).toContain('&lt;');
      expect(keywords).toContain('&quot;');
    });
  });
  
  describe('generateRobotsTag', () => {
    it('generates default robots tag', () => {
      const robots = generateRobotsTag();
      
      expect(robots).toBe('index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    });
    
    it('respects index option', () => {
      const robots = generateRobotsTag({ index: false });
      expect(robots).toContain('noindex');
      expect(robots).not.toContain('index,');
    });
    
    it('respects follow option', () => {
      const robots = generateRobotsTag({ follow: false });
      expect(robots).toContain('nofollow');
      expect(robots).not.toContain('follow,');
    });
    
    it('respects maxImagePreview option', () => {
      const robots = generateRobotsTag({ maxImagePreview: 'standard' });
      expect(robots).toContain('max-image-preview:standard');
    });
    
    it('respects maxSnippet option', () => {
      const robots = generateRobotsTag({ maxSnippet: 100 });
      expect(robots).toContain('max-snippet:100');
    });
    
    it('respects maxVideoPreview option', () => {
      const robots = generateRobotsTag({ maxVideoPreview: 30 });
      expect(robots).toContain('max-video-preview:30');
    });
    
    it('handles all options together', () => {
      const robots = generateRobotsTag({
        index: false,
        follow: false,
        maxImagePreview: 'none',
        maxSnippet: 0,
        maxVideoPreview: 0,
      });
      
      expect(robots).toBe('noindex, nofollow, max-image-preview:none, max-snippet:0, max-video-preview:0');
    });
  });
  
  describe('validateImageDimensionsSync', () => {
    it('validates dimensions that meet requirements', () => {
      const validation = validateImageDimensionsSync(1200, 630);
      
      expect(validation.valid).toBe(true);
      expect(validation.width).toBe(1200);
      expect(validation.height).toBe(630);
      expect(validation.meetsRequirements).toBe(true);
    });
    
    it('validates dimensions that exceed requirements', () => {
      const validation = validateImageDimensionsSync(1920, 1080);
      
      expect(validation.valid).toBe(true);
      expect(validation.width).toBe(1920);
      expect(validation.height).toBe(1080);
      expect(validation.meetsRequirements).toBe(true);
    });
    
    it('identifies dimensions that do not meet requirements', () => {
      const validation = validateImageDimensionsSync(800, 400);
      
      expect(validation.valid).toBe(true);
      expect(validation.width).toBe(800);
      expect(validation.height).toBe(400);
      expect(validation.meetsRequirements).toBe(false);
    });
    
    it('identifies dimensions with insufficient width', () => {
      const validation = validateImageDimensionsSync(1000, 630);
      
      expect(validation.meetsRequirements).toBe(false);
    });
    
    it('identifies dimensions with insufficient height', () => {
      const validation = validateImageDimensionsSync(1200, 500);
      
      expect(validation.meetsRequirements).toBe(false);
    });
  });
  
  describe('generateCompleteMetadata', () => {
    it('generates all metadata types at once', () => {
      const post = createMockPost();
      const metadata = generateCompleteMetadata(post);
      
      expect(metadata.openGraph).toBeDefined();
      expect(metadata.twitter).toBeDefined();
      expect(metadata.canonical).toBeDefined();
      expect(metadata.description).toBeDefined();
      expect(metadata.keywords).toBeDefined();
      expect(metadata.robots).toBeDefined();
    });
    
    it('generates consistent metadata across types', () => {
      const post = createMockPost();
      const metadata = generateCompleteMetadata(post);
      
      expect(metadata.openGraph['og:title']).toBe('Test Blog Post');
      expect(metadata.twitter['twitter:title']).toBe('Test Blog Post');
      expect(metadata.description).toBe('This is a test excerpt for the blog post.');
    });
  });
});
