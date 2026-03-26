import { Router } from 'express';
import { getSubscribers, getContactMessages, markContactMessageRead } from '../controllers/interaction.controller.js';

const router = Router();

router.get('/subscribers', getSubscribers);
router.get('/contacts', getContactMessages);
router.patch('/contacts/:id/read', markContactMessageRead);

export default router;
