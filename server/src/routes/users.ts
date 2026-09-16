import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import db from '../db';
import { validate } from '../middleware/validate';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().regex(/^(\+94|0)[0-9]{9}$/).optional(),
  avatar_url: z.string().url().optional()
});

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters').regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, 'Password must contain at least one letter and one number')
});

router.patch('/me', requireAuth, validate(updateProfileSchema), (req: AuthRequest, res) => {
  const { name, phone, avatar_url } = req.body;
  const userId = req.user!.id;

  try {
    const updates = [];
    const values = [];

    if (name) { updates.push('name = ?'); values.push(name); }
    if (phone) { updates.push('phone = ?'); values.push(phone); }
    if (avatar_url !== undefined) { updates.push('avatar_url = ?'); values.push(avatar_url); }

    if (updates.length === 0) {
      return res.json({ success: true, data: req.user });
    }

    values.push(userId);
    db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...values);
    
    const updatedUser = db.prepare('SELECT id, name, email, phone, avatar_url, role, created_at FROM users WHERE id = ?').get(userId);
    res.json({ success: true, data: updatedUser });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to update profile' } });
  }
});

router.patch('/me/password', requireAuth, validate(updatePasswordSchema), (req: AuthRequest, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user!.id;

  try {
    const user = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(userId) as any;
    
    if (!bcrypt.compareSync(currentPassword, user.password_hash)) {
      return res.status(401).json({ success: false, error: { code: 'INVALID_PASSWORD', message: 'Current password is incorrect' } });
    }

    const newHash = bcrypt.hashSync(newPassword, 10);
    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(newHash, userId);
    
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to update password' } });
  }
});

export default router;
