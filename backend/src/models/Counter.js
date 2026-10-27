import mongoose from 'mongoose';

/** Atomic per-key sequence, used for daily order numbers (DG-YYYYMMDD-1001, 1002, ...). */
const counterSchema = new mongoose.Schema({ _id: String, seq: { type: Number, default: 1000 } });

counterSchema.statics.next = async function next(key) {
  const doc = await this.findByIdAndUpdate(key, { $inc: { seq: 1 } }, { new: true, upsert: true, setDefaultsOnInsert: true });
  return doc.seq;
};

export const Counter = mongoose.model('Counter', counterSchema);
export default Counter;
