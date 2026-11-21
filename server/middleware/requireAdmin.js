import crypto from 'node:crypto';

const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

// Secret used to sign admin session tokens. It must be the same on every server instance
// (serverless hosts like Vercel run many), so it's ADMIN_SECRET if set, otherwise derived from
// ADMIN_PASSWORD. Changing either one logs every session out.
function getSessionSecret() {
  const explicit = process.env.ADMIN_SECRET?.trim();
  if (explicit) return explicit;
  const password = process.env.ADMIN_PASSWORD?.trim() || process.env.ADMIN_TOKEN?.trim() || '';
  return crypto.createHash('sha256').update(`ykr-admin-session:${password}`).digest('hex');
}

function safeEqual(a, b) {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

function sign(payload) {
  return crypto.createHmac('sha256', getSessionSecret()).update(payload).digest('base64url');
}

export function adminConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD?.trim() || process.env.ADMIN_TOKEN?.trim());
}

export function checkPassword(password) {
  const expected = process.env.ADMIN_PASSWORD?.trim();
  return Boolean(expected) && typeof password === 'string' && safeEqual(password, expected);
}

export function createSessionToken() {
  const payload = Buffer.from(JSON.stringify({ sub: 'admin', exp: Date.now() + SESSION_TTL_MS })).toString('base64url');
  return { token: `${payload}.${sign(payload)}`, expiresIn: SESSION_TTL_MS };
}

function verifySessionToken(token) {
  const [payload, signature] = String(token).split('.');
  if (!payload || !signature || !safeEqual(signature, sign(payload))) return false;
  try {
    const { exp } = JSON.parse(Buffer.from(payload, 'base64url').toString());
    return typeof exp === 'number' && exp > Date.now();
  } catch {
    return false;
  }
}

export function isAdminRequest(req) {
  const header = req.get('authorization') || '';
  const provided = (header.startsWith('Bearer ') ? header.slice(7) : req.get('x-admin-token') || '').trim();
  if (!provided) return false;

  const staticToken = process.env.ADMIN_TOKEN?.trim();
  if (staticToken && safeEqual(provided, staticToken)) return true;
  return verifySessionToken(provided);
}

/**
 * Protects write/admin endpoints. Send `Authorization: Bearer <token>` where token is either
 * a session token from POST /api/admin/login or the static ADMIN_TOKEN from .env.
 */
export function requireAdmin(req, res, next) {
  if (!adminConfigured()) {
    return res.status(403).json({
      success: false,
      message: 'Admin is disabled. Set ADMIN_PASSWORD in .env and restart the server.'
    });
  }
  if (!isAdminRequest(req)) {
    return res.status(401).json({ success: false, message: 'Your admin session has expired. Log in again.' });
  }
  return next();
}

// Very small in-memory rate limiter for the login endpoint: 10 attempts / 15 min per IP.
const attempts = new Map();
export function loginRateLimit(req, res, next) {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  const entry = attempts.get(req.ip) || { count: 0, start: now };
  if (now - entry.start > windowMs) {
    entry.count = 0;
    entry.start = now;
  }
  entry.count += 1;
  attempts.set(req.ip, entry);
  if (entry.count > 10) {
    return res.status(429).json({ success: false, message: 'Too many login attempts. Try again in 15 minutes.' });
  }
  return next();
}
