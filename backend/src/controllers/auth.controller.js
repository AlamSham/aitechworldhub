import { Admin } from '../models/admin.model.js';
import {
  comparePassword,
  generateAccessToken,
  hashPassword
} from '../services/auth.service.js';
import { env } from '../config/env.js';

function sanitizeEmail(email = '') {
  return String(email).trim().toLowerCase();
}

function validatePassword(password = '') {
  return typeof password === 'string' && password.length >= 8 && password.length <= 128;
}

export async function registerAdmin(req, res, next) {
  try {
    if (!env.adminSetupKey || req.headers['x-admin-setup-key'] !== env.adminSetupKey) {
      return res.status(403).json({ message: 'Forbidden: invalid setup key' });
    }

    const existingCount = await Admin.countDocuments({});
    if (existingCount > 0) {
      return res.status(409).json({ message: 'Admin already exists' });
    }

    const email = sanitizeEmail(req.body?.email);
    const password = String(req.body?.password || '');
    const fullName = String(req.body?.fullName || 'Admin').trim();

    if (!email || !email.includes('@')) {
      return res.status(400).json({ message: 'Valid email required' });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({ message: 'Password must be 8-128 characters' });
    }

    const passwordHash = await hashPassword(password);
    const admin = await Admin.create({ email, passwordHash, fullName, role: 'admin' });

    return res.status(201).json({
      message: 'Admin registered',
      admin: {
        id: admin._id,
        email: admin.email,
        fullName: admin.fullName,
        role: admin.role
      }
    });
  } catch (err) {
    return next(err);
  }
}

export async function loginAdmin(req, res, next) {
  try {
    const email = sanitizeEmail(req.body?.email);
    const password = String(req.body?.password || '');

    const admin = await Admin.findOne({ email }).select('+passwordHash');
    if (!admin || !admin.isActive) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const matched = await comparePassword(password, admin.passwordHash);
    if (!matched) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    admin.lastLoginAt = new Date();
    await admin.save();

    const token = generateAccessToken(admin);

    return res.json({
      message: 'Login successful',
      token,
      admin: {
        id: admin._id,
        email: admin.email,
        fullName: admin.fullName,
        role: admin.role
      }
    });
  } catch (err) {
    return next(err);
  }
}

export async function getMe(req, res, next) {
  try {
    const admin = await Admin.findById(req.admin.id).lean();
    if (!admin) return res.status(404).json({ message: 'Admin not found' });

    return res.json({
      admin: {
        id: admin._id,
        email: admin.email,
        fullName: admin.fullName,
        role: admin.role,
        lastLoginAt: admin.lastLoginAt
      }
    });
  } catch (err) {
    return next(err);
  }
}
