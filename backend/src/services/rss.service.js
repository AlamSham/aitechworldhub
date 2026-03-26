import Parser from 'rss-parser';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { Source } from '../models/source.model.js';
import { env } from '../config/env.js';

const parser = new Parser({ timeout: 15000 });

const FEEDS = [
  // US & Global AI/Tech Sources
  { name: 'TechCrunch AI', url: 'https://techcrunch.com/tag/artificial-intelligence/feed/', country: 'US' },
  { name: 'VentureBeat AI', url: 'https://venturebeat.com/ai/feed/', country: 'US' },
  { name: 'MIT Tech Review AI', url: 'https://www.technologyreview.com/topic/artificial-intelligence/feed', country: 'US' },
  { name: 'NVIDIA Blog AI', url: 'https://blogs.nvidia.com/feed/', country: 'US' },
  { name: 'The Verge AI', url: 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml', country: 'US' },
  { name: 'Wired AI', url: 'https://www.wired.com/feed/tag/ai/latest/rss', country: 'US' },
  { name: 'Ars Technica AI', url: 'https://feeds.arstechnica.com/arstechnica/technology-lab', country: 'US' },
  { name: 'Reuters Tech', url: 'https://www.reuters.com/technology/rss', country: 'US' },
  { name: 'Tom\'s Hardware', url: 'https://www.tomshardware.com/feeds/all', country: 'US' },
  { name: 'AnandTech/Tom\'s Guide', url: 'https://www.tomsguide.com/feeds/all', country: 'US' },
  { name: 'Engadget AI', url: 'https://www.engadget.com/rss.xml', country: 'US' },
  { name: 'ZDNet AI', url: 'https://www.zdnet.com/topic/artificial-intelligence/rss.xml', country: 'US' },
  { name: 'SemiAnalysis', url: 'https://semianalysis.substack.com/feed', country: 'US' },
  { name: 'OpenAI News', url: 'https://openai.com/news/rss.xml', country: 'US' },
  { name: 'Anthropic News', url: 'https://www.anthropic.com/news/rss.xml', country: 'US' },
  // UK & Europe Startup/Enterprise AI Sources
  { name: 'BBC Technology', url: 'http://feeds.bbci.co.uk/news/technology/rss.xml', country: 'UK' },
  { name: 'The Guardian Technology', url: 'https://www.theguardian.com/technology/rss', country: 'UK' },
  { name: 'Financial Times Technology', url: 'https://www.ft.com/technology?format=rss', country: 'UK' },
  { name: 'Sifted', url: 'https://sifted.eu/feed', country: 'UK' },
  { name: 'UKTN', url: 'https://www.uktech.news/feed', country: 'UK' },
  // China-Focused Tech Sources
  { name: 'SCMP China Tech', url: 'https://www.scmp.com/rss/91/feed', country: 'CN' },
  { name: 'TechNode China', url: 'https://technode.com/feed/', country: 'CN' },
  { name: 'Pandaily China', url: 'https://pandaily.com/feed/', country: 'CN' }
];

const AI_KEYWORDS = [
  'artificial intelligence',
  ' ai ',
  'llm',
  'large language model',
  'foundation model',
  'agent',
  'chatbot',
  'genai',
  'generative ai',
  'multimodal',
  // US AI Models & Companies
  'openai',
  'gpt-4',
  'gpt-5',
  'chatgpt',
  'gemini',
  'google ai',
  'anthropic',
  'claude',
  'sonnet',
  'opus',
  'meta ai',
  'llama',
  'copilot',
  'microsoft ai',
  'mistral',
  'perplexity',
  'grok',
  'xai',
  // Google Video/Image AI
  'veo',
  'veo 3',
  'imagen',
  'sora',
  // Chinese AI Models & Companies
  'deepseek',
  'deepseek-v3',
  'deepseek-r1',
  'qwen',
  'kimi',
  'kimi 2',
  'moonshot ai',
  'baidu',
  'ernie',
  'zhipu',
  'glm',
  'alibaba cloud',
  'yi model',
  'minimax',
  'stepfun',
  'sensetime',
  'iflytek',
  // Chip & Hardware
  'nvidia',
  'h100',
  'h200',
  'b100',
  'b200',
  'gb200',
  'blackwell',
  'hopper',
  'cuda',
  'amd',
  'mi300',
  'intel gaudi',
  'tpu',
  'huawei ascend',
  'ascend 910',
  'tsmc',
  'smic',
  'semiconductor',
  'chip',
  'gpu'
];

const CHINA_US_TECH_WAR_KEYWORDS = [
  'china',
  'chinese',
  'u.s.',
  'united states',
  'america',
  'export control',
  'sanction',
  'trade war',
  'tech war',
  'chip war',
  'chip',
  'semiconductor',
  'nvidia',
  'h100',
  'h200',
  'h20',
  'blackwell',
  'huawei',
  'huawei ascend',
  'ascend 910',
  'smic',
  'tsmc',
  'tariff',
  'geopolitical',
  'decoupling',
  'entity list',
  'chips act',
  'ai race',
  'ai arms race',
  'compute power',
  'data center'
];

const CHINA_KEYWORDS = ['china', 'chinese', 'beijing', 'shanghai', 'huawei', 'alibaba', 'tencent', 'deepseek', 'qwen'];
const US_KEYWORDS = [
  'u.s.',
  'united states',
  'america',
  'american',
  'washington',
  'silicon valley',
  'openai',
  'google',
  'meta',
  'anthropic',
  'microsoft',
  'nvidia'
];
const COMPARISON_KEYWORDS = [' vs ', 'versus', 'compared to', 'comparison', 'race', 'rivalry', 'head-to-head'];
const GENERATIVE_KEYWORDS = [
  'generative ai',
  'genai',
  'text to image',
  'text to video',
  'ai video',
  'assistant',
  'agentic',
  'workflow',
  'automation',
  'prompt'
];
const POLICY_KEYWORDS = ['policy', 'regulation', 'compliance', 'export control', 'sanction', 'chips act', 'entity list'];
const CHIP_KEYWORDS = ['nvidia', 'amd', 'intel', 'huawei', 'gpu', 'chip', 'semiconductor', 'tsmc', 'smic', 'blackwell', 'ascend'];

const PRACTICAL_USE_KEYWORDS = [
  'student',
  'job seeker',
  'interview prep',
  'resume',
  'cover letter',
  'freelancer',
  'creator',
  'content creator',
  'office',
  'employee',
  'team lead',
  'education',
  'study',
  'classroom',
  'productivity',
  'workflow',
  'business',
  'startup',
  'founder',
  'enterprise',
  'small business',
  'smb',
  'solopreneur',
  'use case',
  'how to',
  'tutorial',
  'comparison',
  'vs',
  'free plan',
  'prompt',
  'efficiency',
  'automation'
];

const EXCLUDE_KEYWORDS = [
  'art basel',
  'celebrity',
  'fashion week',
  'movie review',
  'music chart',
  'sports',
  'recipe',
  'travel guide'
];

function normalizeText(value = '') {
  return ` ${String(value).toLowerCase().replace(/\s+/g, ' ').trim()} `;
}

function titleFingerprint(title = '') {
  const stopwords = new Set([
    'the', 'a', 'an', 'and', 'or', 'for', 'with', 'from', 'into', 'about', 'latest',
    'new', 'update', 'ai', 'how', 'to', 'in', 'on', 'of', 'at', 'is', 'are', 'vs'
  ]);
  const tokens = String(title || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 2 && !stopwords.has(token));
  return Array.from(new Set(tokens)).sort().slice(0, 8).join('-');
}

function keywordHits(text, keywords) {
  return keywords.reduce((count, keyword) => (text.includes(keyword) ? count + 1 : count), 0);
}

function evaluateRelevance(rawText = '') {
  const text = normalizeText(rawText);
  const aiHits = keywordHits(text, AI_KEYWORDS);
  const warHits = keywordHits(text, CHINA_US_TECH_WAR_KEYWORDS);
  const chinaHits = keywordHits(text, CHINA_KEYWORDS);
  const usHits = keywordHits(text, US_KEYWORDS);
  const comparisonHits = keywordHits(text, COMPARISON_KEYWORDS);
  const generativeHits = keywordHits(text, GENERATIVE_KEYWORDS);
  const policyHits = keywordHits(text, POLICY_KEYWORDS);
  const chipHits = keywordHits(text, CHIP_KEYWORDS);
  const practicalHits = keywordHits(text, PRACTICAL_USE_KEYWORDS);
  const excludeHits = keywordHits(text, EXCLUDE_KEYWORDS);

  const hasChinaUsPair = chinaHits > 0 && usHits > 0;
  const warSignalStrong = warHits >= Math.max(1, env.minWarHits) || comparisonHits > 0;

  const score =
    aiHits * 3 +
    generativeHits * 2 +
    practicalHits * 2 +
    comparisonHits +
    warHits +
    policyHits +
    chipHits -
    excludeHits * 4;

  const relaxedFit = aiHits > 0 && (generativeHits > 0 || practicalHits > 0 || warHits > 0 || comparisonHits > 0 || chipHits > 0);
  const strictFit = aiHits > 0 && hasChinaUsPair && warSignalStrong;
  const hasCoreFit = env.requireChinaUsPair ? strictFit || relaxedFit : relaxedFit;
  const isRelevant = hasCoreFit && score >= env.sourceMinRelevanceScore;

  const tags = ['ai-tools'];
  if (generativeHits > 0) tags.push('generative-ai');
  if (warHits > 0 || hasChinaUsPair) tags.push('china-vs-us', 'tech-war');
  if (policyHits > 0) tags.push('policy');
  if (chipHits > 0) tags.push('chips');
  if (comparisonHits > 0) tags.push('comparison');
  if (hasChinaUsPair) tags.push('china-us-pair');
  if (practicalHits > 0) tags.push('productivity', 'student-business-use');

  return {
    isRelevant,
    score,
    aiHits,
    warHits,
    hasChinaUsPair,
    chinaHits,
    usHits,
    comparisonHits,
    generativeHits,
    policyHits,
    chipHits,
    practicalHits,
    tags: Array.from(new Set(tags))
  };
}

function extractMainText(html = '') {
  const $ = cheerio.load(html || '');
  $('script, style, noscript').remove();
  const text = $('article').text() || $('main').text() || $('body').text();
  return text.replace(/\s+/g, ' ').trim().slice(0, 6000);
}

async function fetchArticleText(url) {
  try {
    const { data } = await axios.get(url, { timeout: 15000, headers: { 'User-Agent': 'Mozilla/5.0' } });
    return extractMainText(data);
  } catch {
    return '';
  }
}

export async function syncSources(maxItems = 20) {
  const imported = [];
  const targetCount = Math.max(1, maxItems);
  const perFeedScanLimit = Math.max(6, Math.ceil(targetCount / FEEDS.length) * 4);
  const currentYear = new Date().getFullYear();
  const lookbackDays = Math.max(30, Number(env.latestLookbackDays || 120));
  const cutoffDate = new Date(Date.now() - 1000 * 60 * 60 * 24 * lookbackDays);

  const recentSourceTitles = await Source.find({})
    .sort({ createdAt: -1 })
    .limit(500)
    .select('title')
    .lean();
  const seenFingerprints = new Set(recentSourceTitles.map((s) => titleFingerprint(s.title)).filter(Boolean));

  for (const feed of FEEDS) {
    if (imported.length >= targetCount) break;

    let parsed;
    try {
      parsed = await parser.parseURL(feed.url);
    } catch {
      continue;
    }

    const items = (parsed.items || []).slice(0, perFeedScanLimit);
    for (const item of items) {
      if (imported.length >= targetCount) break;

      const link = item.link || '';
      if (!link) continue;

      const publishedAt = item.isoDate ? new Date(item.isoDate) : null;
      if (publishedAt && publishedAt < cutoffDate) continue;

      const itemTitle = item.title || 'Untitled';
      const oldYearMatch = String(itemTitle).match(/\b(20\d{2})\b/);
      if (oldYearMatch && Number(oldYearMatch[1]) < currentYear) continue;

      const fingerprint = titleFingerprint(itemTitle);
      if (fingerprint && seenFingerprints.has(fingerprint)) continue;

      const exists = await Source.findOne({ link }).lean();
      if (exists) continue;

      const previewText = `${itemTitle} ${item.contentSnippet || ''} ${item.content || ''}`;
      const previewRelevance = evaluateRelevance(previewText);
      if (!previewRelevance.isRelevant) continue;

      const content = await fetchArticleText(link);
      const fullRelevance = evaluateRelevance(`${previewText} ${content}`);
      if (!fullRelevance.isRelevant) continue;

      const sourceDoc = await Source.create({
        title: itemTitle,
        link,
        sourceName: feed.name,
        publishedAt,
        summary: item.contentSnippet || item.content || '',
        content,
        tags: fullRelevance.tags,
        countryFocus: fullRelevance.hasChinaUsPair || fullRelevance.warHits > 0 ? 'US,CN' : 'global'
      });

      imported.push(sourceDoc);
      if (fingerprint) seenFingerprints.add(fingerprint);
    }
  }

  return imported;
}
