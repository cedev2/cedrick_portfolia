import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema(
  {
    title: { type: String, default: 'Resume', trim: true, maxlength: 200 },
    file_path: { type: String, required: true, trim: true, maxlength: 255 },
    file_type: { type: String, default: 'pdf', trim: true, maxlength: 50 },
    file_size: { type: Number, default: null },
    download_count: { type: Number, default: 0 },
    doc_type: { type: String, default: 'cv', trim: true, maxlength: 30 },
    is_active: { type: Number, enum: [0, 1], default: 1 },
  },
  { timestamps: true, collection: 'resume' },
);

resumeSchema.index({ is_active: 1 });

export const Resume = mongoose.model('Resume', resumeSchema);
export default Resume;
