import Database from 'better-sqlite3';
import { config } from '../config';
import { logger } from '../utils/logger';

export const db = new Database(config.DATABASE_PATH);

export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS makes (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS vehicle_types (
      type_id INTEGER NOT NULL,
      type_name TEXT NOT NULL,
      make_id INTEGER NOT NULL,
      PRIMARY KEY (type_id, make_id),
      FOREIGN KEY (make_id) REFERENCES makes(id) ON DELETE CASCADE
    );
  `);
  logger.info('Database initialized successfully.');
}