import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 100 },
    phone: { type: String, default: null, trim: true, maxlength: 50 },
    subject: { type: String, required: true, trim: true, maxlength: 200 },
    message: { type: String, required: true, trim: true },
    is_read: { type: Number, enum: [0, 1], default: 0 },
    is_replied: { type: Number, enum: [0, 1], default: 0 },
    replied_at: { type: Date, default: null },
  },
  { timestamps: true, collection: 'messages' },
);

messageSchema.index({ is_read: 1 });
messageSchema.index({ created_at: -1 });

export const Message = mongoose.model('Message', messageSchema);
export default Message;
