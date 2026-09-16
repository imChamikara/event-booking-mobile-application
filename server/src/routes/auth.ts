import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { z } from 'zod';
import db from '../db';
import { validate } from '../middleware/validate';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

const registerSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, 'Password must contain at least one letter and one number'),
  phone: z.string().regex(/^(\+94|0)[0-9]{9}$/, 'Invalid phone number format'),
  role: z.enum(['attendee', 'organizer'])
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

router.post('/register', validate(registerSchema), (req, res) => {
  const { name, email, password, phone, role } = req.body;

  try {
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(409).json({ success: false, error: { code: 'EMAIL_EXISTS', message: 'Email already registered' } });
    }

    const id = crypto.randomUUID();
    const password_hash = bcrypt.hashSync(password, 10);
    const created_at = new Date().toISOString();

    db.prepare('INSERT INTO users (id, name, email, password_hash, phone, role, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(id, name, email, password_hash, phone, role, created_at);

    const user = { id, name, email, phone, avatar_url: null, role, created_at };
    const token = jwt.sign({ id }, process.env.JWT_SECRET || 'supersecret123', { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any });

    res.status(201).json({ success: true, data: { user, token } });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to register' } });
  }
});

router.post('/login', validate(loginSchema), (req, res) => {
  const { email, password } = req.body;

  try {
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
    
    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } });
    }

    delete user.password_hash;
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'supersecret123', { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any });

    res.json({ success: true, data: { user, token } });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to login' } });
  }
});

router.get('/me', requireAuth, (req: AuthRequest, res) => {
  res.json({ success: true, data: req.user });
});

export default router;
