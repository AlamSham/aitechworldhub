import OpenAI from 'openai';
import { env } from '../config/env.js';
import { slugify } from '../utils/slugify.js';

const client = new OpenAI({ apiKey: env.openAiApiKey });

function extractJsonObject(raw = '') {
  const cleaned = String(raw || '').trim();
  const fenced = cleaned.match(/```json\s*([\s\S]*?)```/i);
  if (fenced?.[1]) return fenced[1].trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start >= 0 && end > start) return cleaned.slice(start, end + 1);
  return cleaned;
}

function estimateReadingTime(markdown = '') {
  const words = markdown.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 225));
}

function wordCount(text = '') {
  return String(text || '').split(/\s+/).filter(Boolean).length;
}

function normalizeRecentYears(value = '', currentYear = new Date().getFullYear()) {
  return String(value || '').replace(/\b(20\d{2})\b/g, (match, yearRaw) => {
    const year = Number(yearRaw);
    if (!Number.isFinite(year)) return match;
    // Keep historical references far in the past, but normalize near-stale future/present copy.
    if (year >= currentYear - 2 && year < currentYear) return String(currentYear);
    return match;
  });
}

function inferAngle(source = {}) {
  const text = `${source.title || ''} ${source.summary || ''} ${(source.tags || []).join(' ')}`.toLowerCase();

  const chinaSignal = /(china|chinese|huawei|alibaba|deepseek|qwen|beijing|smic)/.test(text);
  const usSignal = /(u\.s\.|united states|america|openai|google|microsoft|nvidia|anthropic)/.test(text);
  if (chinaSignal && usSignal) return 'china-us-rivalry';

  if (/(nvidia|amd|huawei|chip|gpu|semiconductor|tsmc|smic)/.test(text)) return 'chip-analysis';
  if (/(policy|sanction|export control|regulation|law|compliance)/.test(text)) return 'policy';
  if (/(comparison|\bvs\b|versus|head-to-head|rivalry)/.test(text)) return 'comparison';
  if (/(tutorial|how to|guide|workflow|prompt)/.test(text)) return 'how-to';
  return 'latest-tools';
}

function fallbackDraft(source) {
  const currentYear = new Date().getFullYear();
  const angle = inferAngle(source);
  const titlePrefix =
    angle === 'chip-analysis'
      ? 'AI Chip Update'
      : angle === 'policy'
        ? 'AI Policy Update'
        : angle === 'comparison'
          ? 'AI Tool Comparison'
          : 'Latest Generative AI Update';
  const title = `${titlePrefix}: ${source.title}`;
  const content = `## What Changed\n\n${source.summary || source.title}\n\n## Key Facts\n\n- Summarize the main announcement in plain English.\n- Note any product, policy, pricing, or availability detail that is directly supported by the source.\n- Avoid adding claims that are not verifiable from the source article.\n\n## Why It Matters\n\nExplain the immediate impact for professionals, builders, or teams following AI closely.\n\n## Who Should Pay Attention\n\n- Teams evaluating AI tools or infrastructure\n- Professionals tracking practical AI adoption\n- Readers comparing vendor or policy changes\n\n## Questions to Check Before Adopting\n\n- What changed versus the previous version or policy?\n- Is there a real workflow benefit, or mostly a marketing announcement?\n- What limits, costs, or rollout constraints still matter?\n\n## Source\n\n- ${source.link || 'Add source link before publishing'}`;
  return {
    title: normalizeRecentYears(title, currentYear),
    slug: slugify(title),
    metaDescription:
      'A source-grounded generative AI update covering what changed and why it matters.',
    excerpt: 'A source-grounded breakdown of a timely AI development and its practical impact.',
    slogan: 'Use AI smarter, move faster.',
    contentMarkdown: content,
    imagePrompt: `Editorial blog hero image about ${source.title}, modern generative AI workflow, clean and professional style.`,
    category: 'AI Tools',
    focusKeyword: 'latest generative ai',
    readingTime: estimateReadingTime(content)
  };
}

