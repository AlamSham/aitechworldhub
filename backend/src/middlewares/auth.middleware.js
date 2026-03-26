import { Admin } from '../models/admin.model.js';
import { verifyAccessToken } from '../services/auth.service.js';

export async function requireAdminAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const payload = verifyAccessToken(token);
    const admin = await Admin.findById(payload.sub).lean();

    if (!admin || !admin.isActive) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    req.admin = {
      id: String(admin._id),
      email: admin.email,
      role: admin.role
    };

    return next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}
