import { Draft } from '../models/draft.model.js';
import { generateSeoDraftFromSource } from './ai.service.js';
import { slugify } from '../utils/slugify.js';

function uniqueSlug(base) {
  const suffix = Date.now().toString().slice(-6);
  return `${slugify(base)}-${suffix}`;
}

export async function createDraftFromSource(source, author) {
  const gen = await generateSeoDraftFromSource(source);

  let slug = gen.slug || slugify(gen.title);
  const exists = await Draft.findOne({ slug }).lean();
  if (exists) slug = uniqueSlug(slug);

  const draft = await Draft.create({
    sourceId: source._id,
    title: gen.title,
    slug,
    metaDescription: gen.metaDescription,
    excerpt: gen.excerpt,
    slogan: gen.slogan,
    contentMarkdown: gen.contentMarkdown,
    imagePrompt: gen.imagePrompt,
    tags: ['ai-tools', 'china-vs-us'],
    category: gen.category || 'AI Tools',
    focusKeyword: gen.focusKeyword || '',
    readingTime: gen.readingTime || 4,
    author,
    status: 'draft'
  });

  return draft;
}
