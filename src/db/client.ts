import { drizzle, type ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import { migrate } from 'drizzle-orm/expo-sqlite/migrator';
import { deleteDatabaseSync, openDatabaseSync, type SQLiteDatabase } from 'expo-sqlite';

import { migrateFromMMKV } from './legacy/migrateFromMMKV';
import * as schema from './schema';
import migrations from '../../drizzle/migrations';

//~ -----------------------------------------------
//~ One SQLite database file per user: <userId>.db
//~ AuthManager opens it on login and closes it on logout.
//~ -----------------------------------------------
export type AppDatabase = ExpoSQLiteDatabase<typeof schema>;

type Connection = {
  userId: string;
  client: SQLiteDatabase;
  db: AppDatabase;
  // Resolves once schema migrations and the legacy MMKV import have run
  ready: Promise<void>;
};

let connection: Connection | undefined;

const databaseName = (userId: string) => `${userId}.db`;

export const openUserDatabase = (userId: string) => {
  if (connection?.userId === userId) return connection;
  closeUserDatabase();

  const client = openDatabaseSync(databaseName(userId));
  // WAL lets background tasks write while the app reads; foreign keys are off by default in SQLite
  client.execSync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
  const db = drizzle(client, { schema });

  const ready = (async () => {
    await migrate(db, migrations);
    migrateFromMMKV(db, userId);
  })();

  connection = { userId, client, db, ready };
  return connection;
};

export const closeUserDatabase = () => {
  if (!connection) return;
  connection.client.closeSync();
  connection = undefined;
};

export const deleteUserDatabase = (userId: string) => {
  if (connection?.userId === userId) closeUserDatabase();
  try {
    deleteDatabaseSync(databaseName(userId));
  } catch {
    // No database file for this user
  }
};

//# ------------------------------------------------------
//# Accessors
//# ------------------------------------------------------
export const getDb = (): AppDatabase => {
  if (!connection) throw new Error('Database not open. No user is logged in.');
  return connection.db;
};

export const databaseReady = (): Promise<void> => {
  if (!connection) return Promise.reject(new Error('Database not open. No user is logged in.'));
  return connection.ready;
};
