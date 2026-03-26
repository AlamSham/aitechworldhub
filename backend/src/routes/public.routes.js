import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { getPublishedDraftBySlug, listPublishedDrafts, getRelatedPosts } from '../controllers/draft.controller.js';
import { subscribeToNewsletter, submitContactMessage } from '../controllers/interaction.controller.js';

const router = Router();

const subscribeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many subscription attempts. Try again later.' }
});

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many contact submissions. Try again later.' }
});

router.get('/posts', listPublishedDrafts);
router.get('/posts/:slug', getPublishedDraftBySlug);
router.get('/posts/:slug/related', getRelatedPosts);

router.post('/subscribe', subscribeLimiter, subscribeToNewsletter);
router.post('/contact', contactLimiter, submitContactMessage);

export default router;
