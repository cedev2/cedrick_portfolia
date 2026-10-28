import mongoose from 'mongoose';
import { softDeletePlugin } from './plugins.js';

const skillSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    category: { type: String, required: true, trim: true, maxlength: 50 },
    percentage: { type: Number, default: 0, min: 0, max: 100 },
    icon: { type: String, default: null, trim: true, maxlength: 50 },
    icon_color: { type: String, default: null, trim: true, maxlength: 20 },
    sort_order: { type: Number, default: 0 },
    deleted_at: { type: Date, default: null },
  },
  { timestamps: true, collection: 'skills' },
);

skillSchema.index({ category: 1 });
skillSchema.index({ sort_order: 1 });
skillSchema.plugin(softDeletePlugin);

export const Skill = mongoose.model('Skill', skillSchema);
export default Skill;
