import { asc, eq, sql } from 'drizzle-orm';

import { nowEpoch } from './dates';
import { seasonSummaries, showGenres, shows, showTags, showWatchProviders } from './schema';
import type { Db, SeasonSummaryRow, ShowRow } from './types';

//~ -----------------------------------------------
//~ Saved Show reads and writes.  All functions are synchronous and take the
//~ database as the first argument so they can be tested against better-sqlite3.
//~ -----------------------------------------------

export type SavedShowDetail = ShowRow & { tagIds: string[]; genres: string[] };

// Show fields that come from TMDB
export type ShowDetailsInput = {
  id: string;
  name: string;
  imdbId?: string;
  tvdbId?: number;
  posterUrl?: string;
  backdropUrl?: string;
  avgEpisodeRunTime?: number;
  showStatus?: string;
  imdbEpisodesUrl?: string;
  firstAirDate?: number;
  nextAirDate?: number;
  genres?: string[];
};

export type ShowSummaryInput = {
  allWatched: boolean;
  totalEpisodes: number;
  totalWatched: number;
  lastWatchedSeason: number;
  nextDlSeason: number | null;
  nextDlEpisode: number | null;
  nextDlAirDate: number | null;
  nextDlStatus: 's' | 'a' | 'n';
  seasons: SeasonSummaryRow[];
};

//# ======================================================
//# READS
//# ======================================================
export const selectShow = (db: Db, showId: string): SavedShowDetail | undefined => {
  const show = db.select().from(shows).where(eq(shows.id, showId)).get();
  if (!show) return undefined;
  const tagIds = db
    .select({ tagId: showTags.tagId })
    .from(showTags)
    .where(eq(showTags.showId, showId))
    .all()
    .map((row) => row.tagId);
  const genres = db
    .select({ genre: showGenres.genre })
    .from(showGenres)
    .where(eq(showGenres.showId, showId))
    .orderBy(asc(showGenres.genre))
    .all()
    .map((row) => row.genre);
  return { ...show, tagIds, genres };
};

export const selectSavedShowIds = (db: Db): string[] =>
  db
    .select({ id: shows.id })
    .from(shows)
    .all()
    .map((row) => row.id);

// Poster for every Saved Show, keyed by show id (used to show the user's chosen poster in search)
export const selectSavedShowPosters = (db: Db): Record<string, string | null> =>
  Object.fromEntries(
    db
      .select({ id: shows.id, posterUrl: shows.posterUrl })
      .from(shows)
      .all()
      .map((row) => [row.id, row.posterUrl])
  );

// Genres across all Saved Shows, for the filter screens
export const selectGenres = (db: Db): string[] =>
  db
    .selectDistinct({ genre: showGenres.genre })
    .from(showGenres)
    .orderBy(asc(showGenres.genre))
    .all()
    .map((row) => row.genre);

export const selectSeasonSummaries = (db: Db, showId: string): SeasonSummaryRow[] =>
  db
    .select({
      season: seasonSummaries.season,
      totalEpisodes: seasonSummaries.totalEpisodes,
      watched: seasonSummaries.watched,
      downloaded: seasonSummaries.downloaded,
      favorited: seasonSummaries.favorited,
    })
    .from(seasonSummaries)
    .where(eq(seasonSummaries.showId, showId))
    .orderBy(asc(seasonSummaries.season))
    .all();

//# ======================================================
//# WRITES
//# ======================================================
export const insertShow = (db: Db, input: ShowDetailsInput) => {
  const now = nowEpoch();
  db.transaction((tx) => {
    tx.insert(shows)
      .values({
        id: input.id,
        name: input.name,
        imdbId: input.imdbId ?? null,
        tvdbId: input.tvdbId ?? null,
        posterUrl: input.posterUrl ?? null,
        backdropUrl: input.backdropUrl ?? null,
        avgEpisodeRunTime: input.avgEpisodeRunTime ?? null,
        showStatus: input.showStatus ?? null,
        imdbEpisodesUrl: input.imdbEpisodesUrl ?? null,
        firstAirDate: input.firstAirDate ?? null,
        nextAirDate: input.nextAirDate ?? null,
        dateAdded: now,
        dateLastUpdated: now,
      })
      .onConflictDoNothing()
      .run();
    replaceGenres(tx as unknown as Db, input.id, input.genres ?? []);
  });
};

