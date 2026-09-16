import { Router } from 'express';
import db from '../db';
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

// Get my events (Organizer)
router.get('/me/events', requireAuth, requireRole('organizer'), (req: AuthRequest, res) => {
  try {
    const events = db.prepare('SELECT * FROM events WHERE organizer_id = ? ORDER BY created_at DESC').all(req.user!.id);
    res.json({ success: true, data: events });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to fetch organizer events' } });
  }
});

export default router;
