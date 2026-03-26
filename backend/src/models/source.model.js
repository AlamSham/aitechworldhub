import mongoose from 'mongoose';

const sourceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    link: { type: String, required: true, unique: true, trim: true },
    sourceName: { type: String, default: '', trim: true },
    publishedAt: { type: Date, default: null },
    summary: { type: String, default: '' },
    content: { type: String, default: '' },
    tags: [{ type: String }],
    countryFocus: { type: String, default: 'global' }
  },
  { timestamps: true }
);

export const Source = mongoose.model('Source', sourceSchema);
