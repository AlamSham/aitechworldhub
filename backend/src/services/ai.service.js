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

function fallbackDraft(source) {
  const title = `${source.title} - China vs US AI Tools Analysis`;
  const content = `## What Happened\n\n${source.summary || source.title}\n\n## China vs US Tech Angle\n\n- Which ecosystem is moving faster\n- Product and policy impact\n- What this means for AI users\n\n## Who Should Use This\n\n- Students\n- Job seekers\n- Freelancers and creators\n- Office teams\n- Small business owners\n- Non-tech users\n\n## Student Use Cases\n\n- Where this can help learning\n- 3 practical prompts to test\n\n## Business Productivity Use Cases\n\n- Fast workflows to improve productivity\n- Cost and implementation notes\n\n## Daily Life Use Cases\n\n- Personal planning and daily organization\n- Time-saving task automation\n\n## Final Take\n\nUse this update to pick tools based on outcomes, not hype.`;
  return {
    title,
    slug: slugify(title),
    metaDescription:
      'China vs US AI tools analysis with student and business productivity takeaways from the latest AI developments.',
    excerpt: 'Latest AI update explained with China-US context and actionable productivity ideas.',
    slogan: 'Use AI smarter, move faster.',
    contentMarkdown: content,
    imagePrompt: `Editorial blog hero image about ${source.title}, split-screen China and USA AI tools dashboard style, modern, clean.`,
    category: 'AI Tools',
    focusKeyword: 'china vs us ai tools',
    readingTime: estimateReadingTime(content)
  };
}

export async function generateSeoDraftFromSource(source) {
  if (!env.openAiApiKey) return fallbackDraft(source);

  const prompt = `You are an expert AI technology journalist writing for AITechWorldHub.com — a US-audience blog covering the global AI landscape.
Your articles must be comprehensive, well-researched, and engaging enough to keep a reader on the page for 3-5 minutes.

Return strict valid JSON only with keys: title, slug, metaDescription, excerpt, slogan, contentMarkdown, imagePrompt, category, focusKeyword.

COVERAGE SCOPE — You MUST reference multiple AI models and companies where relevant, not just one or two. The major players include:
- US AI: OpenAI (GPT-4o, GPT-5, ChatGPT), Google (Gemini, Veo 3, Imagen), Anthropic (Claude 3.5/4, Sonnet, Opus), Meta (Llama 3/4), Microsoft (Copilot), Mistral, Perplexity, xAI (Grok)
- Chinese AI: DeepSeek (V3, R1), Alibaba (Qwen), Kimi 2 (Moonshot AI), Baidu (ERNIE), Zhipu (GLM), ByteDance, MiniMax, StepFun, SenseTime
- AI Chips: Nvidia (H100, H200, B200, GB200, Blackwell), AMD (MI300X), Intel (Gaudi), Huawei (Ascend 910B/C), TSMC, SMIC
- Video/Image AI: Sora, Veo 3, Runway, Kling, Pika

CONTENT RULES:
- English output. Practical, authoritative tone with real data points.
- The article MUST be between 800-1200 words. This is CRITICAL for SEO ranking. Never write less than 800 words. Count carefully.
- Title MUST be under 60 characters. Use benefit-driven curiosity-gap style titles optimized for Google CTR. Examples: "Why China's Kimi 2 Is Beating Claude at Coding Tasks", "5 Free Chinese AI Tools US Workers Should Try in 2025", "Nvidia vs Huawei: Who Wins the AI Chip War in 2025?"
- metaDescription MUST be under 155 characters. Include the focus keyword naturally.
- Include H2/H3 headings for easy scanning.
- Pick one primary content bucket from:
  1) How-to guide
  2) Comparison (China tool vs US tool, or Model A vs Model B)
  3) Free tools roundup list
  4) Prompt engineering pack
  5) Mistakes to avoid
  6) Country-specific use case
  7) Policy/chip war explainer
  8) AI chipset analysis (Nvidia vs Huawei vs AMD)
  9) Breaking AI news analysis
- category must be one of: "AI Tools", "China vs US", "Policy", "How-To", "Comparison", "Productivity"
- focusKeyword must be 2-4 words that a US user would search on Google. Must be highly specific and trending.
- REQUIRED sections in the article:
  - "Who Should Use This" (must cover students, job seekers, freelancers, creators, office employees, small business owners, and non-tech users)
  - "Student Use Cases" with 2-3 specific actionable examples
  - "Business Productivity Use Cases" with real workflow examples
  - "Daily Life Use Cases"
  - One short actionable checklist (use markdown checkboxes)
- Include a comparison table (markdown table) comparing at least 2-3 relevant AI tools/models where appropriate.
- Mention the source link once near the end.
- Compare the China-vs-US angle clearly where relevant.
- Use direct-benefit framing for CTR (clear outcomes in title and excerpt).
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
    const contentMd = parsed.contentMarkdown || '';
    return {
      title: parsed.title || source.title,
      slug: slugify(parsed.slug || parsed.title || source.title),
      metaDescription: parsed.metaDescription || '',
      excerpt: parsed.excerpt || '',
      slogan: parsed.slogan || '',
      contentMarkdown: contentMd,
      imagePrompt: parsed.imagePrompt || '',
      category: parsed.category || 'AI Tools',
      focusKeyword: parsed.focusKeyword || '',
      readingTime: estimateReadingTime(contentMd)
    };
  } catch {
    return fallbackDraft(source);
  }
}
