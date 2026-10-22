import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { eq } from 'drizzle-orm';
import type { BaseSQLiteDatabase } from 'drizzle-orm/sqlite-core';

import * as schema from '../schema';
import {
  appMeta,
  episodeStates,
  notificationHistory,
  seasonSummaries,
  showGenres,
  shows,
  showTags,
  showWatchProviders,
  tags,
} from '../schema';
dayjs.extend(customParseFormat);

//!! -------------------------------------------------------
//!! ONE-TIME import of the Legend State / MMKV data into SQLite.
//!! Throwaway: delete this folder once it has run on every device.
//!! The legacy types are copied here on purpose so this module does not
//!! depend on the old stores, which are being removed.
//!! -------------------------------------------------------

//~ -----------------------------------------------
//~ Legacy (v1) shapes as persisted by Legend State
//~ -----------------------------------------------
type LegacySavedShow = {
  tmdbId: string;
  imdbId?: string;
  tvdbId?: number;
  name: string;
  posterURL?: string;
  backdropURL?: string;
  showStatus?: string;
  allWatched?: boolean;
  avgEpisodeRunTime?: number;
  firstAirDateEpoch?: number;
  nextAirDateEpoch?: number;
  imdbEpisodesURL?: string;
  genres?: string[];
  userRating?: number;
  favorite?: number;
  userTags?: string[];
  trackAndNotify?: boolean;
  dateAddedEpoch?: number;
  dateLastUpdatedEpoch?: number;
  dateLastNotifiedEpoch?: number;
  dateLastNotifyCheckedEpoch?: number;
  lastNotifySeasonEpisode?: string;
  nextNotifyOffset?: number;
  streaming?: { dateUpdatedEpoch?: number; providers?: number[] };
};
type LegacyEpisode = { w?: boolean; d?: boolean; f?: boolean; dw?: number } | null;
// Legend can persist numeric keys as either objects or (sparse) arrays
type LegacyNumberKeyed<T> = Record<string, T> | T[];
type LegacySeasonSummary = { te?: number; tw?: number; td?: number; tf?: number };
type LegacyShowAttributes = {
  summary?: {
    tec?: number;
    asw?: boolean;
    lws?: number;
    gtw?: number;
    nde?: { season?: number; episode?: number; airDate?: string; status?: 's' | 'a' | 'n' };
  } & Record<string, unknown>;
  seasons?: LegacyNumberKeyed<{ episodes?: LegacyNumberKeyed<LegacyEpisode> } | null>;
};
type LegacyTag = { id: string; name: string; position: number };
type LegacyNotificationRecord = {
  season: number;
  episode: number;
  dateSent?: number;
  dateChecked?: number;
  dateLastNotify?: number;
  text?: string;
  otherInfo?: string;
};

export type LegacyData = {
  savedShows?: {
    shows?: Record<string, LegacySavedShow>;
    showAttributes?: Record<string, LegacyShowAttributes>;
  };
  tags?: { tagList?: LegacyTag[] };
  notificationHistory?: Record<string, LegacyNotificationRecord>;
};

export type LegacyImportCounts = {
  shows: number;
  episodeStates: number;
  seasonSummaries: number;
  tags: number;
  showTags: number;
  showGenres: number;
  showWatchProviders: number;
  notificationHistory: number;
};

// Works with both expo-sqlite (app) and better-sqlite3 (tests)
type SyncDatabase = BaseSQLiteDatabase<'sync', unknown, typeof schema>;

export const LEGACY_IMPORT_META_KEY = 'legacyMMKVImport';
const SUMMARY_KEYS = new Set(['tec', 'asw', 'lws', 'gtw', 'nde']);
// Keeps each multi-row INSERT well under SQLite's bound-variable limit
const CHUNK_SIZE = 500;

