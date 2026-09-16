import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.resolve(__dirname, '..', 'eventhub.db');
console.log('Using database at:', dbPath);
const db = new Database(dbPath, { verbose: (sql) => console.log('SQL:', sql) });

// Enable foreign keys
db.pragma('foreign_keys = ON');

export function initDb() {
  console.log('Initializing database tables...');
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      phone TEXT NOT NULL,
      avatar_url TEXT,
      role TEXT CHECK(role IN ('attendee', 'organizer')) NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      organizer_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      image_url TEXT NOT NULL,
      category TEXT NOT NULL,
      starts_at TEXT NOT NULL,
      ends_at TEXT NOT NULL,
      venue TEXT NOT NULL,
      address TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      price REAL NOT NULL,
      total_seats INTEGER NOT NULL,
      booked_seats INTEGER DEFAULT 0 NOT NULL,
      status TEXT CHECK(status IN ('draft', 'published', 'cancelled')) NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY(organizer_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      event_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      reference TEXT UNIQUE NOT NULL,
      seats INTEGER NOT NULL,
      total_amount REAL NOT NULL,
      attendee_name TEXT NOT NULL,
      attendee_email TEXT NOT NULL,
      attendee_phone TEXT NOT NULL,
      notes TEXT,
      status TEXT CHECK(status IN ('confirmed', 'cancelled', 'completed')) NOT NULL,
      created_at TEXT NOT NULL,
      cancelled_at TEXT,
      FOREIGN KEY(event_id) REFERENCES events(id) ON DELETE RESTRICT,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      type TEXT NOT NULL,
      read INTEGER DEFAULT 0 NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);
}

export default db;
