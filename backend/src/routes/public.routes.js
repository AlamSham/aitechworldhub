import { Router } from 'express';
import { getPublishedDraftBySlug, listPublishedDrafts, getRelatedPosts } from '../controllers/draft.controller.js';
import { subscribeToNewsletter, submitContactMessage } from '../controllers/interaction.controller.js';

const router = Router();

router.get('/posts', listPublishedDrafts);
router.get('/posts/:slug', getPublishedDraftBySlug);
router.get('/posts/:slug/related', getRelatedPosts);

router.post('/subscribe', subscribeToNewsletter);
router.post('/contact', submitContactMessage);

export default router;
