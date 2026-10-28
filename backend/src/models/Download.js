import mongoose from 'mongoose';

const downloadSchema = new mongoose.Schema(
  {
    item_type: { type: String, required: true, trim: true, maxlength: 50 },
    item_id: { type: mongoose.Schema.Types.ObjectId, default: null },
    downloader_ip: { type: String, default: null, trim: true, maxlength: 45 },
    downloaded_at: { type: Date, default: Date.now },
  },
  { timestamps: true, collection: 'downloads' },
);

downloadSchema.index({ item_type: 1 });
downloadSchema.index({ downloaded_at: -1 });

export const Download = mongoose.model('Download', downloadSchema);
export default Download;
