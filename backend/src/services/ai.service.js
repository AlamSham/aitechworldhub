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
  if (/(nvidia|amd|huawei|chip|gpu|semiconductor|tsmc|smic)/.test(text)) return 'chip-analysis';
  if (/(policy|sanction|export control|regulation|law|compliance)/.test(text)) return 'policy';
  if (/(comparison| vs |versus|head-to-head|rivalry)/.test(text)) return 'comparison';
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
  const content = `## What Changed\n\n${source.summary || source.title}\n\n## Why It Matters Right Now\n\nThis update explains the practical impact for people using AI in real work, learning, and daily life.\n\n## Who Should Use This\n\n- Students and job seekers\n- Freelancers and creators\n- Office teams and small businesses\n- Non-technical users exploring automation\n\n## Practical Use Cases\n\n### Student Use Cases\n\n- Research summarization and study planning\n- Mock interview practice\n\n### Business Productivity Use Cases\n\n- Faster content drafting and reporting\n- Repetitive task automation for teams\n\n### Daily Life Use Cases\n\n- Weekly planning and personal task organization\n- Simple assistants for writing and decision support\n\n## Action Checklist\n\n- [ ] Pick one use case to test this week\n- [ ] Track time saved versus your current workflow\n- [ ] Keep only tools that improve real outcomes\n\n## Final Take\n\nFocus on practical value, reliability, and cost before adopting any AI tool at scale.`;
  return {
    title: normalizeRecentYears(title, currentYear),
    slug: slugify(title),
    metaDescription:
      'Latest generative AI update with practical use cases for students, creators, and businesses.',
    excerpt: 'A practical breakdown of new AI technology and who should use it.',
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
- Include these sections if missing: "Who Should Use This", "Practical Use Cases", actionable checklist.
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
- If angle is "chip-analysis", discuss chips and infra.
- If angle is "policy", discuss policy/regulation implications.
- If angle is "comparison", compare tools/models only if the source is truly comparative.
- If angle is "latest-tools" or "how-to", focus on one concrete modern generative AI topic and workflow.

CONTENT RULES:
- English output. Practical, authoritative tone.
- Article length target: ${minWords}-${maxWords} words.
- Title MUST be under 65 characters and specific. Avoid generic repeated patterns and clickbait overpromises.
- IMPORTANT: Today is in year ${currentYear}. Avoid stale year framing like 2025 in titles/excerpts unless explicitly historical.
- metaDescription MUST be under 155 characters. Include the focus keyword naturally.
- Include H2/H3 headings for easy scanning.
- category must be one of: "AI Tools", "Policy", "How-To", "Comparison", "Productivity"
- focusKeyword must be 2-4 words, practical and searchable.
- REQUIRED sections:
  - "Who Should Use This"
  - "Practical Use Cases" with sub-sections for students, business productivity, and daily life
  - One short actionable checklist (markdown checkboxes)
- Include a comparison table only when the topic naturally requires comparison.
- Mention the source link once near the end.
- Do NOT force China-vs-US framing in every article.
- Include US vs China context only when the source itself is about geopolitics, sanctions, export controls, or direct rivalry.
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