async function expandShortDraft(existingDraft, source, minWords, maxWords, currentYear) {
  const expandPrompt = `You are revising an AI blog draft for SEO and dwell time.
Return strict valid JSON only with keys: title, slug, metaDescription, excerpt, slogan, contentMarkdown, imagePrompt, category, focusKeyword.

Rules:
- Keep the same topic and intent.
- Expand contentMarkdown to ${minWords}-${maxWords} words.
- Keep it practical and readable for US/UK readers.
- Make the article source-grounded, specific, and non-repetitive.
- Keep section headings specific to the topic instead of repeating the same boilerplate across articles.
- If the source is mostly news, prefer sections like "What Changed", "Why It Matters", "Key Details", and "Source Notes".
- Do not add generic advice for students, daily life, or businesses unless the source clearly supports it.
- End with a short "Sources" section using the provided source URL.
- Avoid stale year framing like 2025 unless clearly historical. Current year: ${currentYear}.

Current draft JSON:
${JSON.stringify(existingDraft)}

Source title: ${source.title}
Source summary: ${source.summary}
Source url: ${source.link}`;

  const resp = await client.responses.create({
    model: env.openAiModel,
    input: expandPrompt
  });

  const text = resp.output_text?.trim();
  if (!text) return null;
  const parsed = JSON.parse(extractJsonObject(text));
  return parsed;
}

export async function generateSeoDraftFromSource(source) {
  if (!env.openAiApiKey) return fallbackDraft(source);

  const currentYear = new Date().getFullYear();
  const todayIso = new Date().toISOString().slice(0, 10);
  const angle = inferAngle(source);
  const minWords = Math.max(700, Number(env.articleMinWords || 1100));
  const maxWords = Math.max(minWords + 100, Number(env.articleMaxWords || 1600));

  const prompt = `You are an expert AI technology journalist writing for AITechWorldHub.com — a US-audience blog covering the global AI landscape.
Your writing must be practical, current, non-repetitive, and optimized for high CTR + dwell time.
Primary audience: ${env.targetFocusRegion}.
Today is ${todayIso}.

Return strict valid JSON only with keys: title, slug, metaDescription, excerpt, slogan, contentMarkdown, imagePrompt, category, focusKeyword.

CURRENT TASK ANGLE: ${angle}
- If angle is "china-us-rivalry", extensively compare the China and US AI landscape, technology, or policy based on the source. "category" MUST be "China vs US".
- If angle is "chip-analysis", discuss chips and infra. "category" MUST be "AI Tools" or "Policy".
- If angle is "policy", discuss policy/regulation implications. "category" MUST be "Policy".
- If angle is "comparison", compare tools/models comprehensively based on the source. "category" MUST be "Comparison".
- If angle is "latest-tools" or "how-to", focus on one concrete modern generative AI topic and workflow. "category" MUST be "AI Tools" or "How-To".

CONTENT RULES:
- English output. Practical, authoritative tone.
- Article length target: ${minWords}-${maxWords} words. IMPORTANT: Aim for the HIGHER end of this range for better SEO and user engagement.
- Write comprehensive, in-depth content with detailed explanations, examples, and actionable insights.
- Include multiple sections with H2/H3 headings for easy scanning.
- Add practical examples, use cases, and step-by-step guidance where relevant.
- Include comparison tables, bullet points, and numbered lists to break up text.
- Title MUST be under 65 characters and specific. Avoid generic repeated patterns and clickbait overpromises.
- IMPORTANT: Today is in year ${currentYear}. Avoid stale year framing like 2025 in titles/excerpts unless explicitly historical.
- metaDescription MUST be under 155 characters. Include the focus keyword naturally.
- category must be one of: "AI Tools", "Policy", "How-To", "Comparison", "Productivity", "China vs US"
- focusKeyword must be 2-4 words, practical and searchable.
- Ground every major claim in the source material. Do not invent benchmarks, dates, pricing, availability, quotes, or product names.
- Avoid boilerplate filler. Do not force generic "students / daily life / business productivity" sections unless the topic genuinely supports them.
- Prefer topic-specific sections such as "What Changed", "Why It Matters", "Key Details", "Risks", "Comparison", or "What to Watch Next".
- Add detailed "Who Should Care" or "Who Should Pay Attention" section with specific use cases.
- Include a comparison table when the topic naturally requires comparison (like in "comparison" or "china-us-rivalry" angle).
- Add a "Frequently Asked Questions" section with 3-5 relevant questions and detailed answers.
- End with a comprehensive "Sources" section and include the provided source URL in markdown format.
- Prioritize fresh generative AI product updates, workflows, and real adoption guidance from recent developments.
- No markdown code fences in output.

IMPORTANT — REAL TOOL LINKS:
Every time you mention an AI tool, you MUST hyperlink it using its real official URL in markdown format: [Tool Name](URL).
Use ONLY these verified official URLs:
- ChatGPT: https://chat.openai.com
- OpenAI API: https://platform.openai.com
- Google Gemini: https://gemini.google.com
- Google Veo: https://deepmind.google/technologies/veo
- Claude (Anthropic): https://claude.ai
- Microsoft Copilot: https://copilot.microsoft.com
- Meta Llama: https://llama.meta.com
- Mistral AI: https://mistral.ai
- Perplexity AI: https://perplexity.ai
- Grok (xAI): https://grok.x.ai
- Sora (OpenAI): https://openai.com/sora
- DeepSeek: https://chat.deepseek.com
- Kimi (Moonshot AI): https://kimi.moonshot.cn
- Qwen (Alibaba): https://qwenlm.github.io
- ERNIE Bot (Baidu): https://yiyan.baidu.com
- Zhipu GLM: https://chatglm.cn
- Runway ML: https://runwayml.com
- Pika: https://pika.art
- Hugging Face: https://huggingface.co
- Nvidia: https://nvidia.com
- AMD: https://amd.com
Do NOT invent or guess URLs. If you are unsure of a tool's URL, do not link it — just mention the name.
Source title: ${source.title}
Source summary: ${source.summary}
Source content: ${(source.content || '').slice(0, 4000)}
Source url: ${source.link}`;

  const resp = await client.responses.create({
    model: env.openAiModel,
    input: prompt
  });

  const text = resp.output_text?.trim();
  if (!text) return fallbackDraft(source);

  try {
    const parsed = JSON.parse(extractJsonObject(text));
    let finalParsed = parsed;
    const initialWords = wordCount(parsed.contentMarkdown || '');
    if (initialWords < minWords) {
      try {
        const expanded = await expandShortDraft(parsed, source, minWords, maxWords, currentYear);
        if (expanded?.contentMarkdown) finalParsed = expanded;
      } catch {
        // Keep original parsed draft if expansion fails.
      }
    }

    const contentMd = normalizeRecentYears(finalParsed.contentMarkdown || '', currentYear);
    const resolvedTitle = normalizeRecentYears(finalParsed.title || source.title, currentYear);
    const resolvedSlug = slugify(normalizeRecentYears(finalParsed.slug || resolvedTitle || source.title, currentYear));
    return {
      title: resolvedTitle,
      slug: resolvedSlug,
      metaDescription: normalizeRecentYears(finalParsed.metaDescription || '', currentYear),
      excerpt: normalizeRecentYears(finalParsed.excerpt || '', currentYear),
      slogan: finalParsed.slogan || '',
      contentMarkdown: contentMd,
      imagePrompt: finalParsed.imagePrompt || '',
      category: finalParsed.category || 'AI Tools',
      focusKeyword: normalizeRecentYears(finalParsed.focusKeyword || '', currentYear),
      readingTime: estimateReadingTime(contentMd)
    };
  } catch {
    return fallbackDraft(source);
  }
}

