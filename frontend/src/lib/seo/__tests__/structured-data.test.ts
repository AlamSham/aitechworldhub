/**
 * Unit tests for Structured Data Generator
 */

import {
  generateBlogPosting,
  generateArticle,
  generatePerson,
  generateBreadcrumb,
  generateWebSite,
  generateCollectionPage,
  generateFAQPage,
  generateHowTo,
  generateImageObject,
  generateOrganization,
  validateSchema,
  minifyJsonLd,
  formatJsonLd,
  parseJsonLd,
  type PublishedPost,
  type Author,
  type TopicHub,
  type ImageData,
} from '../structured-data';

// Mock data
const mockPost: PublishedPost = {
  _id: '123',
  title: 'Test Post About AI',
  slug: 'test-post-about-ai',
  excerpt: 'This is a test post about artificial intelligence and machine learning.',
  content: 'Full content here...',
  imageUrl: '/images/test-post.jpg',
  publishedAt: new Date('2024-01-15T10:00:00Z'),
  updatedAt: new Date('2024-01-20T15:30:00Z'),
  createdAt: new Date('2024-01-10T08:00:00Z'),
  author: {
    name: 'John Doe',
    slug: 'john-doe',
    bio: 'AI researcher and writer',
    imageUrl: '/images/john-doe.jpg',
  },
  category: 'Machine Learning',
  tags: ['AI', 'Machine Learning', 'Neural Networks'],
  focusKeyword: 'artificial intelligence',
  wordCount: 1500,
};

const mockAuthor: Author = {
  name: 'Jane Smith',
  slug: 'jane-smith',
  bio: 'Expert in AI and machine learning',
  imageUrl: '/images/jane-smith.jpg',
  jobTitle: 'AI Researcher',
  expertise: ['Machine Learning', 'Deep Learning', 'NLP'],
  socialLinks: {
    twitter: 'https://twitter.com/janesmith',
    linkedin: 'https://linkedin.com/in/janesmith',
    github: 'https://github.com/janesmith',
  },
};

const mockTopicHub: TopicHub = {
  title: 'Machine Learning',
  slug: 'machine-learning',
  description: 'Explore the latest in machine learning technology',
  posts: [
    { title: 'Introduction to ML', slug: 'intro-to-ml' },
    { title: 'Advanced ML Techniques', slug: 'advanced-ml' },
  ],
};

