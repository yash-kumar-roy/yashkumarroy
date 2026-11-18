import { Router } from 'express';
import mongoose from 'mongoose';
import { Blog } from '../models/Blog.js';
import { getDbStatus } from '../config/db.js';
import { isAdminRequest, requireAdmin } from '../middleware/requireAdmin.js';
import { pick, requireDb, slugify, toStringList } from '../utils/helpers.js';

const router = Router();
const EDITABLE = ['title', 'slug', 'excerpt', 'content', 'coverImage', 'tags', 'published'];

function normalise(body) {
  const data = pick(body, EDITABLE);
  if ('tags' in data) data.tags = toStringList(data.tags);
  if ('published' in data) data.published = Boolean(data.published);
  if ('slug' in data || 'title' in data) data.slug = slugify(data.slug || data.title);
  return data;
}

// Public: published posts only. Admin (with token): all posts, including drafts.
router.get('/', async (req, res, next) => {
  try {
    if (!getDbStatus().connected) return res.json({ success: true, count: 0, data: [] });
    const filter = isAdminRequest(req) && req.query.all === 'true' ? {} : { published: true };
    const posts = await Blog.find(filter).select('-content').sort({ publishedAt: -1, createdAt: -1 }).lean();
    return res.json({ success: true, count: posts.length, data: posts });
  } catch (error) {
    return next(error);
  }
});

router.get('/:slug', async (req, res, next) => {
  try {
    if (!getDbStatus().connected) return res.status(404).json({ success: false, message: 'Post not found' });
    const post = await Blog.findOne({ slug: String(req.params.slug).toLowerCase() }).lean();
    if (!post || (!post.published && !isAdminRequest(req))) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    return res.json({ success: true, data: post });
  } catch (error) {
    return next(error);
  }
});

router.post('/', requireAdmin, requireDb, async (req, res, next) => {
  try {
    const data = normalise(req.body);
    if (!data.title?.trim()) return res.status(400).json({ success: false, message: 'Add a title before saving.' });
    if (data.published) data.publishedAt = new Date();
    const post = await Blog.create(data);
    return res.status(201).json({ success: true, data: post });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ success: false, message: 'Another post already uses this URL slug.' });
    return next(error);
  }
});

router.put('/:id', requireAdmin, requireDb, async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid post id' });
    const existing = await Blog.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: 'Post not found' });

    const data = normalise(req.body);
    if (data.published && !existing.publishedAt) data.publishedAt = new Date();
    existing.set(data);
    await existing.save();
    return res.json({ success: true, data: existing });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ success: false, message: 'Another post already uses this URL slug.' });
    return next(error);
  }
});

router.delete('/:id', requireAdmin, requireDb, async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid post id' });
    const deleted = await Blog.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Post not found' });
    return res.json({ success: true, message: 'Post deleted' });
  } catch (error) {
    return next(error);
  }
});

export default router;