/**
 * Generates platform-optimized captions for Facebook, LinkedIn, and Reddit.
 */
export async function generateSocialCaptions(title, excerpt, slug) {
  const postUrl = `${env.frontendOrigin}/posts/${slug}`;
  
  if (!env.openAiApiKey) {
    return {
      facebook: `${title}\n\nRead more: ${postUrl}`,
      linkedin: `${title}\n\nRead more: ${postUrl}`,
      reddit: `${title}\n\n${postUrl}`
    };
  }

  const prompt = `You are a social media strategist for AITechWorldHub.
Generate 3 distinct, high-engagement social media captions for this new blog post.

Article Title: ${title}
Article Excerpt: ${excerpt}
Link: ${postUrl}

Return strict valid JSON only with keys: facebook, linkedin, reddit.

Guidelines:
- facebook: Conversational, emoji-rich, call-to-action, 3 relevant hashtags, and the link.
- linkedin: Professional, authoritative, use 2-3 bullet points for value, hashtags, and the link.
- reddit: Catchy title format, concise, informative, and the link. 

No markdown fences. Return ONLY the JSON object.`;

  try {
    const resp = await client.responses.create({
      model: env.openAiModel,
      input: prompt
    });

    const text = resp.output_text?.trim();
    if (!text) throw new Error('Empty AI response');

    return JSON.parse(extractJsonObject(text));
  } catch (error) {
    console.error('[AI] Social caption generation failed:', error.message);
    return {
      facebook: `${title}\n\nCheck it out here: ${postUrl} #AI #Tech`,
      linkedin: `${title}\n\nRead our latest analysis on AI: ${postUrl}`,
      reddit: `${title} - ${postUrl}`
    };
  }
}
