import { PublishedPost } from '../models/draft';
import { fetchPublishedPosts } from './api';

export type TopicHub = {
  slug: string;
  title: string;
  shortLabel: string;
  description: string;
  intro: string;
  keywords: string[];
};

export type AuthorProfile = {
  slug: string;
  name: string;
  role: string;
  description: string;
  bio: string[];
  expertise: string[];
};

export const TOPIC_HUBS: TopicHub[] = [
  {
    slug: 'openai',
    title: 'OpenAI Topic Hub',
    shortLabel: 'OpenAI',
    description:
      'Track ChatGPT, OpenAI API, Sora, model launches, safety updates, and product changes that matter for real-world AI adoption.',
    intro:
      'This hub groups our OpenAI coverage so readers can follow model launches, product updates, safety changes, and workflow implications from one place.',
    keywords: ['openai', 'chatgpt', 'sora', 'gpt', 'openai api'],
  },
  {
    slug: 'google-gemini',
    title: 'Google Gemini Topic Hub',
    shortLabel: 'Google Gemini',
    description:
      'Follow Google Gemini, Google AI product updates, workspace integrations, model releases, and ecosystem changes in one focused archive.',
    intro:
      'This hub is built for readers following Google Gemini, Google AI rollouts, and how Google is positioning its models and tools for practical use.',
    keywords: ['gemini', 'google ai', 'google gemini', 'google', 'veo', 'imagen'],
  },
  {
    slug: 'nvidia-ai',
    title: 'Nvidia AI Infrastructure Hub',
    shortLabel: 'Nvidia AI',
    description:
      'A focused hub for Nvidia AI chips, GPUs, data center infrastructure, supply chain shifts, and the broader compute race.',
    intro:
      'Use this hub to follow Nvidia-led AI infrastructure coverage, from chip launches and GPU strategy to enterprise implications and competitive pressure.',
    keywords: ['nvidia', 'gpu', 'chip', 'chips', 'blackwell', 'semiconductor', 'data center'],
  },
  {
    slug: 'china-vs-us-ai',
    title: 'China vs US AI Hub',
    shortLabel: 'China vs US AI',
    description:
      'A single place to track AI rivalry, policy moves, compute competition, model ecosystems, and strategic technology shifts across China and the US.',
    intro:
      'This hub focuses on AI competition between China and the United States, especially where policy, chips, models, and industrial strategy intersect.',
    keywords: ['china vs us', 'china-us', 'china', 'us', 'deepseek', 'qwen', 'huawei', 'policy', 'export control'],
  },
];

const AUTHOR_PROFILES: Record<string, Omit<AuthorProfile, 'slug' | 'name'>> = {
  shamshad: {
    role: 'Founder and Editor',
    description:
      'Covers practical AI tools, model updates, infrastructure shifts, and policy developments for readers who need clear signal over noise.',
    bio: [
      'Shamshad leads AITechWorldHub with a focus on making fast-moving AI developments easier to understand for professionals, founders, and teams.',
      'The editorial approach centers on practical relevance, source-backed analysis, and concise breakdowns of what changed, why it matters, and who should care.',
    ],
    expertise: ['Generative AI tools', 'AI infrastructure', 'Model launches', 'AI policy tracking'],
  },
};

function normalizeText(value = ''): string {
  return ` ${String(value || '').toLowerCase().replace(/\s+/g, ' ').trim()} `;
}

function getPublishedTimestamp(post: PublishedPost): number {
  return new Date(post.publishedAt || post.createdAt || 0).getTime();
}

export function slugifySegment(value = ''): string {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getAuthorSlug(name = 'AITechWorldHub Team'): string {
  return slugifySegment(name) || 'aitechworldhub-team';
}

export function getAuthorPath(name = 'AITechWorldHub Team'): string {
  return `/authors/${getAuthorSlug(name)}`;
}

export async function fetchAllPublishedPosts(revalidateSeconds = 300): Promise<PublishedPost[]> {
  const allPosts: PublishedPost[] = [];
  let page = 1;
  let hasNext = true;

  while (hasNext) {
    const { drafts, pagination } = await fetchPublishedPosts({
      page,
      limit: 50,
      revalidateSeconds,
    });
    allPosts.push(...drafts);
    hasNext = Boolean(pagination?.hasNext);
    page += 1;
    if (page > 100) break;
  }

  return allPosts;
}

export function getTopicHubBySlug(slug: string): TopicHub | null {
  return TOPIC_HUBS.find((hub) => hub.slug === slug) || null;
}

export function scorePostForTopic(post: PublishedPost, hub: TopicHub): number {
  const title = normalizeText(post.title);
  const excerpt = normalizeText(post.excerpt);
  const tags = normalizeText((post.tags || []).join(' '));
  const category = normalizeText(post.category || '');
  const focusKeyword = normalizeText(post.focusKeyword || '');

  return hub.keywords.reduce((score, keyword) => {
    const term = normalizeText(keyword);
    let nextScore = score;
    if (title.includes(term)) nextScore += 4;
    if (tags.includes(term) || category.includes(term) || focusKeyword.includes(term)) nextScore += 3;
    if (excerpt.includes(term)) nextScore += 1;
    return nextScore;
  }, 0);
}

export function getPostsForTopic(posts: PublishedPost[], hub: TopicHub): PublishedPost[] {
  return posts
    .map((post) => ({ post, score: scorePostForTopic(post, hub) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || getPublishedTimestamp(b.post) - getPublishedTimestamp(a.post))
    .map((entry) => entry.post);
}

export function getRelevantTopicHubsForPost(post: PublishedPost, limit = 3): TopicHub[] {
  return TOPIC_HUBS
    .map((hub) => ({ hub, score: scorePostForTopic(post, hub) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.hub);
}

export function getAllAuthors(posts: PublishedPost[]): Array<{ name: string; slug: string; count: number }> {
  const authorMap = new Map<string, { name: string; slug: string; count: number }>();

  for (const post of posts) {
    const name = String(post.author || 'AITechWorldHub Team').trim() || 'AITechWorldHub Team';
    const slug = getAuthorSlug(name);
    const existing = authorMap.get(slug);
    if (existing) {
      existing.count += 1;
    } else {
      authorMap.set(slug, { name, slug, count: 1 });
    }
  }

  return Array.from(authorMap.values()).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export function getAuthorNameFromSlug(posts: PublishedPost[], slug: string): string | null {
  const match = getAllAuthors(posts).find((author) => author.slug === slug);
  return match?.name || null;
}

export function getPostsForAuthor(posts: PublishedPost[], authorSlug: string): PublishedPost[] {
  return posts
    .filter((post) => getAuthorSlug(post.author || 'AITechWorldHub Team') === authorSlug)
    .sort((a, b) => getPublishedTimestamp(b) - getPublishedTimestamp(a));
}

export function getAuthorProfile(authorSlug: string, authorName: string): AuthorProfile {
  const knownProfile = AUTHOR_PROFILES[authorSlug];

  if (knownProfile) {
    return {
      slug: authorSlug,
      name: authorName,
      ...knownProfile,
    };
  }

  return {
    slug: authorSlug,
    name: authorName,
    role: 'Contributing Author',
    description:
      'Writes and curates AI coverage for AITechWorldHub with a focus on clarity, source transparency, and practical relevance.',
    bio: [
      `${authorName} contributes to AITechWorldHub by covering developments that matter for readers tracking AI tools, policy, and infrastructure.`,
      'Published articles are intended to be source-backed, readable, and useful for professionals who want signal instead of recycled noise.',
    ],
    expertise: ['AI news analysis', 'Workflow explainers', 'Product update coverage'],
  };
}
