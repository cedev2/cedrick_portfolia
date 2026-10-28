import mongoose from 'mongoose';

const aiMessageSchema = new mongoose.Schema(
  {
    conversation_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AiConversation',
      required: true,
    },
    role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
    content: { type: String, required: true },
    provider: { type: String, default: null, trim: true, maxlength: 20 },
    tokens_used: { type: Number, default: null },
    latency_ms: { type: Number, default: null },
  },
  { timestamps: true, collection: 'ai_messages' },
);

aiMessageSchema.index({ conversation_id: 1 });
aiMessageSchema.index({ created_at: -1 });

export const AiMessage = mongoose.model('AiMessage', aiMessageSchema);
export default AiMessage;
