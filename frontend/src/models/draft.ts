export type DraftStatus = 'draft' | 'reviewed' | 'published';

export type Draft = {
  _id: string;
  title: string;
  slug: string;
  metaDescription: string;
  excerpt: string;
  slogan: string;
  contentMarkdown: string;
  imageUrl: string;
  imagePublicId?: string;
  imagePrompt: string;
  tags: string[];
  category?: string;
  focusKeyword?: string;
  readingTime?: number;
  focusRegion?: string;
  status: DraftStatus;
  author?: string;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PublishedPost = {
  _id?: string;
  title: string;
  slug: string;
  excerpt: string;
  metaDescription: string;
  slogan?: string;
  contentMarkdown?: string;
  imageUrl?: string;
  tags?: string[];
  category?: string;
  focusKeyword?: string;
  readingTime?: number;
  author?: string;
  publishedAt?: string | null;
  createdAt?: string;
};

export type AdminUser = {
  id: string;
  email: string;
  fullName: string;
  role: 'admin';
  lastLoginAt?: string | null;
};
