import type { SQLiteTable } from 'drizzle-orm/sqlite-core';

import type { Db } from './types';

// Keeps each multi-row INSERT well under SQLite's bound-variable limit
const CHUNK_SIZE = 500;

export const insertChunked = <T extends SQLiteTable>(
  db: Db,
  table: T,
  rows: T['$inferInsert'][]
) => {
  for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
    db.insert(table)
      .values(rows.slice(i, i + CHUNK_SIZE) as any)
      .run();
  }
};
