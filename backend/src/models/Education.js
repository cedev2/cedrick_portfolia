import mongoose from 'mongoose';
import { softDeletePlugin } from './plugins.js';

const educationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    institution: { type: String, required: true, trim: true, maxlength: 200 },
    location: { type: String, default: null, trim: true, maxlength: 200 },
    image: { type: String, default: null, trim: true, maxlength: 255 },
    start_date: { type: Date, required: true },
    end_date: { type: Date, default: null },
    is_current: { type: Number, enum: [0, 1], default: 0 },
    description: { type: String, default: null, trim: true },
    sort_order: { type: Number, default: 0 },
    deleted_at: { type: Date, default: null },
  },
  { timestamps: true, collection: 'education' },
);

educationSchema.index({ sort_order: 1 });
educationSchema.plugin(softDeletePlugin);

export const Education = mongoose.model('Education', educationSchema);
export default Education;
