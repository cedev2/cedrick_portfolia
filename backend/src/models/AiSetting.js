import mongoose from 'mongoose';

/**
 * Dedicated key/value store for AI chatbot configuration.
 * Separate from `settings` so chatbot config can be tuned independently.
 */
const aiSettingSchema = new mongoose.Schema(
  {
    setting_key: { type: String, required: true, unique: true, trim: true, maxlength: 100 },
    setting_value: { type: String, default: null },
    setting_type: {
      type: String,
      enum: ['text', 'textarea', 'image', 'file', 'boolean', 'json'],
      default: 'text',
    },
  },
  { timestamps: true, collection: 'ai_settings' },
);


aiSettingSchema.statics.getAllMap = async function getAllMap() {
  const rows = await this.find({}).lean();
  return rows.reduce((acc, row) => {
    acc[row.setting_key] = row.setting_value;
    return acc;
  }, {});
};

aiSettingSchema.statics.setValue = async function setValue(key, value, type = 'text') {
  return this.findOneAndUpdate(
    { setting_key: key },
    { $set: { setting_value: value, setting_type: type } },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );
};

export const AiSetting = mongoose.model('AiSetting', aiSettingSchema);
export default AiSetting;
