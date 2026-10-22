import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import path from 'path';

import * as schema from '../schema';

//~ In-memory database with the real migrations applied, for Jest tests
export const createTestDb = () => {
  const client = new Database(':memory:');
  client.pragma('foreign_keys = ON');
  const db = drizzle(client, { schema });
  migrate(db, { migrationsFolder: path.join(__dirname, '../../../drizzle') });
  return { client, db };
};