describe('Schema Generators', () => {
  describe('generateBlogPosting', () => {
    it('should generate complete BlogPosting schema', () => {
      const schema = generateBlogPosting(mockPost);
      
      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('BlogPosting');
      expect(schema.headline).toBe('Test Post About AI');
      expect(schema.description).toBe('This is a test post about artificial intelligence and machine learning.');
      expect(schema.author).toBeDefined();
      expect(schema.publisher).toBeDefined();
      expect(schema.mainEntityOfPage).toBeDefined();
      expect(schema.isAccessibleForFree).toBe(true);
    });

    it('should include optional properties when available', () => {
      const schema = generateBlogPosting(mockPost);
      
      expect(schema.image).toBeDefined();
      expect(schema.datePublished).toBeDefined();
      expect(schema.dateModified).toBeDefined();
      expect(schema.articleSection).toBe('Machine Learning');
      expect(schema.keywords).toEqual(['AI', 'Machine Learning', 'Neural Networks']);
      expect(schema.wordCount).toBe(1500);
    });

    it('should handle missing optional properties gracefully', () => {
      const minimalPost: PublishedPost = {
        ...mockPost,
        imageUrl: undefined,
        publishedAt: undefined,
        updatedAt: undefined,
        category: undefined,
        tags: undefined,
        wordCount: undefined,
      };
      
      const schema = generateBlogPosting(minimalPost);
      
      expect(schema['@type']).toBe('BlogPosting');
      expect(schema.headline).toBeDefined();
      expect(schema.image).toBeUndefined();
      expect(schema.datePublished).toBeUndefined();
    });

    it('should escape special characters in text fields', () => {
      const postWithSpecialChars: PublishedPost = {
        ...mockPost,
        title: 'Test "Post" with\nSpecial Characters',
        excerpt: 'Description with "quotes" and\nnewlines',
      };
      
      const schema = generateBlogPosting(postWithSpecialChars);
      
      expect(schema.headline).toContain('\\"');
      expect(schema.headline).toContain('\\n');
      expect(schema.description).toContain('\\"');
    });
  });

  describe('generateArticle', () => {
    it('should generate complete Article schema', () => {
      const schema = generateArticle(mockPost);
      
      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('Article');
      expect(schema.headline).toBe('Test Post About AI');
      expect(schema.author).toBeDefined();
      expect(schema.publisher).toBeDefined();
    });
  });

  describe('generatePerson', () => {
    it('should generate complete Person schema', () => {
      const schema = generatePerson(mockAuthor);
      
      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('Person');
      expect(schema.name).toBe('Jane Smith');
      expect(schema.url).toContain('/authors/jane-smith');
      expect(schema.jobTitle).toBe('AI Researcher');
      expect(schema.description).toBe('Expert in AI and machine learning');
    });

    it('should include social links in sameAs', () => {
      const schema = generatePerson(mockAuthor);
      
      expect(schema.sameAs).toBeDefined();
      expect(schema.sameAs).toContain('https://twitter.com/janesmith');
      expect(schema.sameAs).toContain('https://linkedin.com/in/janesmith');
      expect(schema.sameAs).toContain('https://github.com/janesmith');
    });

    it('should handle missing optional properties', () => {
      const minimalAuthor: Author = {
        name: 'John Doe',
        slug: 'john-doe',
      };
      
      const schema = generatePerson(minimalAuthor);
      
      expect(schema.name).toBe('John Doe');
      expect(schema.jobTitle).toBeUndefined();
      expect(schema.sameAs).toBeUndefined();
    });
  });

  describe('generateBreadcrumb', () => {
    it('should generate BreadcrumbList schema', () => {
      const items = [
        { name: 'Home', path: '/' },
        { name: 'Posts', path: '/posts' },
        { name: 'Test Post', path: '/posts/test-post' },
      ];
      
      const schema = generateBreadcrumb(items);
      
      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('BreadcrumbList');
      expect(schema.itemListElement).toHaveLength(3);
      expect(schema.itemListElement[0].position).toBe(1);
      expect(schema.itemListElement[0].name).toBe('Home');
      expect(schema.itemListElement[2].position).toBe(3);
    });
  });

  describe('generateWebSite', () => {
    it('should generate WebSite schema with search action', () => {
      const schema = generateWebSite();
      
      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('WebSite');
      expect(schema.name).toBeDefined();
      expect(schema.url).toBeDefined();
      expect(schema.publisher).toBeDefined();
      expect(schema.potentialAction).toBeDefined();
      expect(schema.potentialAction?.['@type']).toBe('SearchAction');
    });
  });

  describe('generateCollectionPage', () => {
    it('should generate CollectionPage schema', () => {
      const schema = generateCollectionPage(mockTopicHub);
      
      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('CollectionPage');
      expect(schema.name).toBe('Machine Learning');
      expect(schema.description).toBe('Explore the latest in machine learning technology');
      expect(schema.url).toContain('/topics/machine-learning');
    });

    it('should include hasPart with related posts', () => {
      const schema = generateCollectionPage(mockTopicHub);
      
      expect(schema.hasPart).toBeDefined();
      expect(schema.hasPart).toHaveLength(2);
      expect(schema.hasPart?.[0]['@type']).toBe('BlogPosting');
      expect(schema.hasPart?.[0].headline).toBe('Introduction to ML');
    });
  });

  describe('generateFAQPage', () => {
    it('should generate FAQPage schema', () => {
      const faqs = [
        { question: 'What is AI?', answer: 'Artificial Intelligence is...' },
        { question: 'How does ML work?', answer: 'Machine Learning works by...' },
      ];
      
      const schema = generateFAQPage(faqs);
      
      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('FAQPage');
      expect(schema.mainEntity).toHaveLength(2);
      expect(schema.mainEntity[0]['@type']).toBe('Question');
      expect(schema.mainEntity[0].name).toBe('What is AI?');
      expect(schema.mainEntity[0].acceptedAnswer['@type']).toBe('Answer');
    });
  });

  describe('generateHowTo', () => {
    it('should generate HowTo schema', () => {
      const howToData = {
        name: 'How to Train a Neural Network',
        description: 'Step-by-step guide',
        steps: [
          { name: 'Prepare Data', text: 'Clean your dataset' },
          { name: 'Build Model', text: 'Define architecture' },
        ],
        totalTime: 'PT2H',
        tools: ['Python', 'TensorFlow'],
      };
      
      const schema = generateHowTo(howToData);
      
      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('HowTo');
      expect(schema.name).toBe('How to Train a Neural Network');
      expect(schema.step).toHaveLength(2);
      expect(schema.step[0]['@type']).toBe('HowToStep');
      expect(schema.totalTime).toBe('PT2H');
      expect(schema.tool).toEqual(['Python', 'TensorFlow']);
    });
  });

  describe('generateImageObject', () => {
    it('should generate ImageObject schema', () => {
      const imageData: ImageData = {
        url: '/images/test.jpg',
        caption: 'Test image',
        width: 1200,
        height: 630,
        format: 'image/jpeg',
      };
      
      const schema = generateImageObject(imageData);
      
      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('ImageObject');
      expect(schema.contentUrl).toContain('/images/test.jpg');
      expect(schema.caption).toBe('Test image');
      expect(schema.width).toBe(1200);
      expect(schema.height).toBe(630);
    });
  });

  describe('generateOrganization', () => {
    it('should generate Organization schema', () => {
      const schema = generateOrganization();
      
      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('Organization');
      expect(schema.name).toBeDefined();
      expect(schema.url).toBeDefined();
      expect(schema.logo).toBeDefined();
      expect(schema.logo['@type']).toBe('ImageObject');
    });

    it('should include social profiles in sameAs', () => {
      const schema = generateOrganization();
      
      expect(schema.sameAs).toBeDefined();
      expect(schema.sameAs!.length).toBeGreaterThan(0);
    });
  });
});

