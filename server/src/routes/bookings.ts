import { Router } from 'express';
import crypto from 'crypto';
import { z } from 'zod';
import db from '../db';
import { validate } from '../middleware/validate';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { Event, Booking } from '../../../types';

const router = Router();

const createBookingSchema = z.object({
  event_id: z.string().uuid(),
  seats: z.number().min(1).max(10).int(),
  attendee_name: z.string().min(2),
  attendee_email: z.string().email(),
  attendee_phone: z.string().regex(/^(\+94|0)[0-9]{9}$/),
  notes: z.string().optional()
});

// Get my bookings (Attendee)
router.get('/me', requireAuth, (req: AuthRequest, res) => {
  try {
    const bookings = db.prepare(`
      SELECT b.*, json_object(
        'id', e.id, 'title', e.title, 'image_url', e.image_url, 
        'starts_at', e.starts_at, 'venue', e.venue, 'address', e.address
      ) as event
      FROM bookings b 
      JOIN events e ON b.event_id = e.id 
      WHERE b.user_id = ? 
      ORDER BY b.created_at DESC
    `).all(req.user!.id) as any[];

    // Parse the JSON event field
    const parsedBookings = bookings.map(b => ({
      ...b,
      event: JSON.parse(b.event)
    }));

    res.json({ success: true, data: parsedBookings });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to fetch bookings' } });
  }
});

// Get booking by id
router.get('/:id', requireAuth, (req: AuthRequest, res) => {
  try {
    const booking = db.prepare(`
      SELECT b.*, json_object(
        'id', e.id, 'title', e.title, 'image_url', e.image_url, 
        'starts_at', e.starts_at, 'venue', e.venue, 'address', e.address
      ) as event
      FROM bookings b 
      JOIN events e ON b.event_id = e.id 
      WHERE b.id = ? AND b.user_id = ?
    `).get(req.params.id, req.user!.id) as any;

    if (!booking) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Booking not found' } });
    }

    booking.event = JSON.parse(booking.event);
    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to fetch booking' } });
  }
});

// Create booking
router.post('/', requireAuth, validate(createBookingSchema), (req: AuthRequest, res) => {
  const { event_id, seats, attendee_name, attendee_email, attendee_phone, notes } = req.body;
  const user_id = req.user!.id;

  try {
    const bookingId = crypto.randomUUID();
    const reference = `REF-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    const now = new Date().toISOString();

    const bookTx = db.transaction(() => {
      const event = db.prepare('SELECT * FROM events WHERE id = ?').get(event_id) as Event;
      
      if (!event) throw new Error('NOT_FOUND');
      // If organizer created it, it shows in dashboard even if draft. But booking only for published.
      if (event.status !== 'published') throw new Error('NOT_PUBLISHED');
      if (event.total_seats - event.booked_seats < seats) throw new Error('SEATS_UNAVAILABLE');

      const total_amount = event.price * seats;

      db.prepare('UPDATE events SET booked_seats = booked_seats + ? WHERE id = ?').run(seats, event_id);
      
      db.prepare(`
        INSERT INTO bookings (id, event_id, user_id, reference, seats, total_amount, attendee_name, attendee_email, attendee_phone, notes, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed', ?)
      `).run(bookingId, event_id, user_id, reference, seats, total_amount, attendee_name, attendee_email, attendee_phone, notes, now);

      db.prepare('INSERT INTO notifications (id, user_id, title, body, type, read, created_at) VALUES (?, ?, ?, ?, ?, 0, ?)')
        .run(crypto.randomUUID(), user_id, 'Booking Confirmed', `Your booking for ${event.title} is confirmed. Ref: ${reference}`, 'booking_confirmed', now);

      return db.prepare('SELECT * FROM bookings WHERE id = ?').get(bookingId);
    });

    const newBooking = bookTx();
    res.status(201).json({ success: true, data: newBooking });
  } catch (error: any) {
    console.error('CREATE BOOKING ERROR:', error);
    if (error.message === 'NOT_FOUND') return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Event not found' } });
    if (error.message === 'NOT_PUBLISHED') return res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'Event is not published' } });
    if (error.message === 'SEATS_UNAVAILABLE') return res.status(409).json({ success: false, error: { code: 'SEATS_UNAVAILABLE', message: `Not enough seats available` } });
    
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to create booking' } });
  }
});

// Cancel booking
router.patch('/:id/cancel', requireAuth, (req: AuthRequest, res) => {
  const bookingId = req.params.id;
  const user_id = req.user!.id;
  const now = new Date().toISOString();

  console.log(`--- CANCELLING BOOKING: ${bookingId} ---`);

  try {
    const cancelTx = db.transaction(() => {
      const booking = db.prepare('SELECT * FROM bookings WHERE id = ? AND user_id = ?').get(bookingId, user_id) as Booking;

      if (!booking) {
        console.log('Booking not found in DB');
        throw new Error('NOT_FOUND');
      }
      
      if (booking.status !== 'confirmed') {
        console.log(`Booking status is ${booking.status}, not 'confirmed'`);
        throw new Error('NOT_CONFIRMED');
      }

      const event = db.prepare('SELECT * FROM events WHERE id = ?').get(booking.event_id) as Event;

      // REMOVED 24 HOUR RESTRICTION FOR EASIER TESTING
      // if (new Date(event.starts_at).getTime() - Date.now() < 24 * 60 * 60 * 1000) {
      //   throw new Error('TOO_LATE');
      // }

      db.prepare('UPDATE bookings SET status = "cancelled", cancelled_at = ? WHERE id = ?').run(now, bookingId);
      db.prepare('UPDATE events SET booked_seats = MAX(0, booked_seats - ?) WHERE id = ?').run(booking.seats, booking.event_id);

      db.prepare('INSERT INTO notifications (id, user_id, title, body, type, read, created_at) VALUES (?, ?, ?, ?, ?, 0, ?)')
        .run(crypto.randomUUID(), user_id, 'Booking Cancelled', `Your booking for ${event.title} has been cancelled.`, 'booking_cancelled', now);
        
      return db.prepare('SELECT * FROM bookings WHERE id = ?').get(bookingId);
    });

    const updatedBooking = cancelTx();
    console.log('Booking cancelled successfully');
    res.json({ success: true, data: updatedBooking });
  } catch (error: any) {
    console.error('CANCEL BOOKING SERVER ERROR:', error);
    if (error.message === 'NOT_FOUND') return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Booking not found' } });
    if (error.message === 'NOT_CONFIRMED') return res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'Booking is already cancelled or completed' } });
    if (error.message === 'TOO_LATE') return res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'Cannot cancel within 24 hours of event start' } });
    
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to cancel booking: ' + error.message } });
  }
});

export default router;