//# ------------------------------------------------------
//# importLegacyDataOnce
//# Runs the import only if it has never run on this database.  The marker row is
//# written in the same transaction as the data, so a failed import leaves nothing behind.
//# loadData is only called when an import is needed.
//# ------------------------------------------------------
export const importLegacyDataOnce = (
  db: SyncDatabase,
  loadData: () => LegacyData
): LegacyImportCounts | undefined => {
  const marker = db.select().from(appMeta).where(eq(appMeta.key, LEGACY_IMPORT_META_KEY)).get();
  if (marker) return undefined;

  const data = loadData();
  return db.transaction((tx) => {
    const counts = writeLegacyData(tx as unknown as SyncDatabase, data);
    tx.insert(appMeta)
      .values({
        key: LEGACY_IMPORT_META_KEY,
        value: JSON.stringify({ importedAt: Math.floor(Date.now() / 1000), counts }),
      })
      .run();
    return counts;
  });
};

//# ------------------------------------------------------
//# Map the legacy shapes to rows and insert them
//# ------------------------------------------------------
const writeLegacyData = (db: SyncDatabase, data: LegacyData): LegacyImportCounts => {
  const legacyShows = data.savedShows?.shows ?? {};
  const legacyAttributes = data.savedShows?.showAttributes ?? {};
  const nowEpoch = Math.floor(Date.now() / 1000);

  //~ Tags first so show_tags can be checked against them
  const tagRows = dedupeBy(data.tags?.tagList ?? [], (tag) => tag.id).map((tag) => ({
    id: tag.id,
    name: tag.name,
    position: tag.position,
  }));
  const tagIds = new Set(tagRows.map((tag) => tag.id));

  const showRows: (typeof shows.$inferInsert)[] = [];
  const showTagRows: (typeof showTags.$inferInsert)[] = [];
  const genreRows: (typeof showGenres.$inferInsert)[] = [];
  const providerRows: (typeof showWatchProviders.$inferInsert)[] = [];
  const seasonSummaryRows: (typeof seasonSummaries.$inferInsert)[] = [];
  const episodeRows: (typeof episodeStates.$inferInsert)[] = [];

  for (const [key, show] of Object.entries(legacyShows)) {
    if (!show || !show.name) continue;
    const showId = String(show.tmdbId || key);
    const summary = legacyAttributes[showId]?.summary;
    const nde = summary?.nde;

    showRows.push({
      id: showId,
      imdbId: show.imdbId ?? null,
      tvdbId: show.tvdbId ?? null,
      name: show.name,
      posterUrl: show.posterURL ?? null,
      backdropUrl: show.backdropURL ?? null,
      showStatus: show.showStatus ?? null,
      avgEpisodeRunTime: validNumber(show.avgEpisodeRunTime),
      firstAirDate: show.firstAirDateEpoch || null,
      nextAirDate: show.nextAirDateEpoch || null,
      imdbEpisodesUrl: show.imdbEpisodesURL ?? null,
      userRating: show.userRating ?? 0,
      favoritedAt: show.favorite || null,
      trackAndNotify: show.trackAndNotify ?? true,
      dateAdded: show.dateAddedEpoch || show.dateLastUpdatedEpoch || nowEpoch,
      dateLastUpdated: show.dateLastUpdatedEpoch || nowEpoch,
      dateLastNotified: show.dateLastNotifiedEpoch ?? null,
      dateLastNotifyChecked: show.dateLastNotifyCheckedEpoch ?? null,
      lastNotifySeasonEpisode: show.lastNotifySeasonEpisode ?? null,
      nextNotifyOffset: show.nextNotifyOffset ?? null,
      streamingUpdatedAt: show.streaming?.dateUpdatedEpoch ?? null,
      allWatched: summary?.asw ?? show.allWatched ?? false,
      totalEpisodes: summary?.tec ?? 0,
      totalWatched: summary?.gtw ?? 0,
      lastWatchedSeason: summary?.lws ?? 0,
      nextDlSeason: nde?.season ?? null,
      nextDlEpisode: nde?.episode ?? null,
      nextDlAirDate: parseLegacyAirDate(nde?.airDate),
      nextDlStatus: nde?.status ?? 'n',
    });

    for (const tagId of new Set(show.userTags ?? [])) {
      if (tagIds.has(tagId)) showTagRows.push({ showId, tagId });
    }
    for (const genre of new Set(show.genres ?? [])) {
      if (genre) genreRows.push({ showId, genre });
    }
    for (const providerId of new Set(show.streaming?.providers ?? [])) {
      if (Number.isFinite(providerId)) providerRows.push({ showId, providerId });
    }

    //~ Season Summary per season
    for (const [seasonKey, seasonSummary] of Object.entries(summary ?? {})) {
      if (SUMMARY_KEYS.has(seasonKey)) continue;
      const season = Number(seasonKey);
      if (!Number.isInteger(season) || !seasonSummary || typeof seasonSummary !== 'object') {
        continue;
      }
      const { te, tw, td, tf } = seasonSummary as LegacySeasonSummary;
      seasonSummaryRows.push({
        showId,
        season,
        totalEpisodes: te ?? 0,
        watched: tw ?? 0,
        downloaded: td ?? 0,
        favorited: tf ?? 0,
      });
    }

    //~ Episode States - sparse, only keep episodes with a flag set
    for (const [seasonKey, season] of Object.entries(legacyAttributes[showId]?.seasons ?? {})) {
      const seasonNumber = Number(seasonKey);
      if (!Number.isInteger(seasonNumber) || !season) continue;
      for (const [episodeKey, episode] of Object.entries(season.episodes ?? {})) {
        const episodeNumber = Number(episodeKey);
        if (!Number.isInteger(episodeNumber) || !episode) continue;
        const watched = !!episode.w;
        const downloaded = !!episode.d;
        const favorited = !!episode.f;
        if (!watched && !downloaded && !favorited) continue;
        episodeRows.push({
          showId,
          season: seasonNumber,
          episode: episodeNumber,
          watched,
          downloaded,
          favorited,
          watchedAt: watched && episode.dw ? episode.dw : null,
        });
      }
    }
  }

  //~ Notification history - only for shows that still exist
  const showIds = new Set(showRows.map((show) => show.id));
  const notificationRows: (typeof notificationHistory.$inferInsert)[] = Object.entries(
    data.notificationHistory ?? {}
  )
    .filter(([showId, record]) => showIds.has(showId) && record)
    .map(([showId, record]) => ({
      showId,
      season: record.season,
      episode: record.episode,
      dateSent: record.dateSent ?? null,
      dateChecked: record.dateChecked ?? null,
      dateLastNotify: record.dateLastNotify ?? null,
      text: record.text ?? '',
      otherInfo: record.otherInfo ?? null,
    }));

  insertChunked(db, tags, tagRows);
  insertChunked(db, shows, showRows);
  insertChunked(db, showTags, showTagRows);
  insertChunked(db, showGenres, genreRows);
  insertChunked(db, showWatchProviders, providerRows);
  insertChunked(db, seasonSummaries, seasonSummaryRows);
  insertChunked(db, episodeStates, episodeRows);
  insertChunked(db, notificationHistory, notificationRows);

  return {
    shows: showRows.length,
    episodeStates: episodeRows.length,
    seasonSummaries: seasonSummaryRows.length,
    tags: tagRows.length,
    showTags: showTagRows.length,
    showGenres: genreRows.length,
    showWatchProviders: providerRows.length,
    notificationHistory: notificationRows.length,
  };
};

//# -------------------------------------------------
//# Helpers
//# -------------------------------------------------
const insertChunked = (db: SyncDatabase, table: any, rows: unknown[]) => {
  for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
    db.insert(table)
      .values(rows.slice(i, i + CHUNK_SIZE) as any)
      .run();
  }
};

// Legacy Next Download Episode air dates were stored as 'MM-DD-YYYY' strings
export const parseLegacyAirDate = (airDate: string | undefined) => {
  if (!airDate) return null;
  const parsed = dayjs(airDate, 'MM-DD-YYYY', true);
  return parsed.isValid() ? parsed.unix() : null;
};

const validNumber = (value: number | undefined) =>
  typeof value === 'number' && Number.isFinite(value) ? Math.round(value) : null;

const dedupeBy = <T>(items: T[], getKey: (item: T) => string) => {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (!item) return false;
    const key = getKey(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};
