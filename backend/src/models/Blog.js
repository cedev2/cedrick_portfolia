import mongoose from 'mongoose';
import { softDeletePlugin } from './plugins.js';

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true, maxlength: 200 },
    category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'BlogCategory', default: null },
    image: { type: String, default: null, trim: true, maxlength: 255 },
    content: { type: String, required: true },
    author: { type: String, default: 'NIBISHAKA CEDRICK', trim: true, maxlength: 100 },
    reading_time: { type: Number, default: null },
    meta_title: { type: String, default: null, trim: true, maxlength: 200 },
    meta_description: { type: String, default: null, trim: true },
    published_date: { type: Date, default: null },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
    sort_order: { type: Number, default: 0 },
    deleted_at: { type: Date, default: null },
  },
  { timestamps: true, collection: 'blogs' },
);

blogSchema.index({ status: 1 });
blogSchema.index({ published_date: -1 });
blogSchema.plugin(softDeletePlugin);

export const Blog = mongoose.model('Blog', blogSchema);
export default Blog;