describe('Schema Validation', () => {
  describe('validateSchema', () => {
    it('should validate correct BlogPosting schema', () => {
      const schema = generateBlogPosting(mockPost);
      const result = validateSchema(schema);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing @context', () => {
      const invalidSchema = {
        '@type': 'BlogPosting',
        headline: 'Test',
      };
      
      const result = validateSchema(invalidSchema);
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.property === '@context')).toBe(true);
    });

    it('should detect missing @type', () => {
      const invalidSchema = {
        '@context': 'https://schema.org',
        headline: 'Test',
      };
      
      const result = validateSchema(invalidSchema);
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.property === '@type')).toBe(true);
    });

    it('should detect missing required properties for BlogPosting', () => {
      const invalidSchema = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: 'Test',
        // Missing: description, author, publisher, mainEntityOfPage, isAccessibleForFree
      };
      
      const result = validateSchema(invalidSchema);
      
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should generate warnings for missing recommended properties', () => {
      const schemaWithoutImage = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: 'Test',
        description: 'Test description',
        author: { '@type': 'Person', name: 'John' },
        publisher: { '@type': 'Organization', name: 'Test' },
        mainEntityOfPage: { '@type': 'WebPage', '@id': 'https://example.com' },
        isAccessibleForFree: true,
        // Missing: image, datePublished (recommended)
      };
      
      const result = validateSchema(schemaWithoutImage);
      
      expect(result.valid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('should validate Person schema', () => {
      const schema = generatePerson(mockAuthor);
      const result = validateSchema(schema);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate BreadcrumbList schema', () => {
      const schema = generateBreadcrumb([
        { name: 'Home', path: '/' },
        { name: 'Posts', path: '/posts' },
      ]);
      const result = validateSchema(schema);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect empty itemListElement in BreadcrumbList', () => {
      const invalidSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [],
      };
      
      const result = validateSchema(invalidSchema);
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.property === 'itemListElement')).toBe(true);
    });
  });
});

describe('JSON-LD Utilities', () => {
  describe('minifyJsonLd', () => {
    it('should remove whitespace from schema', () => {
      const schema = generateBlogPosting(mockPost);
      const minified = minifyJsonLd(schema);
      
      expect(minified).not.toContain('\n');
      expect(minified).not.toContain('  ');
      expect(minified).toContain('"@context":"https://schema.org"');
    });

    it('should handle string input', () => {
      const jsonString = '{\n  "@context": "https://schema.org",\n  "@type": "BlogPosting"\n}';
      const minified = minifyJsonLd(jsonString);
      
      expect(minified).not.toContain('\n');
      expect(minified).toContain('"@context":"https://schema.org"');
    });
  });

  describe('formatJsonLd', () => {
    it('should format schema with indentation', () => {
      const schema = { '@context': 'https://schema.org', '@type': 'BlogPosting' };
      const formatted = formatJsonLd(schema);
      
      expect(formatted).toContain('\n');
      expect(formatted).toContain('  ');
    });

    it('should use custom indentation', () => {
      const schema = { '@context': 'https://schema.org' };
      const formatted = formatJsonLd(schema, 4);
      
      expect(formatted).toContain('    '); // 4 spaces
    });
  });

  describe('parseJsonLd', () => {
    it('should parse valid JSON-LD string', () => {
      const jsonString = '{"@context":"https://schema.org","@type":"BlogPosting"}';
      const result = parseJsonLd(jsonString);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveProperty('@context');
        expect(result.data).toHaveProperty('@type');
      }
    });

    it('should return error for invalid JSON', () => {
      const invalidJson = '{"@context":"https://schema.org",';
      const result = parseJsonLd(invalidJson);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeTruthy();
        expect(result.line).toBeGreaterThan(0);
        expect(result.column).toBeGreaterThan(0);
      }
    });

    it('should provide line and column for syntax errors', () => {
      const invalidJson = '{\n  "@context": "https://schema.org",\n  "@type": "BlogPosting",\n}';
      const result = parseJsonLd(invalidJson);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.line).toBeGreaterThan(0);
        expect(result.column).toBeGreaterThan(0);
      }
    });
  });

  describe('Round-trip parsing', () => {
    it('should preserve schema through format-parse-format cycle', () => {
      const schema = generateBlogPosting(mockPost);
      const formatted1 = formatJsonLd(schema);
      const parsed = parseJsonLd(formatted1);
      
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        const formatted2 = formatJsonLd(parsed.data);
        expect(formatted2).toBe(formatted1);
      }
    });
  });
});
