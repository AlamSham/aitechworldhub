import { Router } from 'express';
import authRoutes from './auth.routes.js';
import draftRoutes from './draft.routes.js';
import publicRoutes from './public.routes.js';
import syncRoutes from './sync.routes.js';
import uploadRoutes from './upload.routes.js';
import interactionRoutes from './interaction.routes.js';
import { requireAdminAuth } from '../middlewares/auth.middleware.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/public', publicRoutes);
router.use('/drafts', requireAdminAuth, draftRoutes);
router.use('/sync', requireAdminAuth, syncRoutes);
router.use('/images', requireAdminAuth, uploadRoutes);
router.use('/interactions', requireAdminAuth, interactionRoutes);

export default router;
