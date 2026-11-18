import { Router } from 'express';
import mongoose from 'mongoose';
import { submitContact, getContacts } from '../controllers/contactController.js';
import { Contact } from '../models/Contact.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { requireDb } from '../utils/helpers.js';

const router = Router();

router.post('/', submitContact);
router.get('/', requireAdmin, getContacts);
router.delete('/:id', requireAdmin, requireDb, async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid message id' });
    await Contact.findByIdAndDelete(req.params.id);
    return res.json({ success: true });
  } catch (error) {
    return next(error);
  }
});

export default router;
