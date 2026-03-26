import { uploadImageBuffer } from '../services/cloudinary.service.js';

export async function uploadDraftImage(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Image file required (field name: image)' });
    }

    const result = await uploadImageBuffer(req.file.buffer, req.file.originalname || 'draft-image');

    return res.status(201).json({
      message: 'Image uploaded',
      image: {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes
      }
    });
  } catch (err) {
    return next(err);
  }
}
