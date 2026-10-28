import mongoose from 'mongoose';

const blogCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true, maxlength: 100 },
    description: { type: String, default: null, trim: true },
  },
  { timestamps: true, collection: 'blog_categories' },
);


export const BlogCategory = mongoose.model('BlogCategory', blogCategorySchema);
export default BlogCategory;
