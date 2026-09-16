import * as SQLite from 'expo-sqlite';

const dbName = 'eventhub_local.db';
let db: SQLite.SQLiteDatabase | null = null;

export const initLocalDb = async () => {
  db = await SQLite.openDatabaseAsync(dbName);
  
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    
    CREATE TABLE IF NOT EXISTS cached_events (
      id TEXT PRIMARY KEY,
      payload TEXT NOT NULL,
      cached_at TEXT NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS favourites (
      event_id TEXT PRIMARY KEY,
      added_at TEXT NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS preferences (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
  
  return db;
};

export const getLocalDb = () => {
  if (!db) throw new Error('Local database not initialized');
  return db;
};

// --- Favourites ---
export const addFavourite = async (eventId: string) => {
  const d = getLocalDb();
  await d.runAsync('INSERT OR IGNORE INTO favourites (event_id, added_at) VALUES (?, ?)', eventId, new Date().toISOString());
};

export const removeFavourite = async (eventId: string) => {
  const d = getLocalDb();
  await d.runAsync('DELETE FROM favourites WHERE event_id = ?', eventId);
};

export const getFavourites = async () => {
  const d = getLocalDb();
  const all = await d.getAllAsync('SELECT event_id FROM favourites');
  return all.map((row: any) => row.event_id) as string[];
};

// --- Cache ---
export const cacheEvent = async (id: string, payload: any) => {
  const d = getLocalDb();
  await d.runAsync(
    'INSERT OR REPLACE INTO cached_events (id, payload, cached_at) VALUES (?, ?, ?)',
    id, JSON.stringify(payload), new Date().toISOString()
  );
};

export const cacheEvents = async (events: any[]) => {
  const d = getLocalDb();
  const now = new Date().toISOString();
  
  for (const ev of events) {
    await d.runAsync(
      'INSERT OR REPLACE INTO cached_events (id, payload, cached_at) VALUES (?, ?, ?)',
      ev.id, JSON.stringify(ev), now
    );
  }
};

export const getCachedEvents = async () => {
  const d = getLocalDb();
  const all = await d.getAllAsync('SELECT payload FROM cached_events ORDER BY cached_at DESC LIMIT 50');
  return all.map((row: any) => JSON.parse(row.payload));
};

export const getCachedEvent = async (id: string) => {
  const d = getLocalDb();
  const row: any = await d.getFirstAsync('SELECT payload FROM cached_events WHERE id = ?', id);
  return row ? JSON.parse(row.payload) : null;
};

export const clearCache = async () => {
  const d = getLocalDb();
  await d.runAsync('DELETE FROM cached_events');
};

export const getCacheSizeInfo = async () => {
  const d = getLocalDb();
  const row: any = await d.getFirstAsync('SELECT COUNT(*) as count FROM cached_events');
  return row.count;
};

// --- Preferences ---
export const setPreference = async (key: string, value: string) => {
  const d = getLocalDb();
  await d.runAsync('INSERT OR REPLACE INTO preferences (key, value) VALUES (?, ?)', key, value);
};

export const getPreference = async (key: string) => {
  const d = getLocalDb();
  const row: any = await d.getFirstAsync('SELECT value FROM preferences WHERE key = ?', key);
  return row ? row.value : null;
};
