import User from '../models/User.js';
import LoginLog from '../models/LoginLog.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const getAccessSecret = () => process.env.JWT_SECRET || process.env.ACCESS_TOKEN_SECRET;
const getRefreshSecret = () => process.env.JWT_REFRESH_SECRET || process.env.ADMIN_SECRET_KEY || process.env.JWT_SECRET;

const generateAccessToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, getAccessSecret(), { expiresIn: '15m' });
};

const generateRefreshToken = (user) => {
  return jwt.sign({ id: user._id }, getRefreshSecret(), { expiresIn: '7d' });
};

const cookieOptions = () => {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000
  };
};

export const signup = async (req, res) => {
  const { name, email, password, role, adminSecret } = req.body;
  try {
    if (!name || !email || !password) return res.status(400).json({ message: 'Missing required fields' });
    if (role === 'Admin') {
      const secret = process.env.ADMIN_SECRET_KEY;
      if (!adminSecret || adminSecret !== secret) return res.status(403).json({ message: 'Invalid Admin Secret Key' });
    }
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });
    const userRole = role === 'Admin' ? 'Admin' : 'User';
    const user = await User.create({ name, email, password, role: userRole });
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    const hash = await bcrypt.hash(refreshToken, 10);
    user.refreshTokenHash = hash;
    await user.save();
    res.cookie('refresh_token', refreshToken, cookieOptions());
    await LoginLog.create({
      user: user._id,
      email: user.email,
      provider: 'local',
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      success: true
    });
    res.status(201).json({
      accessToken,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) return res.status(400).json({ message: 'Missing credentials' });
    const user = await User.findOne({ email });
    if (!user) {
      await LoginLog.create({ email, provider: 'local', ip: req.ip, userAgent: req.headers['user-agent'], success: false });
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await LoginLog.create({ user: user._id, email, provider: 'local', ip: req.ip, userAgent: req.headers['user-agent'], success: false });
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    const hash = await bcrypt.hash(refreshToken, 10);
    user.refreshTokenHash = hash;
    user.set('updatedAt', new Date());
    await user.save();
    res.cookie('refresh_token', refreshToken, cookieOptions());
    await LoginLog.create({ user: user._id, email, provider: 'local', ip: req.ip, userAgent: req.headers['user-agent'], success: true });
    res.json({ accessToken, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const refresh = async (req, res) => {
  const token = req.cookies?.refresh_token;
  if (!token) return res.status(401).json({ message: 'No refresh token' });
  try {
    const decoded = jwt.verify(token, getRefreshSecret());
    const user = await User.findById(decoded.id);
    if (!user || !user.refreshTokenHash) return res.status(401).json({ message: 'Invalid refresh token' });
    const valid = await bcrypt.compare(token, user.refreshTokenHash);
    if (!valid) return res.status(401).json({ message: 'Invalid refresh token' });
    const accessToken = generateAccessToken(user);
    const newRefresh = generateRefreshToken(user);
    user.refreshTokenHash = await bcrypt.hash(newRefresh, 10);
    await user.save();
    res.cookie('refresh_token', newRefresh, cookieOptions());
    res.json({ accessToken });
  } catch {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
};

export const logout = async (req, res) => {
  try {
    const token = req.cookies?.refresh_token;
    if (token) {
      try {
        const decoded = jwt.verify(token, getRefreshSecret());
        const user = await User.findById(decoded.id);
        if (user) {
          user.refreshTokenHash = undefined;
          await user.save();
        }
      } catch {}
    }
    res.clearCookie('refresh_token', { path: '/' });
    res.json({ message: 'Logged out' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const me = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('_id name email role createdAt');
    if (!user) return res.status(404).json({ message: 'Not found' });
    res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const oauthIssueTokens = async (req, res) => {
  try {
    const user = req.user;
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    user.refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    user.set('updatedAt', new Date());
    await user.save();
    const opts = cookieOptions();
    res.cookie('refresh_token', refreshToken, opts);
    res.cookie('access_token', accessToken, opts);
    await LoginLog.create({ user: user._id, email: user.email, provider: user.oauthProvider || 'oauth', ip: req.ip, userAgent: req.headers['user-agent'], success: true });
    const frontend = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontend}/dashboard`);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
