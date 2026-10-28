import mongoose from 'mongoose';

/**
 * Knowledge-base documents the admin uploads to train the AI assistant.
 * The extracted plain text is stored so it can be injected into the RAG
 * context without re-reading the original file on every chat turn.
 */
const aiDocumentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    original_name: { type: String, required: true, trim: true, maxlength: 255 },
    stored_path: { type: String, required: true, trim: true, maxlength: 255 },
    mime_type: { type: String, default: '', trim: true, maxlength: 120 },
    extension: { type: String, default: '', trim: true, maxlength: 20 },
    size: { type: Number, default: 0 },
    char_count: { type: Number, default: 0 },
    text: { type: String, default: '' },
    status: { type: String, enum: ['ready', 'empty', 'failed'], default: 'ready' },
    error_message: { type: String, default: '' },
  },
  { timestamps: true, collection: 'ai_documents' },
);

aiDocumentSchema.index({ created_at: -1 });

export const AiDocument = mongoose.model('AiDocument', aiDocumentSchema);
export default AiDocument;
