import mongoose from 'mongoose';
import { softDeletePlugin } from './plugins.js';

const projectImageSchema = new mongoose.Schema(
  {
    image_path: { type: String, required: true, trim: true },
    is_primary: { type: Number, enum: [0, 1], default: 0 },
    sort_order: { type: Number, default: 0 },
  },
  { timestamps: true, _id: true },
);

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    category: { type: String, required: true, trim: true, maxlength: 50 },
    description: { type: String, required: true, trim: true },
    technologies: { type: String, default: null, trim: true, maxlength: 255 },
    github_url: { type: String, default: null, trim: true, maxlength: 500 },
    live_url: { type: String, default: null, trim: true, maxlength: 500 },
    thumbnail: { type: String, default: null, trim: true, maxlength: 255 },
    pdf_file: { type: String, default: null, trim: true, maxlength: 255 },
    status: { type: String, enum: ['completed', 'in-progress', 'planned'], default: 'completed' },
    is_featured: { type: Number, enum: [0, 1], default: 0 },
    start_date: { type: Date, default: null },
    end_date: { type: Date, default: null },
    sort_order: { type: Number, default: 0 },
    images: { type: [projectImageSchema], default: [] },
    deleted_at: { type: Date, default: null },
  },
  { timestamps: true, collection: 'projects' },
);

projectSchema.index({ category: 1 });
projectSchema.index({ is_featured: 1 });
projectSchema.index({ sort_order: 1 });
projectSchema.plugin(softDeletePlugin);

export const Project = mongoose.model('Project', projectSchema);
export default Project;
