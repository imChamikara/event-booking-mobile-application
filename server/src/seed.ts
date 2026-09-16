import db, { initDb } from './db';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

function seed() {
  initDb();

  // Check if already seeded
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (userCount.count > 0) {
    console.log('Database already seeded.');
    return;
  }

  console.log('Seeding database...');

  const passwordHash = bcrypt.hashSync('password123', 10);
  const now = new Date().toISOString();

  // Users
  const users = [
    { id: crypto.randomUUID(), name: 'John Organizer', email: 'org1@test.com', phone: '0771111111', role: 'organizer' },
    { id: crypto.randomUUID(), name: 'Jane Organizer', email: 'org2@test.com', phone: '0772222222', role: 'organizer' },
    { id: crypto.randomUUID(), name: 'Alice Attendee', email: 'att1@test.com', phone: '0773333333', role: 'attendee' },
    { id: crypto.randomUUID(), name: 'Bob Attendee', email: 'att2@test.com', phone: '0774444444', role: 'attendee' },
    { id: crypto.randomUUID(), name: 'Charlie Attendee', email: 'att3@test.com', phone: '0775555555', role: 'attendee' },
    { id: crypto.randomUUID(), name: 'Diana Attendee', email: 'att4@test.com', phone: '0776666666', role: 'attendee' },
    { id: crypto.randomUUID(), name: 'Eve Attendee', email: 'att5@test.com', phone: '0777777777', role: 'attendee' },
    { id: crypto.randomUUID(), name: 'Frank Attendee', email: 'att6@test.com', phone: '0778888888', role: 'attendee' },
  ];

  const insertUser = db.prepare(`
    INSERT INTO users (id, name, email, password_hash, phone, role, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  for (const u of users) {
    insertUser.run(u.id, u.name, u.email, passwordHash, u.phone, u.role, now);
  }

  // Events
  const categories = ['Music', 'Sports', 'Tech', 'Food', 'Arts', 'Business', 'Wellness', 'Education'];
  const locations = [
    { city: 'Colombo', lat: 6.9271, lng: 79.8612 },
    { city: 'Kandy', lat: 7.2906, lng: 80.6337 },
    { city: 'Galle', lat: 6.0328, lng: 80.2150 },
    { city: 'Negombo', lat: 7.2088, lng: 79.8362 }
  ];

  const events = [];
  const insertEvent = db.prepare(`
    INSERT INTO events (id, organizer_id, title, description, image_url, category, starts_at, ends_at, venue, address, latitude, longitude, price, total_seats, booked_seats, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const images = [
    'https://images.unsplash.com/photo-1459749411175-04bf5292ceea',
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87',
    'https://images.unsplash.com/photo-1511512578047-dfb367046420',
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30',
    'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4'
  ];

  for (let i = 1; i <= 20; i++) {
    const org = users[i % 2];
    const cat = categories[i % categories.length];
    const loc = locations[i % locations.length];
    
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + (i * 2));
    const endDate = new Date(futureDate);
    endDate.setHours(endDate.getHours() + 3);

    const eventId = crypto.randomUUID();
    events.push({ id: eventId, price: i * 500, title: `${cat} Festival ${i}` });

    insertEvent.run(
      eventId,
      org.id,
      `${cat} Festival ${i}`,
      `Join us for an amazing ${cat} event in ${loc.city}. A great experience awaits!`,
      images[i % images.length],
      cat,
      futureDate.toISOString(),
      endDate.toISOString(),
      `${loc.city} Convention Center`,
      `123 Main St, ${loc.city}`,
      loc.lat,
      loc.lng,
      i * 500,
      100 + i * 10,
      0, // booked seats
      'published',
      now
    );
  }

  // Bookings
  const insertBooking = db.prepare(`
    INSERT INTO bookings (id, event_id, user_id, reference, seats, total_amount, attendee_name, attendee_email, attendee_phone, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (let i = 0; i < 6; i++) {
    const event = events[i];
    const user = users[2 + i]; // Attendees start at index 2
    
    insertBooking.run(
      crypto.randomUUID(),
      event.id,
      user.id,
      `REF${i}${Math.floor(Math.random() * 10000)}`,
      2,
      event.price * 2,
      user.name,
      user.email,
      user.phone,
      'confirmed',
      now
    );
    
    db.prepare('UPDATE events SET booked_seats = booked_seats + 2 WHERE id = ?').run(event.id);
  }

  console.log('Seeding complete.');
}

seed();
