import { User, AuditLog } from '../models/index.js';
import { ApiError } from '../lib/ApiError.js';
import { asyncHandler } from '../lib/asyncHandler.js';

const isSelf = (req, id) => String(req.user._id) === String(id);

const assertAnotherAdminExists = async (excludeId) => {
  const others = await User.countDocuments({ _id: { $ne: excludeId }, role: 'admin', isActive: true });
  if (!others) throw ApiError.badRequest('Keep at least one active administrator');
};

export const list = asyncHandler(async (_req, res) => {
  const users = await User.find().sort({ createdAt: 1 });
  res.json({ success: true, data: users.map((u) => u.toPublic()) });
});

export const create = asyncHandler(async (req, res) => {
  const { name, email, role, password, isActive } = req.body;
  if (await User.exists({ email: email.toLowerCase() })) throw ApiError.badRequest('Email already in use');
  const user = new User({ name, email, role, isActive });
  await user.setPassword(password);
  await user.save();
  AuditLog.record(req.user, 'staff.create', user.email, `role ${role}`);
  res.status(201).json({ success: true, data: user.toPublic() });
});

export const update = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('+passwordHash');
  if (!user) throw ApiError.notFound('User not found');
  const { name, email, role, password, isActive } = req.body;
  const changes = [];

  if (email && email.toLowerCase() !== user.email) {
    if (await User.exists({ email: email.toLowerCase(), _id: { $ne: user._id } })) throw ApiError.badRequest('Email already in use');
    changes.push(`email ${user.email} -> ${email.toLowerCase()}`);
    user.email = email;
  }
  if (name && name !== user.name) {
    changes.push(`name -> ${name}`);
    user.name = name;
  }
  if (role && role !== user.role) {
    if (isSelf(req, user._id)) throw ApiError.badRequest('You cannot change your own role');
    if (user.role === 'admin') await assertAnotherAdminExists(user._id);
    changes.push(`role ${user.role} -> ${role}`);
    user.role = role;
  }
  if (typeof isActive === 'boolean' && isActive !== user.isActive) {
    if (isSelf(req, user._id)) throw ApiError.badRequest('You cannot deactivate your own account');
    if (!isActive && user.role === 'admin') await assertAnotherAdminExists(user._id);
    changes.push(isActive ? 'activated' : 'deactivated');
    user.isActive = isActive;
  }
  if (password) {
    await user.setPassword(password);
    changes.push('password reset by admin');
  }
  await user.save();
  AuditLog.record(req.user, 'staff.update', user.email, changes.join(', '));
  res.json({ success: true, data: user.toPublic() });
});

export const remove = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw ApiError.notFound('User not found');
  if (isSelf(req, user._id)) throw ApiError.badRequest('You cannot delete your own account');
  if (user.role === 'admin') await assertAnotherAdminExists(user._id);
  await user.deleteOne();
  AuditLog.record(req.user, 'staff.delete', user.email);
  res.json({ success: true, data: { _id: user._id } });
});
