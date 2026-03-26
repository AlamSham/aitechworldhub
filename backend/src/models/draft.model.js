import mongoose from 'mongoose';

const draftSchema = new mongoose.Schema(
  {
    sourceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Source', required: true },
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true },
    metaDescription: { type: String, default: '' },
    excerpt: { type: String, default: '' },
    slogan: { type: String, default: '' },
    contentMarkdown: { type: String, required: true },
    imageUrl: { type: String, default: '' },
    imagePublicId: { type: String, default: '' },
    imagePrompt: { type: String, default: '' },
    tags: [{ type: String }],
    category: { type: String, default: 'AI Tools' },
    focusKeyword: { type: String, default: '' },
    readingTime: { type: Number, default: 4 },
    focusRegion: { type: String, default: 'US,UK,AU,CA' },
    sourceCitations: [{ type: String }],
    qaChecklist: {
      factsVerified: { type: Boolean, default: false },
      citationsAdded: { type: Boolean, default: false },
      originalityChecked: { type: Boolean, default: false },
      audienceFitChecked: { type: Boolean, default: false }
    },
    status: {
      type: String,
      enum: ['draft', 'reviewed', 'published'],
      default: 'draft'
    },
    publishedAt: { type: Date, default: null },
    author: { type: String, default: '' },
    updatedByAdminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: null }
  },
  { timestamps: true }
);

draftSchema.index({ slug: 1 }, { unique: true });

export const Draft = mongoose.model('Draft', draftSchema);
