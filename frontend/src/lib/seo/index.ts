/**
 * SEO Module Entry Point
 * 
 * Exports all SEO-related functionality for use throughout the application.
 */

// Configuration
export { SEO_CONFIG, getFullUrl, getDefaultImageUrl, meetsImageRequirements } from '../seo-config';
export type { SEOConfig, ChangeFreq, TwitterCardType, RobotsDirective } from '../seo-config';

// Utilities
export {
  // URL utilities
  normalizeUrl,
  isAbsoluteUrl,
  isHttpsUrl,
  encodeUrlComponent,
  
  // Date utilities
  formatDateISO,
  formatDateTimeISO,
  isFutureDate,
  isWithinLastDays,
  selectMostRecentDate,
  
  // String utilities
  escapeJsonLd,
  escapeHtmlAttribute,
  stripHtmlTags,
  stripMarkdown,
  truncateText,
  
  // Validation utilities
  isInRange,
  isValidChangefreq,
  isValidPriority,
  isValidISODate,
  validateImageDimensions,
  
  // JSON-LD utilities
  minifyJsonLd,
  formatJsonLd,
  parseJsonLd,
  
  // Performance utilities
  measureExecutionTime,
  isWithinPerformanceThreshold,
  
  // Array utilities
  uniqueArray,
  chunkArray,
  
  // Error utilities
  createErrorLog,
  createWarningLog,
} from './utils';

// Structured Data Generators
export {
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
} from './structured-data';

export type {
  PublishedPost,
  Author,
  TopicHub as TopicHubData,
  ImageData,
} from './structured-data';

// Metadata Generators
export {
  generateOpenGraph,
  generateTwitterCard,
  generateCanonicalUrl,
  generateHreflangTags,
  generateMetaDescription,
  generateMetaKeywords,
  generateRobotsTag,
  validateImageDimensionsSync,
  validateImageDimensionsAsync,
  generateCompleteMetadata,
} from './metadata';

export type {
  PublishedPost as MetadataPublishedPost,
} from './metadata';

// Types
export type {
  // Schema types
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
  SchemaType,
  
  // Metadata types
  OpenGraphMetadata,
  TwitterCardMetadata,
  HreflangTag,
  RobotsOptions,
  ImageValidation,
  
  // Sitemap types
  SitemapEntry,
  NewsSitemapEntry,
  ImageSitemapEntry,
  SitemapIndexEntry,
  
  // Validation types
  ValidationResult,
  ValidationError,
  ValidationWarning,
  SitemapValidationResult,
  SitemapError,
  SitemapWarning,
  UrlValidationResult,
  ParseError,
  
  // Internal linking types
  RelatedPost,
  ContextualLink,
  TopicHub,
  
  // Search console types
  SubmissionResult,
  IndexingResult,
  SubmissionRecord,
  RetryResult,
  
  // Monitoring types
  SearchConsoleData,
  PagePerformance,
  IndexingRate,
  UnindexedPage,
  StructuredDataReport,
  StructuredDataError,
  StructuredDataWarning,
  BrokenLink,
  MetadataIssue,
  SEOReport,
  
  // Robots.txt types
  RobotsTxtConfig,
  RobotsRule,
  
  // Cache types
  InternalLinksCache,
  SchemaValidationCache,
} from '../../types/seo';
