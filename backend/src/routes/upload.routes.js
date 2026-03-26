import { Router } from 'express';
import multer from 'multer';
import { uploadDraftImage } from '../controllers/upload.controller.js';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

router.post('/cloudinary', upload.single('image'), uploadDraftImage);

export default router;
