import { getDbStatus } from '../config/db.js';

export function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

/** Keep only the listed keys from an object (prevents writing arbitrary fields like _id). */
export function pick(source, keys) {
  const out = {};
  for (const key of keys) {
    if (source && Object.prototype.hasOwnProperty.call(source, key)) out[key] = source[key];
  }
  return out;
}

export const toStringList = (value) =>
  (Array.isArray(value) ? value : String(value || '').split(','))
    .map((v) => String(v).trim())
    .filter(Boolean);

/** Middleware: reject writes when MongoDB isn't connected. */
export function requireDb(_req, res, next) {
  if (!getDbStatus().connected) {
    return res.status(503).json({
      success: false,
      message: 'MongoDB isn’t connected, so changes can’t be saved. Check MONGODB_URI in .env and restart the server.'
    });
  }
  return next();
}
