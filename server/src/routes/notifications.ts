import { Router } from 'express';
import db from '../db';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

// Get my notifications
router.get('/me', requireAuth, (req: AuthRequest, res) => {
  try {
    const notifications = db.prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC').all(req.user!.id);
    res.json({ success: true, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to fetch notifications' } });
  }
});

// Mark notification as read
router.patch('/:id/read', requireAuth, (req: AuthRequest, res) => {
  const notifId = req.params.id;
  const userId = req.user!.id;

  try {
    const info = db.prepare('UPDATE notifications SET read = 1 WHERE id = ? AND user_id = ?').run(notifId, userId);
    
    if (info.changes === 0) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Notification not found' } });
    }

    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to update notification' } });
  }
});

export default router;
