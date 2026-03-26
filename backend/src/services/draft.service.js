import { Draft } from '../models/draft.model.js';
import { generateSeoDraftFromSource } from './ai.service.js';
import { env } from '../config/env.js';
import { slugify } from '../utils/slugify.js';

function uniqueSlug(base) {
  const suffix = Date.now().toString().slice(-6);
  return `${slugify(base)}-${suffix}`;
}

function sourceHasChinaUsSignal(source = {}) {
  const tags = Array.isArray(source.tags) ? source.tags.map((t) => String(t).toLowerCase()) : [];
  if (tags.includes('china-vs-us') || tags.includes('china-us-pair') || tags.includes('tech-war')) return true;
  if (String(source.countryFocus || '').toUpperCase() === 'US,CN') return true;

  const text = `${source.title || ''} ${source.summary || ''}`.toLowerCase();
  const chinaSignal = /(china|chinese|huawei|alibaba|deepseek|qwen|beijing|smic)/.test(text);
  const usSignal = /(u\.s\.|united states|america|openai|google|microsoft|nvidia|anthropic)/.test(text);
  return chinaSignal && usSignal;
}

function draftIsChinaUs(draft = {}) {
  const tags = Array.isArray(draft.tags) ? draft.tags.map((t) => String(t).toLowerCase()) : [];
  return tags.includes('china-vs-us') || tags.includes('china-us-pair') || tags.includes('tech-war');
}

async function canCreateChinaUsDraft() {
  const ratioEvery = Math.max(3, Number(env.chinaUsRatioEvery || 5));
  const recent = await Draft.find({})
    .sort({ createdAt: -1 })
    .limit(ratioEvery - 1)
    .select('tags category')
    .lean();

  if (!recent.length) return true;
  return !recent.some(draftIsChinaUs);
}

function normalizeTopicText(value = '') {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function topicTokens(value = '') {
  const stop = new Set([
    'the', 'a', 'an', 'and', 'or', 'for', 'with', 'from', 'into', 'about', 'latest',
    'guide', 'tools', 'tool', 'your', 'this', 'that', 'how', 'what', 'why', 'who',
    'can', 'use', 'using', 'users', 'new', 'best', 'vs', 'versus', 'ai', 'in', 'on',
    'to', 'of', 'is', 'are', 'by', 'at', 'as', 'it'
  ]);
  return normalizeTopicText(value)
    .split(' ')
    .filter((token) => token.length > 2 && !stop.has(token));
}

function jaccardScore(aTokens = [], bTokens = []) {
  const a = new Set(aTokens);
  const b = new Set(bTokens);
  if (!a.size || !b.size) return 0;
  let intersection = 0;
  for (const t of a) {
    if (b.has(t)) intersection += 1;
  }
  const union = new Set([...a, ...b]).size;
  return union ? intersection / union : 0;
}

async function isDuplicateLikeDraft(candidateTitle, candidateKeyword = '') {
  const candidateTokens = topicTokens(`${candidateTitle} ${candidateKeyword}`);
  if (!candidateTokens.length) return false;

  const recentDrafts = await Draft.find({})
    .sort({ createdAt: -1 })
    .limit(80)
    .select('title focusKeyword')
    .lean();

  for (const draft of recentDrafts) {
    const draftTokens = topicTokens(`${draft.title || ''} ${draft.focusKeyword || ''}`);
    const score = jaccardScore(candidateTokens, draftTokens);
    if (score >= 0.72) return true;
  }

  return false;
}

export async function createDraftFromSource(source, author) {
  const existingForSource = await Draft.findOne({ sourceId: source._id }).lean();
  if (existingForSource) return null;

  const chinaUsSource = sourceHasChinaUsSignal(source);
  if (chinaUsSource) {
    const allowedByCadence = await canCreateChinaUsDraft();
    if (!allowedByCadence) return null;
  }

  const gen = await generateSeoDraftFromSource(source);
  const normalizedTitle = String(gen.title || '').trim();
  if (!normalizedTitle) return null;

  const exactTitleExists = await Draft.findOne({ title: new RegExp(`^${normalizedTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }).lean();
  if (exactTitleExists) return null;

  const duplicateLike = await isDuplicateLikeDraft(normalizedTitle, gen.focusKeyword || '');
  if (duplicateLike) return null;

  let slug = gen.slug || slugify(normalizedTitle);
  let slugExists = await Draft.findOne({ slug }).lean();
  while (slugExists) {
    slug = uniqueSlug(slug);
    slugExists = await Draft.findOne({ slug }).lean();
  }

  let mergedTags = Array.from(new Set([...(source.tags || []), 'ai-tools']));
  if (!chinaUsSource) {
    mergedTags = mergedTags.filter((tag) => !['china-vs-us', 'china-us-pair', 'tech-war'].includes(tag));
  }

  const draft = await Draft.create({
    sourceId: source._id,
    title: normalizedTitle,
    slug,
    metaDescription: gen.metaDescription,
    excerpt: gen.excerpt,
    slogan: gen.slogan,
    contentMarkdown: gen.contentMarkdown,
    imagePrompt: gen.imagePrompt,
    tags: mergedTags,
    category: gen.category || 'AI Tools',
    focusKeyword: gen.focusKeyword || '',
    readingTime: gen.readingTime || 4,
    focusRegion: env.targetFocusRegion,
    sourceCitations: source.link ? [source.link] : [],
    qaChecklist: {
      factsVerified: false,
      citationsAdded: false,
      originalityChecked: false,
      audienceFitChecked: false
    },
    author,
    status: 'draft'
  });

  return draft;
}
