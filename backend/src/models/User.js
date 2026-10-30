import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export const ROLES = ['admin', 'staff'];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ROLES, default: 'staff' },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date, default: null },
    passwordChangedAt: { type: Date, default: null },
    /** sha256 of the 5-digit reset code emailed to the user, with its expiry and how many wrong tries were made. */
    resetTokenHash: { type: String, select: false },
    resetTokenExpires: { type: Date, select: false },
    resetAttempts: { type: Number, default: 0, select: false },
  },
  { timestamps: true }
);

/**
 * Hash a new password. By default every existing session token is invalidated;
 * pass { keepSessions: true } for a self-service change so the current login survives.
 */
userSchema.methods.setPassword = async function setPassword(plain, { keepSessions = false } = {}) {
  this.passwordHash = await bcrypt.hash(plain, 10);
  if (!keepSessions) this.passwordChangedAt = new Date();
};

userSchema.methods.verifyPassword = function verifyPassword(plain) {
  return bcrypt.compare(plain, this.passwordHash || '');
};

/** The shape the admin UI expects: never the hash or reset fields. */
userSchema.methods.toPublic = function toPublic() {
  return {
    _id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    isActive: this.isActive,
    lastLoginAt: this.lastLoginAt,
    createdAt: this.createdAt,
  };
};

export const User = mongoose.model('User', userSchema);
export default User;
