import mongoose from 'mongoose';

const socialLinkSchema = new mongoose.Schema(
  {
    platform: { type: String, required: true, trim: true, maxlength: 50 },
    url: { type: String, required: true, trim: true, maxlength: 500 },
    icon: { type: String, default: null, trim: true, maxlength: 50 },
    sort_order: { type: Number, default: 0 },
    is_active: { type: Number, enum: [0, 1], default: 1 },
  },
  { timestamps: true, collection: 'social_links' },
);

socialLinkSchema.index({ sort_order: 1 });

export const SocialLink = mongoose.model('SocialLink', socialLinkSchema);
export default SocialLink;
