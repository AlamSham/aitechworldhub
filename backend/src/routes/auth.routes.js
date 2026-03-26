import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { getMe, loginAdmin, registerAdmin } from '../controllers/auth.controller.js';
import { requireAdminAuth } from '../middlewares/auth.middleware.js';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many auth attempts. Try again later.' }
});

router.post('/register', authLimiter, registerAdmin);
router.post('/login', authLimiter, loginAdmin);
router.get('/me', requireAdminAuth, getMe);

export default router;
