import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import User from '../models/User.js';
import LoginLog from '../models/LoginLog.js';
import mongoose from 'mongoose';
import AdminActivity from '../models/AdminActivity.js';

const router = express.Router();

router.get('/data', protect, authorize('Admin'), async (req, res) => {
  const totalUsers = await User.countDocuments();
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recentLogins = await LoginLog.countDocuments({ createdAt: { $gte: since }, success: true });
  const securityAlerts = await LoginLog.countDocuments({ success: false });
  res.json({
    message: 'Admin access granted',
    stats: {
      users: totalUsers,
      recentLogins,
      securityAlerts
    }
  });
});

router.get('/users', protect, authorize('Admin'), async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.max(parseInt(req.query.limit, 10) || 5, 1);
  const skip = (page - 1) * limit;
  const [users, total] = await Promise.all([
    User.find().select('name email role createdAt').sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments()
  ]);
  res.json({
    users,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit)
  });
});

router.patch('/users/:id/role', protect, authorize('Admin'), async (req, res) => {
  const { role } = req.body;
  if (!['Admin', 'Manager', 'User'].includes(role)) return res.status(400).json({ message: 'Invalid role' });
  if (req.user.id === req.params.id) return res.status(400).json({ message: 'You cannot change your own role' });
  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('name email role');
  if (!user) return res.status(404).json({ message: 'User not found' });
  console.log(`Admin ${req.user.id} changed User ${req.params.id} role to ${role}`);
  try {
    await AdminActivity.create({
      adminId: req.user.id,
      targetUserId: req.params.id,
      action: 'ROLE_CHANGE',
      metadata: { newRole: role }
    });
  } catch {}
  res.json({ user });
});

router.patch('/users/:id/password', protect, authorize('Admin'), async (req, res) => {
  const { password } = req.body;
  if (!password || typeof password !== 'string') return res.status(400).json({ message: 'Password is required' });
  if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });
  const user = await User.findById(req.params.id).select('name email role password');
  if (!user) return res.status(404).json({ message: 'User not found' });
  user.password = password;
  await user.save();
  console.log(`Admin ${req.user.id} updated password for User ${req.params.id}`);
  try {
    await AdminActivity.create({
      adminId: req.user.id,
      targetUserId: req.params.id,
      action: 'PASSWORD_UPDATE',
      metadata: { email: user.email }
    });
  } catch {}
  res.json({ message: 'Password updated successfully' });
});

router.patch('/users/:id', protect, authorize('Admin'), async (req, res) => {
  const { name, email } = req.body;
  const updates = {};
  if (typeof name === 'string' && name.trim().length > 0) updates.name = name.trim();
  if (typeof email === 'string' && email.trim().length > 0) updates.email = email.trim().toLowerCase();
  if (Object.keys(updates).length === 0) return res.status(400).json({ message: 'No valid fields to update' });
  if (updates.email) {
    const exists = await User.findOne({ email: updates.email, _id: { $ne: req.params.id } }).select('_id');
    if (exists) return res.status(400).json({ message: 'Email already in use' });
  }
  const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('name email role');
  if (!user) return res.status(404).json({ message: 'User not found' });
  try {
    await AdminActivity.create({
      adminId: req.user.id,
      targetUserId: req.params.id,
      action: 'USER_UPDATE',
      metadata: { updated: updates }
    });
  } catch {}
  res.json({ user });
});

router.delete('/users/:id', protect, authorize('Admin'), async (req, res) => {
  if (req.user.id === req.params.id) return res.status(400).json({ message: 'You cannot delete your own account' });
  const user = await User.findById(req.params.id).select('name email role');
  if (!user) return res.status(404).json({ message: 'User not found' });
  await User.deleteOne({ _id: req.params.id });
  console.log(`Admin ${req.user.id} deleted User ${req.params.id}`);
  try {
    await AdminActivity.create({
      adminId: req.user.id,
      targetUserId: req.params.id,
      action: 'USER_DELETE',
      metadata: { email: user.email, role: user.role }
    });
  } catch {}
  res.json({ message: 'User deleted' });
});

router.get('/logs', protect, authorize('Admin'), async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.max(parseInt(req.query.limit, 10) || 5, 1);
  const skip = (page - 1) * limit;
  const filter = {};
  if (req.query.success === 'true') filter.success = true;
  if (req.query.success === 'false') filter.success = false;
  const [logs, total] = await Promise.all([
    LoginLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('user', 'email role'),
    LoginLog.countDocuments(filter)
  ]);
  res.json({
    logs,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit)
  });
});

router.get('/debug/db', protect, authorize('Admin'), async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const dbName = mongoose.connection.name;
    const host = mongoose.connection.host;
    const collections = await db.listCollections().toArray();
    const names = collections.map(c => c.name);
    const counts = {};
    for (const name of names) {
      counts[name] = await db.collection(name).countDocuments();
    }
    res.json({ dbName, host, collections: names, counts });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
