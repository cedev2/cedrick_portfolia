import mongoose from 'mongoose';

/**
 * Generic key/value store for owner profile information.
 * Key/value pairs in their own MongoDB collection.
 */
const siteInformationSchema = new mongoose.Schema(
  {
    key_name: { type: String, required: true, unique: true, trim: true, maxlength: 100 },
    value: { type: String, default: null },
  },
  { timestamps: true, collection: 'site_information' },
);


siteInformationSchema.statics.getValue = async function getValue(key, fallback = null) {
  const row = await this.findOne({ key_name: key }).lean();
  return row ? row.value : fallback;
};

siteInformationSchema.statics.getAllMap = async function getAllMap() {
  const rows = await this.find({}).lean();
  return rows.reduce((acc, row) => {
    acc[row.key_name] = row.value;
    return acc;
  }, {});
};

siteInformationSchema.statics.setValue = async function setValue(key, value) {
  return this.findOneAndUpdate(
    { key_name: key },
    { $set: { value } },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );
};

export const SiteInformation = mongoose.model('SiteInformation', siteInformationSchema);
export default SiteInformation;
