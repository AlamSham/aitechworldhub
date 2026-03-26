import { Draft } from '../models/draft.model.js';

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
      'status'
    ];

    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(payload, field)) {
        updates[field] = payload[field];
      }
    }

    if (updates.status === 'published') {
      updates.publishedAt = new Date();
    }
    updates.updatedByAdminId = req.admin.id;

    const draft = await Draft.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    }).lean();

    if (!draft) return res.status(404).json({ message: 'Draft not found' });
    return res.json({ message: 'Draft updated', draft });
  } catch (err) {
    return next(err);
  }
}

export async function listPublishedDrafts(req, res, next) {
  try {
    const drafts = await Draft.find({ status: 'published' })
      .sort({ publishedAt: -1, updatedAt: -1 })
      .select('title slug excerpt metaDescription imageUrl tags category readingTime publishedAt createdAt')
      .lean();

    return res.json({ drafts });
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
