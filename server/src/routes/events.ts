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
  status: z.string() // Relaxed for better compatibility
});

const updateEventSchema = createEventSchema.partial();

// Get all events (public)
router.get('/', (req, res) => {
  const { search, category, minPrice, maxPrice, from, to, page = '1', limit = '50' } = req.query;

  console.log('--- FETCH PUBLIC EVENTS ---');

  try {
    // 1. Log ALL events for debugging
    const all = db.prepare('SELECT id, title, status FROM events').all();
    console.log('Current Database Events:', all);

    // 2. Build Query - WE REMOVE THE STATUS FILTER TEMPORARILY TO ENSURE DATA FLOW
    let query = 'SELECT e.*, u.name as organizer_name FROM events e JOIN users u ON e.organizer_id = u.id WHERE 1=1';
    const params: any[] = [];

    // Optional Filter - Can be re-enabled once data flow is confirmed
    // query += " AND LOWER(e.status) = 'published'";

    if (search) {
      query += ' AND (e.title LIKE ? OR e.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (category && category !== 'All') {
      query += ' AND e.category = ?';
      params.push(category);
    }

    query += ' ORDER BY e.starts_at ASC';
    const limitNum = Number(limit);
    const offset = (Number(page) - 1) * limitNum;
    query += ' LIMIT ? OFFSET ?';
    params.push(limitNum, offset);

    const events = db.prepare(query).all(...params);
    console.log(`Sending ${events.length} events to app`);
    res.json({ success: true, data: events });
  } catch (error) {
    console.error('SERVER ERROR IN GET /events:', error);
    res.status(500).json({ success: false, error: { message: 'Failed to fetch events' } });
  }
});

// Get event by id
router.get('/:id', (req, res) => {
  try {
    const event = db.prepare('SELECT e.*, u.name as organizer_name FROM events e JOIN users u ON e.organizer_id = u.id WHERE e.id = ?').get(req.params.id) as Event;
    if (!event) {
      return res.status(404).json({ success: false, error: { message: 'Event not found' } });
    }
    res.json({ success: true, data: event });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: 'Failed to fetch event' } });
  }
});

// Create event (Organizer only)
router.post('/', requireAuth, requireRole('organizer'), validate(createEventSchema), (req: AuthRequest, res) => {
  const id = crypto.randomUUID();
  const created_at = new Date().toISOString();
  const data = req.body;

  console.log('Creating event:', data.title);

  try {
    db.prepare(`
      INSERT INTO events (id, organizer_id, title, description, image_url, category, starts_at, ends_at, venue, address, latitude, longitude, price, total_seats, booked_seats, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
    `).run(id, req.user!.id, data.title, data.description, data.image_url, data.category, data.starts_at, data.ends_at, data.venue, data.address, data.latitude, data.longitude, data.price, data.total_seats, data.status.toLowerCase(), created_at);
    
    const event = db.prepare('SELECT e.*, u.name as organizer_name FROM events e JOIN users u ON e.organizer_id = u.id WHERE e.id = ?').get(id);
    res.status(201).json({ success: true, data: event });
  } catch (error) {
    console.error('FAILED TO CREATE EVENT:', error);
    res.status(500).json({ success: false, error: { message: 'Failed to create event' } });
  }
});

// Update event
router.patch('/:id', requireAuth, requireRole('organizer'), validate(updateEventSchema), (req: AuthRequest, res) => {
  const eventId = req.params.id;
  try {
    const event = db.prepare('SELECT * FROM events WHERE id = ?').get(eventId) as Event;
    if (!event) return res.status(404).json({ success: false, error: { message: 'Event not found' } });
    if (event.organizer_id !== req.user!.id) return res.status(403).json({ success: false, error: { message: 'Not the owner' } });

    const data = req.body;
    const updates = [];
    const values = [];

    for (const [key, value] of Object.entries(data)) {
      updates.push(`${key} = ?`);
      values.push(key === 'status' ? (value as string).toLowerCase() : value);
    }

    if (updates.length > 0) {
      values.push(eventId);
      db.prepare(`UPDATE events SET ${updates.join(', ')} WHERE id = ?`).run(...values);
    }

    const updatedEvent = db.prepare('SELECT * FROM events WHERE id = ?').get(eventId);
    res.json({ success: true, data: updatedEvent });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: 'Failed to update event' } });
  }
});

// Delete event
router.delete('/:id', requireAuth, requireRole('organizer'), (req: AuthRequest, res) => {
  const eventId = req.params.id;
  try {
    const event = db.prepare('SELECT * FROM events WHERE id = ?').get(eventId) as Event;
    if (!event) return res.status(404).json({ success: false, error: { message: 'Event not found' } });
    if (event.organizer_id !== req.user!.id) return res.status(403).json({ success: false, error: { message: 'Not the owner' } });

    db.prepare('UPDATE events SET status = "cancelled" WHERE id = ?').run(eventId);
    res.json({ success: true, message: 'Event cancelled' });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: 'Failed to cancel event' } });
  }
});

// Get bookings for an event
router.get('/:id/bookings', requireAuth, requireRole('organizer'), (req: AuthRequest, res) => {
  try {
    const bookings = db.prepare('SELECT * FROM bookings WHERE event_id = ? ORDER BY created_at DESC').all(req.params.id);
    res.json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: 'Failed to fetch bookings' } });
  }
});

export default router;
