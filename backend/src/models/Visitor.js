import mongoose from 'mongoose';

const visitorSchema = new mongoose.Schema(
  {
    ip_address: { type: String, default: null, trim: true, maxlength: 45 },
    user_agent: { type: String, default: null },
    page_url: { type: String, default: null, trim: true, maxlength: 500 },
    referrer_url: { type: String, default: null, trim: true, maxlength: 500 },
    visited_at: { type: Date, default: Date.now },
  },
  { timestamps: true, collection: 'visitors' },
);

visitorSchema.index({ visited_at: -1 });
visitorSchema.index({ ip_address: 1 });

export const Visitor = mongoose.model('Visitor', visitorSchema);
export default Visitor;
