import mongoose from 'mongoose';

const auditSchema = new mongoose.Schema(
  {
    actor: { type: String, default: 'System' },
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    action: { type: String, required: true, index: true },
    target: { type: String, default: '' },
    detail: { type: String, default: '' },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

auditSchema.index({ createdAt: -1 });

/** Fire-and-forget audit entry; never blocks or fails the request. */
auditSchema.statics.record = function record(user, action, target = '', detail = '') {
  return this.create({ actor: user?.name || 'System', actorId: user?._id, action, target, detail }).catch(() => null);
};

export const AuditLog = mongoose.model('AuditLog', auditSchema);
export default AuditLog;
