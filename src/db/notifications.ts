import { desc, eq, sql } from 'drizzle-orm';

import { notificationHistory, shows, showWatchProviders } from './schema';
import type { Db } from './types';

//~ -----------------------------------------------
//~ Background notification bookkeeping on Saved Shows, and the notification
//~ history (the LAST notification check/send for each show).
//~ -----------------------------------------------
const DAY_SECONDS = 86400;

export type NotifyCandidate = Pick<
  typeof shows.$inferSelect,
  | 'id'
  | 'name'
  | 'showStatus'
  | 'nextAirDate'
  | 'nextNotifyOffset'
  | 'dateLastNotifyChecked'
  | 'lastNotifySeasonEpisode'
>;

export const selectNotifyCandidates = (db: Db): NotifyCandidate[] =>
  db
    .select({
      id: shows.id,
      name: shows.name,
      showStatus: shows.showStatus,
      nextAirDate: shows.nextAirDate,
      nextNotifyOffset: shows.nextNotifyOffset,
      dateLastNotifyChecked: shows.dateLastNotifyChecked,
      lastNotifySeasonEpisode: shows.lastNotifySeasonEpisode,
    })
    .from(shows)
    .all();

//~ A show is due for a check when it hasn't ended and its last check plus its
//~ offset (days) has passed.  Never-checked shows are always due.
export const isDueForNotifyCheck = (show: NotifyCandidate, currentEpoch: number) => {
  const status = show.showStatus?.toLowerCase();
  if (!status || status === 'ended' || status === 'canceled') return false;
  const offsetDays =
    !show.nextNotifyOffset || show.nextNotifyOffset <= 0 ? 1 : show.nextNotifyOffset;
  const nextCheck = !show.dateLastNotifyChecked
    ? currentEpoch - DAY_SECONDS
    : show.dateLastNotifyChecked + offsetDays * DAY_SECONDS;
  return nextCheck <= currentEpoch;
};

//~ Shows due for a check, those with a known next air date first
export const selectShowsDueForNotifyCheck = (db: Db, currentEpoch: number) =>
  selectNotifyCandidates(db)
    .filter((show) => isDueForNotifyCheck(show, currentEpoch))
    .sort((a, b) => (a.nextAirDate || Infinity) - (b.nextAirDate || Infinity));

export type NotifyFields = Partial<
  Pick<
    typeof shows.$inferInsert,
    | 'nextAirDate'
    | 'nextNotifyOffset'
    | 'dateLastNotifyChecked'
    | 'dateLastNotified'
    | 'lastNotifySeasonEpisode'
  >
>;
export const updateNotifyFields = (db: Db, showId: string, fields: NotifyFields) => {
  if (Object.keys(fields).length === 0) return;
  db.update(shows).set(fields).where(eq(shows.id, showId)).run();
};

//~ Start the notification schedule over for every show
export const resetNotifySchedule = (db: Db) => {
  db.update(shows)
    .set({ lastNotifySeasonEpisode: null, dateLastNotifyChecked: null, nextNotifyOffset: null })
    .run();
};

//# ------------------------------------------------------
//# Notification history
//# ------------------------------------------------------
export type NotificationHistoryInput = typeof notificationHistory.$inferInsert;
export type NotificationHistoryItem = typeof notificationHistory.$inferSelect & {
  name: string;
  nextNotifyOffset: number | null;
};

export const upsertNotificationHistory = (db: Db, record: NotificationHistoryInput) => {
  const { showId, ...fields } = record;
  db.insert(notificationHistory)
    .values(record)
    .onConflictDoUpdate({
      target: notificationHistory.showId,
      // A record replaces the previous one completely
      set: {
        season: fields.season,
        episode: fields.episode,
        dateSent: fields.dateSent ?? null,
        dateChecked: fields.dateChecked ?? null,
        dateLastNotify: fields.dateLastNotify ?? null,
        text: fields.text,
        otherInfo: fields.otherInfo ?? null,
      },
    })
    .run();
};

export const selectNotificationHistory = (db: Db): NotificationHistoryItem[] =>
  db
    .select({
      showId: notificationHistory.showId,
      season: notificationHistory.season,
      episode: notificationHistory.episode,
      dateSent: notificationHistory.dateSent,
      dateChecked: notificationHistory.dateChecked,
      dateLastNotify: notificationHistory.dateLastNotify,
      text: notificationHistory.text,
      otherInfo: notificationHistory.otherInfo,
      name: shows.name,
      nextNotifyOffset: shows.nextNotifyOffset,
    })
    .from(notificationHistory)
    .innerJoin(shows, eq(shows.id, notificationHistory.showId))
    .orderBy(desc(notificationHistory.dateChecked))
    .all();

export const clearNotificationHistory = (db: Db) => {
  db.delete(notificationHistory).run();
};

//# ------------------------------------------------------
//# Watch Provider refresh bookkeeping
//# ------------------------------------------------------
const PROVIDER_REFRESH_DAYS = 10;

//~ Shows whose Watch Providers were never fetched or are older than PROVIDER_REFRESH_DAYS
export const selectShowsDueForProviderCheck = (db: Db, currentEpoch: number): string[] =>
  db
    .select({ id: shows.id })
    .from(shows)
    .where(
      sql`${shows.streamingUpdatedAt} IS NULL OR ${shows.streamingUpdatedAt} <= ${
        currentEpoch - PROVIDER_REFRESH_DAYS * DAY_SECONDS
      }`
    )
    .all()
    .map((row) => row.id);

export const markProvidersChecked = (db: Db, showId: string, currentEpoch: number) => {
  db.update(shows).set({ streamingUpdatedAt: currentEpoch }).where(eq(shows.id, showId)).run();
};

//~ Testing aid: forget every show's Watch Providers so the next check refetches them all
export const clearWatchProviders = (db: Db) => {
  db.transaction((tx) => {
    tx.delete(showWatchProviders).run();
    tx.update(shows).set({ streamingUpdatedAt: null }).run();
  });
};
