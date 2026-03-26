import { Draft } from '../models/draft.model.js';
import { env } from '../config/env.js';

function normalizeUrlList(values = []) {
  return (Array.isArray(values) ? values : [])
    .map((value) => String(value || '').trim())
    .filter(Boolean);
}

function extractMarkdownLinks(markdown = '') {
  const links = [];
  const regex = /\[[^\]]+\]\((https?:\/\/[^)\s]+)\)/gi;
  let match = regex.exec(markdown);
  while (match) {
    links.push(match[1]);
    match = regex.exec(markdown);
  }
  return links;
}

function normalizeChecklist(raw = {}) {
  return {
    factsVerified: Boolean(raw?.factsVerified),
    citationsAdded: Boolean(raw?.citationsAdded),
    originalityChecked: Boolean(raw?.originalityChecked),
    audienceFitChecked: Boolean(raw?.audienceFitChecked)
  };
}

function validatePublishReadiness({ qaChecklist, sourceCitations, contentMarkdown }) {
  const issues = [];
  const checklist = normalizeChecklist(qaChecklist);
  const requiredChecklist = [
    ['factsVerified', 'Facts verification checkbox is required.'],
    ['citationsAdded', 'Citation checklist is required.'],
    ['originalityChecked', 'Originality checklist is required.'],
    ['audienceFitChecked', 'US/UK audience fit checklist is required.']
  ];

  for (const [key, message] of requiredChecklist) {
    if (!checklist[key]) issues.push(message);
  }

  const citationList = normalizeUrlList(sourceCitations);
  if (citationList.length < 1) {
    issues.push('At least one source citation URL is required.');
  }

  const markdownLinks = extractMarkdownLinks(contentMarkdown || '');
  if (markdownLinks.length < 2) {
    issues.push('Content must include at least two inline source links in markdown format.');
  }

  return issues;
}

export async function listDrafts(req, res, next) {
  try {
    const status = req.query.status;
    const query = status ? { status } : {};
    const drafts = await Draft.find(query).sort({ createdAt: -1 }).lean();
    return res.json({ drafts });
  } catch (err) {
    return next(err);
  }
}

export async function getDraftById(req, res, next) {
  try {
    const draft = await Draft.findById(req.params.id).lean();
    if (!draft) return res.status(404).json({ message: 'Draft not found' });
    return res.json({ draft });
  } catch (err) {
    return next(err);
  }
}

export async function updateDraft(req, res, next) {
  try {
    const current = await Draft.findById(req.params.id).lean();
    if (!current) return res.status(404).json({ message: 'Draft not found' });

    const payload = req.body || {};
    const updates = {};
    const allowedFields = [
      'title',
      'slug',
      'metaDescription',
      'excerpt',
      'slogan',
      'contentMarkdown',
      'imageUrl',
      'imagePublicId',
      'imagePrompt',
      'tags',
      'category',
      'focusKeyword',
      'readingTime',
      'sourceCitations',
      'qaChecklist',
      'status'
    ];

    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(payload, field)) {
        updates[field] = payload[field];
      }
    }

    if (Object.prototype.hasOwnProperty.call(updates, 'sourceCitations')) {
      updates.sourceCitations = normalizeUrlList(updates.sourceCitations);
    }

    if (Object.prototype.hasOwnProperty.call(updates, 'qaChecklist')) {
      updates.qaChecklist = {
        ...normalizeChecklist(current.qaChecklist || {}),
        ...normalizeChecklist(updates.qaChecklist || {})
      };
    }

    if (updates.status === 'published') {
      const effectiveState = {
        qaChecklist: updates.qaChecklist || current.qaChecklist || {},
        sourceCitations: updates.sourceCitations || current.sourceCitations || [],
        contentMarkdown: updates.contentMarkdown || current.contentMarkdown || ''
      };
      if (env.enablePublishQaGate) {
        const qaIssues = validatePublishReadiness(effectiveState);
        if (qaIssues.length > 0) {
          return res.status(400).json({
            message: 'Publish blocked by QA gate. Complete checklist and citations first.',
            issues: qaIssues
          });
        }
      }
      updates.publishedAt = new Date();
    }
    updates.updatedByAdminId = req.admin.id;

    const draft = await Draft.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    }).lean();

    return res.json({ message: 'Draft updated', draft });
  } catch (err) {
    return next(err);
  }
}

export async function listPublishedDrafts(req, res, next) {
  try {
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(50, Math.max(1, Number(req.query.limit || 12)));
    const category = typeof req.query.category === 'string' ? req.query.category.trim() : '';
    const filter = {
      status: 'published',
      ...(category ? { category } : {})
    };

    const [drafts, total] = await Promise.all([
      Draft.find(filter)
      .sort({ publishedAt: -1, updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('title slug excerpt metaDescription imageUrl tags category readingTime publishedAt createdAt author')
      .lean(),
      Draft.countDocuments(filter)
    ]);

    const totalPages = Math.max(1, Math.ceil(total / limit));
    return res.json({
      drafts,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasPrev: page > 1,
        hasNext: page < totalPages
      }
    });
  } catch (err) {
    return next(err);
  }
}

export async function getPublishedDraftBySlug(req, res, next) {
  try {
    const draft = await Draft.findOne({ slug: req.params.slug, status: 'published' })
      .select('title slug excerpt metaDescription slogan contentMarkdown imageUrl tags category focusKeyword readingTime publishedAt createdAt author')
      .lean();

    if (!draft) {
      return res.status(404).json({ message: 'Published post not found' });
    }

    return res.json({ draft });
  } catch (err) {
    return next(err);
  }
}

export async function getRelatedPosts(req, res, next) {
  try {
    const current = await Draft.findOne({ slug: req.params.slug, status: 'published' })
      .select('category tags')
      .lean();

    if (!current) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const related = await Draft.find({
      status: 'published',
      slug: { $ne: req.params.slug },
      $or: [
        { category: current.category },
        { tags: { $in: current.tags || [] } }
      ]
    })
      .sort({ publishedAt: -1 })
      .limit(3)
      .select('title slug excerpt imageUrl category readingTime publishedAt')
      .lean();

    return res.json({ posts: related });
  } catch (err) {
    return next(err);
  }
}
