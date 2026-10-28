import mongoose from 'mongoose';

const aiConversationSchema = new mongoose.Schema(
  {
    session_id: { type: String, required: true, trim: true, maxlength: 100, index: true },
    ip_address: { type: String, default: null, trim: true, maxlength: 45 },
    message_count: { type: Number, default: 0 },
    is_active: { type: Number, enum: [0, 1], default: 1 },
  },
  { timestamps: true, collection: 'ai_conversations' },
);

aiConversationSchema.index({ created_at: -1 });

export const AiConversation = mongoose.model('AiConversation', aiConversationSchema);
export default AiConversation;
