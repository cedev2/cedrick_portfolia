import mongoose from 'mongoose';
import { softDeletePlugin } from './plugins.js';

const achievementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    count: { type: Number, default: 0, min: 0 },
    icon: { type: String, default: null, trim: true, maxlength: 50 },
    sort_order: { type: Number, default: 0 },
    deleted_at: { type: Date, default: null },
  },
  { timestamps: true, collection: 'achievements' },
);

achievementSchema.index({ sort_order: 1 });
achievementSchema.plugin(softDeletePlugin);

export const Achievement = mongoose.model('Achievement', achievementSchema);
export default Achievement;
