import { Router } from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import { Media } from '../models/Media.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { requireDb } from '../utils/helpers.js';

const router = Router();

const ALLOWED = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif', 'application/pdf'];
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 4 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED.includes(file.mimetype)) return cb(null, true);
    const err = new Error('Upload a PNG, JPG, WebP, GIF, AVIF image or a PDF.');
    err.status = 400;
    return cb(err);
  }
});

function handleUpload(req, res, next) {
  upload.single('file')(req, res, (err) => {
    if (err?.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ success: false, message: 'Files must be 4 MB or smaller.' });
    if (err) return res.status(err.status || 400).json({ success: false, message: err.message });
    return next();
  });
}

router.post('/', requireAdmin, requireDb, handleUpload, async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Choose a file to upload.' });
    const media = await Media.create({
      filename: req.file.originalname,
      contentType: req.file.mimetype,
      size: req.file.size,
      data: req.file.buffer
    });
    return res.status(201).json({ success: true, data: { id: media._id, url: `/api/media/${media._id}`, filename: media.filename } });
  } catch (error) {
    return next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).end();
    const media = await Media.findById(req.params.id).lean();
    if (!media) return res.status(404).end();
    res.set({
      'Content-Type': media.contentType,
      'Content-Length': media.size,
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff'
    });
    return res.send(Buffer.from(media.data.buffer ?? media.data));
  } catch (error) {
    return next(error);
  }
});

router.delete('/:id', requireAdmin, requireDb, async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid file id' });
    await Media.findByIdAndDelete(req.params.id);
    return res.json({ success: true });
  } catch (error) {
    return next(error);
  }
});

export default router;
