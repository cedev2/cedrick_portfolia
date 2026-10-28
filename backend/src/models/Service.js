import mongoose from 'mongoose';
import { softDeletePlugin } from './plugins.js';

const serviceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, required: true, trim: true },
    icon: { type: String, default: null, trim: true, maxlength: 50 },
    pricing: { type: String, default: null, trim: true, maxlength: 100 },
    pricing_note: { type: String, default: null, trim: true },
    sort_order: { type: Number, default: 0 },
    deleted_at: { type: Date, default: null },
  },
  { timestamps: true, collection: 'services' },
);

serviceSchema.index({ sort_order: 1 });
serviceSchema.plugin(softDeletePlugin);

export const Service = mongoose.model('Service', serviceSchema);
export default Service;
