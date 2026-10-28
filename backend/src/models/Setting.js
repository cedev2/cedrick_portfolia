import mongoose from 'mongoose';

/**
 * Generic key/value store for site-wide settings.
 * Key/value pairs in their own MongoDB collection.
 */
const settingSchema = new mongoose.Schema(
  {
    setting_key: { type: String, required: true, unique: true, trim: true, maxlength: 100 },
    setting_value: { type: String, default: null },
    setting_type: {
      type: String,
      enum: ['text', 'textarea', 'image', 'file', 'boolean', 'json'],
      default: 'text',
    },
  },
  { timestamps: true, collection: 'settings' },
);


settingSchema.statics.getValue = async function getValue(key, fallback = null) {
  const row = await this.findOne({ setting_key: key }).lean();
  return row ? row.setting_value : fallback;
};

settingSchema.statics.getAllMap = async function getAllMap() {
  const rows = await this.find({}).lean();
  return rows.reduce((acc, row) => {
    acc[row.setting_key] = row.setting_value;
    return acc;
  }, {});
};

settingSchema.statics.setValue = async function setValue(key, value, type = 'text') {
  return this.findOneAndUpdate(
    { setting_key: key },
    { $set: { setting_value: value, setting_type: type } },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );
};

export const Setting = mongoose.model('Setting', settingSchema);
export default Setting;
