import { Router } from 'express';
import { getDraftById, listDrafts, updateDraft } from '../controllers/draft.controller.js';

const router = Router();

router.get('/', listDrafts);
router.get('/:id', getDraftById);
router.patch('/:id', updateDraft);

export default router;
