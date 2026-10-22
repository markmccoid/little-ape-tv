import type { BaseSQLiteDatabase } from 'drizzle-orm/sqlite-core';

import type * as schema from './schema';
import type { seasonSummaries, shows, tags } from './schema';

//~ Works with both expo-sqlite (app) and better-sqlite3 (tests); both are sync drivers
export type Db = BaseSQLiteDatabase<'sync', unknown, typeof schema>;

export type ShowRow = typeof shows.$inferSelect;
export type SeasonSummaryRow = Omit<typeof seasonSummaries.$inferSelect, 'showId'>;
export type TagRow = typeof tags.$inferSelect;
