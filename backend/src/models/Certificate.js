import mongoose from 'mongoose';
import { softDeletePlugin } from './plugins.js';

const certificateFileSchema = new mongoose.Schema(
  {
    file_path: { type: String, required: true, trim: true },
    file_type: { type: String, required: true, trim: true, maxlength: 50 },
    file_size: { type: Number, default: null },
    download_count: { type: Number, default: 0 },
  },
  { timestamps: true, _id: true },
);

const certificateSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    organization: { type: String, required: true, trim: true, maxlength: 200 },
    issue_date: { type: Date, required: true },
    expiry_date: { type: Date, default: null },
    description: { type: String, default: null, trim: true },
    certificate_number: { type: String, default: null, trim: true, maxlength: 100 },
    category: { type: String, default: null, trim: true, maxlength: 50 },
    preview_image: { type: String, default: null, trim: true, maxlength: 255 },
    certificate_url: { type: String, default: null, trim: true, maxlength: 500 },
    credential_url: { type: String, default: null, trim: true, maxlength: 500 },
    sort_order: { type: Number, default: 0 },
    files: { type: [certificateFileSchema], default: [] },
    deleted_at: { type: Date, default: null },
  },
  { timestamps: true, collection: 'certificates' },
);

certificateSchema.index({ category: 1 });
certificateSchema.index({ sort_order: 1 });
certificateSchema.plugin(softDeletePlugin);

export const Certificate = mongoose.model('Certificate', certificateSchema);
export default Certificate;
