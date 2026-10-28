import mongoose from 'mongoose';
import { softDeletePlugin } from './plugins.js';

const testimonialSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    company: { type: String, default: null, trim: true, maxlength: 200 },
    position: { type: String, default: null, trim: true, maxlength: 200 },
    content: { type: String, required: true, trim: true },
    rating: { type: Number, default: 5, min: 1, max: 5 },
    avatar: { type: String, default: null, trim: true, maxlength: 255 },
    sort_order: { type: Number, default: 0 },
    deleted_at: { type: Date, default: null },
  },
  { timestamps: true, collection: 'testimonials' },
);

testimonialSchema.index({ sort_order: 1 });
testimonialSchema.plugin(softDeletePlugin);

export const Testimonial = mongoose.model('Testimonial', testimonialSchema);
export default Testimonial;
