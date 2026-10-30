import mongoose from 'mongoose';

/**
 * Atomic per-key sequence. The first call for a key returns 1, then 2, 3...
 * (A schema default cannot be combined with $inc on insert, so callers add any offset themselves.)
 */
const counterSchema = new mongoose.Schema({ _id: String, seq: { type: Number, default: 0 } });

counterSchema.statics.next = async function next(key) {
  const doc = await this.findByIdAndUpdate(key, { $inc: { seq: 1 } }, { new: true, upsert: true });
  return doc.seq;
};

export const Counter = mongoose.model('Counter', counterSchema);
export default Counter;
