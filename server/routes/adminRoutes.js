import { Router } from 'express';
import {
  adminConfigured,
  checkPassword,
  createSessionToken,
  isAdminRequest,
  loginRateLimit
} from '../middleware/requireAdmin.js';
import { getDbStatus } from '../config/db.js';

const router = Router();

router.post('/login', loginRateLimit, (req, res) => {
  if (!process.env.ADMIN_PASSWORD?.trim()) {
    return res.status(403).json({
      success: false,
      message: 'Admin login is disabled. Add ADMIN_PASSWORD to .env and restart the server.'
    });
  }
  if (!checkPassword(req.body?.password)) {
    return res.status(401).json({ success: false, message: 'That password is incorrect.' });
  }
  return res.json({ success: true, ...createSessionToken() });
});

// Lets the dashboard check whether its stored token is still valid.
router.get('/me', (req, res) => {
  res.json({
    success: true,
    configured: adminConfigured(),
    authenticated: isAdminRequest(req),
    database: getDbStatus().connected
  });
});

export default router;
