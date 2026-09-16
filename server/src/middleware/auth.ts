import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import db from '../db';
import { User } from '../../../types';

export interface AuthRequest extends Request {
  user?: User;
}

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Missing token' } });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'supersecret123') as { id: string };
    const user = db.prepare('SELECT id, name, email, phone, avatar_url, role, created_at FROM users WHERE id = ?').get(payload.id) as User;

    if (!user) {
      return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'User not found' } });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid token' } });
  }
};

export const requireRole = (role: 'attendee' | 'organizer') => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
    }
    
    if (req.user.role !== role) {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: `Requires ${role} role` } });
    }
    
    next();
  };
};
