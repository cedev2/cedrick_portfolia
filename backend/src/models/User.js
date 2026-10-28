import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true, maxlength: 50 },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true, maxlength: 100 },
    password: { type: String, required: true, minlength: 8, select: false },
    full_name: { type: String, required: true, trim: true, maxlength: 100 },
    role: { type: String, enum: ['admin', 'editor'], default: 'admin' },
    reset_token: { type: String, default: null, select: false },
    reset_token_expires: { type: Date, default: null, select: false },
    last_login: { type: Date, default: null },
    deleted_at: { type: Date, default: null },
  },
  { timestamps: true, collection: 'users' },
);


userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  return next();
});

userSchema.methods.verifyPassword = function verifyPassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id.toString(),
    username: this.username,
    email: this.email,
    full_name: this.full_name,
    role: this.role,
    last_login: this.last_login,
  };
};

export const User = mongoose.model('User', userSchema);
export default User;
