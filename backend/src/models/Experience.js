import mongoose from 'mongoose';
import { softDeletePlugin } from './plugins.js';

const experienceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    company: { type: String, required: true, trim: true, maxlength: 200 },
    location: { type: String, default: null, trim: true, maxlength: 200 },
    image: { type: String, default: null, trim: true, maxlength: 255 },
    start_date: { type: Date, required: true },
    end_date: { type: Date, default: null },
    is_current: { type: Number, enum: [0, 1], default: 0 },
    description: { type: String, required: true, trim: true },
    sort_order: { type: Number, default: 0 },
    deleted_at: { type: Date, default: null },
  },
  { timestamps: true, collection: 'experience' },
);

experienceSchema.index({ sort_order: 1 });
experienceSchema.index({ is_current: 1 });
experienceSchema.plugin(softDeletePlugin);

export const Experience = mongoose.model('Experience', experienceSchema);
export default Experience;
