import { asc } from 'drizzle-orm';

import { insertChunked } from './insertChunked';
import {
  episodeStates,
  notificationHistory,
  seasonSummaries,
  showGenres,
  shows,
  showTags,
  showWatchProviders,
  tags,
} from './schema';
import type { Db, SeasonSummaryRow, ShowRow, TagRow } from './types';

//~ -----------------------------------------------
//~ Database part of the v2 backup: every Saved Show with its tags, genres, Watch
//~ Providers, Season Summaries, Episode States and notification history, plus the
//~ tag list.  Restoring replaces all of it in one transaction.
//~ -----------------------------------------------
export type BackupEpisodeState = Omit<typeof episodeStates.$inferSelect, 'showId'>;
export type BackupNotification = Omit<typeof notificationHistory.$inferSelect, 'showId'>;

export type BackupShow = ShowRow & {
  tagIds: string[];
  genres: string[];
  watchProviderIds: number[];
  seasonSummaries: SeasonSummaryRow[];
  episodeStates: BackupEpisodeState[];
  notification: BackupNotification | null;
};

export type DatabaseBackup = {
  tags: TagRow[];
  shows: BackupShow[];
};

export type RestoreCounts = { shows: number; episodeStates: number; tags: number };

//# ------------------------------------------------------
//# Export
//# ------------------------------------------------------
export const exportDatabase = (db: Db): DatabaseBackup => {
  const byShow = <T extends { showId: string }>(rows: T[]) => {
    const grouped = new Map<string, Omit<T, 'showId'>[]>();
    for (const { showId, ...rest } of rows) {
      const list = grouped.get(showId) ?? [];
      list.push(rest);
      grouped.set(showId, list);
    }
    return grouped;
  };

  const tagIds = byShow(db.select().from(showTags).all());
  const genres = byShow(db.select().from(showGenres).all());
  const providers = byShow(db.select().from(showWatchProviders).all());
  const summaries = byShow(db.select().from(seasonSummaries).all());
  const episodes = byShow(db.select().from(episodeStates).all());
  const notifications = byShow(db.select().from(notificationHistory).all());

  return {
    tags: db.select().from(tags).orderBy(asc(tags.position)).all(),
    shows: db
      .select()
      .from(shows)
      .orderBy(asc(shows.id))
      .all()
      .map((show) => ({
        ...show,
        tagIds: (tagIds.get(show.id) ?? []).map((row) => row.tagId),
        genres: (genres.get(show.id) ?? []).map((row) => row.genre),
        watchProviderIds: (providers.get(show.id) ?? []).map((row) => row.providerId),
        seasonSummaries: summaries.get(show.id) ?? [],
        episodeStates: episodes.get(show.id) ?? [],
        notification: notifications.get(show.id)?.[0] ?? null,
      })),
  };
};

//# ------------------------------------------------------
//# Restore - replaces ALL show data
//# ------------------------------------------------------
export const restoreDatabase = (db: Db, backup: DatabaseBackup): RestoreCounts => {
  if (!Array.isArray(backup?.shows) || !Array.isArray(backup?.tags)) {
    throw new Error('Backup has no shows or tags.');
  }
  const tagIdSet = new Set(backup.tags.map((tag) => tag.id));

  return db.transaction((tx) => {
    const t = tx as unknown as Db;
    // Rows that reference shows/tags are removed by ON DELETE CASCADE
    t.delete(shows).run();
    t.delete(tags).run();

    insertChunked(t, tags, backup.tags);
    insertChunked(
      t,
      shows,
      backup.shows.map(
        ({
          tagIds: _tagIds,
          genres: _genres,
          watchProviderIds: _providers,
          seasonSummaries: _summaries,
          episodeStates: _episodes,
          notification: _notification,
          ...show
        }) => show
      )
    );
    insertChunked(
      t,
      showTags,
      backup.shows.flatMap((show) =>
        show.tagIds
          .filter((tagId) => tagIdSet.has(tagId))
          .map((tagId) => ({ showId: show.id, tagId }))
      )
    );
    insertChunked(
      t,
      showGenres,
      backup.shows.flatMap((show) => show.genres.map((genre) => ({ showId: show.id, genre })))
    );
    insertChunked(
      t,
      showWatchProviders,
      backup.shows.flatMap((show) =>
        show.watchProviderIds.map((providerId) => ({ showId: show.id, providerId }))
      )
    );
    insertChunked(
      t,
      seasonSummaries,
      backup.shows.flatMap((show) =>
        show.seasonSummaries.map((season) => ({ ...season, showId: show.id }))
      )
    );
    const episodeRows = backup.shows.flatMap((show) =>
      show.episodeStates.map((episode) => ({ ...episode, showId: show.id }))
    );
    insertChunked(t, episodeStates, episodeRows);
    insertChunked(
      t,
      notificationHistory,
      backup.shows.flatMap((show) =>
        show.notification ? [{ ...show.notification, showId: show.id }] : []
      )
    );

    return {
      shows: backup.shows.length,
      episodeStates: episodeRows.length,
      tags: backup.tags.length,
    };
  });
};
