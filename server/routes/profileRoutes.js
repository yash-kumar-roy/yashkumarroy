import { Router } from 'express';
import { Profile } from '../models/Profile.js';
import { defaultProfile } from '../data/profileDefaults.js';
import { getDbStatus } from '../config/db.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { pick, requireDb, toStringList } from '../utils/helpers.js';

const router = Router();

const EDITABLE = [
  'name', 'role', 'tagline', 'about', 'location', 'availability', 'email',
  'avatar', 'resumeUrl', 'socials', 'heroMetric', 'experience', 'education', 'skills'
];

router.get('/', async (_req, res, next) => {
  try {
    if (getDbStatus().connected) {
      const profile = await Profile.findOne({ key: 'main' }).lean();
      if (profile) return res.json({ success: true, source: 'mongodb', data: { ...defaultProfile, ...profile } });
    }
    return res.json({ success: true, source: 'default', data: defaultProfile });
  } catch (error) {
    return next(error);
  }
});

router.put('/', requireAdmin, requireDb, async (req, res, next) => {
  try {
    const update = pick(req.body, EDITABLE);
    if (update.about) update.about = (Array.isArray(update.about) ? update.about : [update.about]).map(String).filter((p) => p.trim());
    if (Array.isArray(update.experience)) {
      update.experience = update.experience.map((e) => ({ ...e, bullets: toStringList(e.bullets ?? []), tags: toStringList(e.tags ?? []) }));
    }
    if (Array.isArray(update.skills)) {
      update.skills = update.skills.map((s) => ({ group: s.group, items: toStringList(s.items ?? []) }));
    }
    if (update.heroMetric) update.heroMetric.value = Number(update.heroMetric.value) || 0;

    const profile = await Profile.findOneAndUpdate(
      { key: 'main' },
      { $set: update, $setOnInsert: { key: 'main' } },
      { new: true, upsert: true, runValidators: true }
    ).lean();
    return res.json({ success: true, data: { ...defaultProfile, ...profile } });
  } catch (error) {
    return next(error);
  }
});

export default router;
