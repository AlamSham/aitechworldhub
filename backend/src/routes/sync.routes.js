import { Router } from 'express';
import { manualSync } from '../controllers/sync.controller.js';

const router = Router();

router.post('/manual', manualSync);

export default router;
