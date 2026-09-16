import { Router } from 'express';
import crypto from 'crypto';
import { z } from 'zod';
import db from '../db';
import { validate } from '../middleware/validate';
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth';
import { Event } from '../../../types';

const router = Router();

const createEventSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  image_url: z.string().url(),
  category: z.string(),
  starts_at: z.string(),
  ends_at: z.string(),
  venue: z.string().min(3),
  address: z.string().min(5),
  latitude: z.number(),
  longitude: z.number(),
  price: z.number().min(0),
  total_seats: z.number().min(1).int(),
  status: z.enum(['draft', 'published'])
});

const updateEventSchema = createEventSchema.partial();

// Get all events (public)
router.get('/', (req, res) => {
  const { search, category, minPrice, maxPrice, from, to, page = '1', limit = '10' } = req.query;
  
  let query = 'SELECT e.*, u.name as organizer_name FROM events e JOIN users u ON e.organizer_id = u.id WHERE e.status = "published"';
  const params: any[] = [];

  if (search) {
    query += ' AND (e.title LIKE ? OR e.description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }
  if (category) {
    query += ' AND e.category = ?';
    params.push(category);
  }
  if (minPrice) {
    query += ' AND e.price >= ?';
    params.push(Number(minPrice));
  }
  if (maxPrice) {
    query += ' AND e.price <= ?';
    params.push(Number(maxPrice));
  }
  if (from) {
    query += ' AND e.starts_at >= ?';
    params.push(String(from));
  }
  if (to) {
    query += ' AND e.starts_at <= ?';
    params.push(String(to));
  }

  query += ' ORDER BY e.starts_at ASC';

  const limitNum = Number(limit);
  const offset = (Number(page) - 1) * limitNum;
  query += ' LIMIT ? OFFSET ?';
  params.push(limitNum, offset);

  try {
    const events = db.prepare(query).all(...params);
    res.json({ success: true, data: events });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to fetch events' } });
  }
});

// Get event by id
router.get('/:id', (req, res) => {
  try {
    const event = db.prepare('SELECT e.*, u.name as organizer_name FROM events e JOIN users u ON e.organizer_id = u.id WHERE e.id = ?').get(req.params.id) as Event;
    if (!event) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Event not found' } });
    }
    res.json({ success: true, data: event });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to fetch event' } });
  }
});

// Create event (Organizer only)
router.post('/', requireAuth, requireRole('organizer'), validate(createEventSchema), (req: AuthRequest, res) => {
  const id = crypto.randomUUID();
  const created_at = new Date().toISOString();
  const data = req.body;
  
  try {
    db.prepare(`
      INSERT INTO events (id, organizer_id, title, description, image_url, category, starts_at, ends_at, venue, address, latitude, longitude, price, total_seats, booked_seats, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
    `).run(id, req.user!.id, data.title, data.description, data.image_url, data.category, data.starts_at, data.ends_at, data.venue, data.address, data.latitude, data.longitude, data.price, data.total_seats, data.status, created_at);
    
    const event = db.prepare('SELECT * FROM events WHERE id = ?').get(id);
    res.status(201).json({ success: true, data: event });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to create event' } });
  }
});

// Update event (Organizer only, owner only)
router.patch('/:id', requireAuth, requireRole('organizer'), validate(updateEventSchema), (req: AuthRequest, res) => {
  const eventId = req.params.id;
  
  try {
    const event = db.prepare('SELECT * FROM events WHERE id = ?').get(eventId) as Event;
    if (!event) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Event not found' } });
    if (event.organizer_id !== req.user!.id) return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Not the owner' } });

    const data = req.body;
    const updates = [];
    const values = [];

    for (const [key, value] of Object.entries(data)) {
      updates.push(`${key} = ?`);
      values.push(value);
    }

    if (updates.length > 0) {
      values.push(eventId);
      db.prepare(`UPDATE events SET ${updates.join(', ')} WHERE id = ?`).run(...values);
      
      // If status changed from draft to published, we don't notify because there are no attendees yet.
      // But if it's already published and being updated, we should notify attendees.
      if (event.status === 'published' && data.status !== 'cancelled') {
        const bookings = db.prepare('SELECT user_id FROM bookings WHERE event_id = ? AND status = "confirmed"').all(eventId) as any[];
        const now = new Date().toISOString();
        const insertNotif = db.prepare('INSERT INTO notifications (id, user_id, title, body, type, read, created_at) VALUES (?, ?, ?, ?, ?, 0, ?)');
        const insertMany = db.transaction((bks) => {
          for (const b of bks) {
            insertNotif.run(crypto.randomUUID(), b.user_id, 'Event Updated', `The event "${event.title}" has been updated.`, 'event_updated', now);
          }
        });
        insertMany(bookings);
      }
    }

    const updatedEvent = db.prepare('SELECT * FROM events WHERE id = ?').get(eventId);
    res.json({ success: true, data: updatedEvent });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to update event' } });
  }
});

// Delete event (Soft delete)
router.delete('/:id', requireAuth, requireRole('organizer'), (req: AuthRequest, res) => {
  const eventId = req.params.id;
  
  try {
    const event = db.prepare('SELECT * FROM events WHERE id = ?').get(eventId) as Event;
    if (!event) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Event not found' } });
    if (event.organizer_id !== req.user!.id) return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Not the owner' } });

    db.prepare('UPDATE events SET status = "cancelled" WHERE id = ?').run(eventId);
    
    // Notify all confirmed attendees
    const bookings = db.prepare('SELECT user_id FROM bookings WHERE event_id = ? AND status = "confirmed"').all(eventId) as any[];
    const now = new Date().toISOString();
    const insertNotif = db.prepare('INSERT INTO notifications (id, user_id, title, body, type, read, created_at) VALUES (?, ?, ?, ?, ?, 0, ?)');
    const insertMany = db.transaction((bks) => {
      for (const b of bks) {
        insertNotif.run(crypto.randomUUID(), b.user_id, 'Event Cancelled', `The event "${event.title}" has been cancelled by the organizer.`, 'event_updated', now);
      }
    });
    insertMany(bookings);

    res.json({ success: true, message: 'Event cancelled successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to cancel event' } });
  }
});

// Get bookings for an event (Organizer only)
router.get('/:id/bookings', requireAuth, requireRole('organizer'), (req: AuthRequest, res) => {
  const eventId = req.params.id;
  
  try {
    const event = db.prepare('SELECT organizer_id FROM events WHERE id = ?').get(eventId) as Event;
    if (!event) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Event not found' } });
    if (event.organizer_id !== req.user!.id) return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Not the owner' } });

    const bookings = db.prepare('SELECT * FROM bookings WHERE event_id = ? ORDER BY created_at DESC').all(eventId);
    res.json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to fetch event bookings' } });
  }
});

export default router;
