import type { BaseSQLiteDatabase } from 'drizzle-orm/sqlite-core';

import type * as schema from './schema';

//~ Works with both expo-sqlite (app) and better-sqlite3 (tests); both are sync drivers
export type Db = BaseSQLiteDatabase<'sync', unknown, typeof schema>;

export type ShowRow = typeof schema.shows.$inferSelect;
export type SeasonSummaryRow = Omit<typeof schema.seasonSummaries.$inferSelect, 'showId'>;
export type TagRow = typeof schema.tags.$inferSelect;