//~ Refresh the TMDB-sourced fields of an existing show.  The poster is left alone
//~ because the user can pick their own.
export const refreshShowDetails = (db: Db, input: ShowDetailsInput) => {
  db.transaction((tx) => {
    const updated = tx
      .update(shows)
      .set({
        name: input.name,
        imdbId: input.imdbId ?? null,
        tvdbId: input.tvdbId ?? null,
        showStatus: input.showStatus ?? null,
        imdbEpisodesUrl: input.imdbEpisodesUrl ?? null,
        firstAirDate: input.firstAirDate ?? null,
        nextAirDate: input.nextAirDate ?? null,
        dateLastUpdated: nowEpoch(),
      })
      .where(eq(shows.id, input.id))
      .run() as { changes: number };
    if (updated.changes === 0) return;
    replaceGenres(tx as unknown as Db, input.id, input.genres ?? []);
  });
};

// Related rows are removed by ON DELETE CASCADE
export const deleteShow = (db: Db, showId: string) => {
  db.delete(shows).where(eq(shows.id, showId)).run();
};

export const setFavorite = (db: Db, showId: string, action: 'toggle' | 'on' | 'off') => {
  const favoritedAt =
    action === 'toggle'
      ? sql`CASE WHEN ${shows.favoritedAt} IS NULL THEN ${nowEpoch()} ELSE NULL END`
      : action === 'on'
        ? nowEpoch()
        : null;
  db.update(shows).set({ favoritedAt }).where(eq(shows.id, showId)).run();
};

export const setUserRating = (db: Db, showId: string, userRating: number) => {
  db.update(shows).set({ userRating }).where(eq(shows.id, showId)).run();
};

export const setPosterUrl = (db: Db, showId: string, posterUrl: string) => {
  db.update(shows).set({ posterUrl }).where(eq(shows.id, showId)).run();
};

export const setAvgEpisodeRunTime = (db: Db, showId: string, avgEpisodeRunTime: number) => {
  db.update(shows)
    .set({ avgEpisodeRunTime: Math.round(avgEpisodeRunTime) })
    .where(eq(shows.id, showId))
    .run();
};

export const setShowTags = (db: Db, showId: string, tagIds: string[]) => {
  db.transaction((tx) => {
    tx.delete(showTags).where(eq(showTags.showId, showId)).run();
    const rows = Array.from(new Set(tagIds)).map((tagId) => ({ showId, tagId }));
    if (rows.length) tx.insert(showTags).values(rows).run();
  });
};

export const addShowTag = (db: Db, showId: string, tagId: string) => {
  db.insert(showTags).values({ showId, tagId }).onConflictDoNothing().run();
};

export const removeShowTag = (db: Db, showId: string, tagId: string) => {
  db.delete(showTags)
    .where(sql`${showTags.showId} = ${showId} and ${showTags.tagId} = ${tagId}`)
    .run();
};

export const setWatchProviders = (db: Db, showId: string, providerIds: number[]) => {
  db.transaction((tx) => {
    const updated = tx
      .update(shows)
      .set({ streamingUpdatedAt: nowEpoch() })
      .where(eq(shows.id, showId))
      .run() as { changes: number };
    if (updated.changes === 0) return;
    tx.delete(showWatchProviders).where(eq(showWatchProviders.showId, showId)).run();
    const rows = Array.from(new Set(providerIds)).map((providerId) => ({ showId, providerId }));
    if (rows.length) tx.insert(showWatchProviders).values(rows).run();
  });
};

//~ Store the Season Summary cache for a show (whole-show columns + per-season rows)
export const writeSeasonSummary = (db: Db, showId: string, summary: ShowSummaryInput) => {
  db.transaction((tx) => {
    const updated = tx
      .update(shows)
      .set({
        allWatched: summary.allWatched,
        totalEpisodes: summary.totalEpisodes,
        totalWatched: summary.totalWatched,
        lastWatchedSeason: summary.lastWatchedSeason,
        nextDlSeason: summary.nextDlSeason,
        nextDlEpisode: summary.nextDlEpisode,
        nextDlAirDate: summary.nextDlAirDate,
        nextDlStatus: summary.nextDlStatus,
      })
      .where(eq(shows.id, showId))
      .run() as { changes: number };
    if (updated.changes === 0) return;
    tx.delete(seasonSummaries).where(eq(seasonSummaries.showId, showId)).run();
    if (summary.seasons.length) {
      tx.insert(seasonSummaries)
        .values(summary.seasons.map((season) => ({ ...season, showId })))
        .run();
    }
  });
};

//# -------------------------------------------------
//# Helpers
//# -------------------------------------------------
const replaceGenres = (db: Db, showId: string, genres: string[]) => {
  db.delete(showGenres).where(eq(showGenres.showId, showId)).run();
  const rows = Array.from(new Set(genres.filter(Boolean))).map((genre) => ({ showId, genre }));
  if (rows.length) db.insert(showGenres).values(rows).run();
};
