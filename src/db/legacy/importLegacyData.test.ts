import { describe, expect, it, jest } from '@jest/globals';
import { eq } from 'drizzle-orm';

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
import { importLegacyDataOnce, LEGACY_IMPORT_META_KEY, type LegacyData } from './importLegacyData';
import { airDateToEpoch } from '../dates';
import { createTestDb } from '../testing/createTestDb';

const legacyData = (): LegacyData => ({
  savedShows: {
    shows: {
      '100': {
        tmdbId: '100',
        name: 'Severance',
        imdbId: 'tt11280740',
        posterURL: 'https://img/poster.jpg',
        firstAirDateEpoch: 1644537600,
        genres: ['Drama', 'Mystery', 'Drama'],
        userRating: 9,
        favorite: 1700000000,
        userTags: ['tag-1', 'missing-tag'],
        dateAddedEpoch: 1690000000,
        dateLastUpdatedEpoch: 1695000000,
        streaming: { dateUpdatedEpoch: 1696000000, providers: [350, 8, 350] },
        allWatched: false,
      },
      '200': {
        tmdbId: '200',
        name: 'Andor',
        dateLastUpdatedEpoch: 1695000000,
      },
    },
    showAttributes: {
      '100': {
        summary: {
          tec: 19,
          asw: false,
          lws: 1,
          gtw: 11,
          nde: { season: 2, episode: 3, airDate: '01-31-2025', status: 's' },
          1: { te: 9, tw: 9, td: 9, tf: 1 },
          2: { te: 10, tw: 2, td: 2, tf: 0 },
        },
        seasons: {
          1: {
            episodes: {
              1: { w: true, d: true, f: true, dw: 1690001000 },
              2: { w: true },
              // All flags off: must not become a row
              3: { w: false, d: false },
            },
          },
        },
      },
      // Legend can persist numeric paths as sparse arrays with null holes
      '200': {
        seasons: [null, { episodes: [null, { d: true }, null] }] as any,
      },
      // Attributes for a show that is no longer saved
      '999': { seasons: { 1: { episodes: { 1: { w: true } } } } },
    },
  },
  tags: {
    tagList: [
      { id: 'tag-1', name: 'Sci-Fi', position: 1 },
      { id: 'tag-2', name: 'Rewatch', position: 2 },
    ],
  },
  notificationHistory: {
    '100': { season: 2, episode: 3, text: 'S2E3 airs today', dateSent: 1738300000 },
    '999': { season: 1, episode: 1, text: 'orphan' },
  },
});

describe('importLegacyDataOnce', () => {
  it('maps the legacy Legend State data into normalized rows', () => {
    const { db } = createTestDb();
    const counts = importLegacyDataOnce(db, legacyData);

    expect(counts).toEqual({
      shows: 2,
      episodeStates: 3,
      seasonSummaries: 2,
      tags: 2,
      showTags: 1,
      showGenres: 2,
      showWatchProviders: 2,
      notificationHistory: 1,
    });

    const severance = db.select().from(shows).where(eq(shows.id, '100')).get();
    expect(severance).toMatchObject({
      name: 'Severance',
      userRating: 9,
      favoritedAt: 1700000000,
      dateAdded: 1690000000,
      streamingUpdatedAt: 1696000000,
      allWatched: false,
      totalEpisodes: 19,
      totalWatched: 11,
      lastWatchedSeason: 1,
      nextDlSeason: 2,
      nextDlEpisode: 3,
      nextDlAirDate: airDateToEpoch('01-31-2025'),
      nextDlStatus: 's',
      trackAndNotify: true,
    });

    // Missing dates and summary fall back to defaults
    const andor = db.select().from(shows).where(eq(shows.id, '200')).get();
    expect(andor).toMatchObject({
      dateAdded: 1695000000,
      userRating: 0,
      favoritedAt: null,
      nextDlStatus: 'n',
      nextDlAirDate: null,
    });

    expect(db.select().from(showTags).all()).toEqual([{ showId: '100', tagId: 'tag-1' }]);
    expect(
      db
        .select()
        .from(showGenres)
        .all()
        .map((row) => row.genre)
        .sort()
    ).toEqual(['Drama', 'Mystery']);
    expect(
      db
        .select()
        .from(showWatchProviders)
        .all()
        .map((row) => row.providerId)
        .sort((a, b) => a - b)
    ).toEqual([8, 350]);
    expect(db.select().from(seasonSummaries).where(eq(seasonSummaries.season, 1)).get()).toEqual({
      showId: '100',
      season: 1,
      totalEpisodes: 9,
      watched: 9,
      downloaded: 9,
      favorited: 1,
    });
    expect(db.select().from(tags).all()).toHaveLength(2);
    expect(db.select().from(notificationHistory).all()).toEqual([
      expect.objectContaining({ showId: '100', season: 2, episode: 3, text: 'S2E3 airs today' }),
    ]);
  });

  it('keeps episode states sparse and reads array-shaped seasons', () => {
    const { db } = createTestDb();
    importLegacyDataOnce(db, legacyData);

    const rows = db.select().from(episodeStates).all();
    expect(rows).toEqual(
      expect.arrayContaining([
        {
          showId: '100',
          season: 1,
          episode: 1,
          watched: true,
          downloaded: true,
          favorited: true,
          watchedAt: 1690001000,
        },
        {
          showId: '100',
          season: 1,
          episode: 2,
          watched: true,
          downloaded: false,
          favorited: false,
          watchedAt: null,
        },
        {
          showId: '200',
          season: 1,
          episode: 1,
          watched: false,
          downloaded: true,
          favorited: false,
          watchedAt: null,
        },
      ])
    );
    expect(rows).toHaveLength(3);
  });

  it('runs only once per database', () => {
    const { db } = createTestDb();
    importLegacyDataOnce(db, legacyData);

    const loadAgain = jest.fn(legacyData);
    expect(importLegacyDataOnce(db, loadAgain)).toBeUndefined();
    expect(loadAgain).not.toHaveBeenCalled();
    expect(db.select().from(shows).all()).toHaveLength(2);
    expect(
      db.select().from(appMeta).where(eq(appMeta.key, LEGACY_IMPORT_META_KEY)).get()
    ).toBeTruthy();
  });

  it('marks a fresh install with no legacy data as imported', () => {
    const { db } = createTestDb();
    expect(importLegacyDataOnce(db, () => ({}))).toMatchObject({ shows: 0, episodeStates: 0 });
    expect(importLegacyDataOnce(db, legacyData)).toBeUndefined();
  });

  it('rolls back everything, including the marker, when the import fails', () => {
    const { db } = createTestDb();
    const broken = legacyData();
    // A null season violates NOT NULL on the last table written, after shows were inserted
    broken.notificationHistory!['100'] = { season: null as any, episode: 1, text: 'x' };

    expect(() => importLegacyDataOnce(db, () => broken)).toThrow();
    expect(db.select().from(shows).all()).toHaveLength(0);
    expect(db.select().from(appMeta).all()).toHaveLength(0);
  });

  it('removes dependent rows when a show is deleted', () => {
    const { db } = createTestDb();
    importLegacyDataOnce(db, legacyData);

    db.delete(shows).where(eq(shows.id, '100')).run();

    expect(db.select().from(episodeStates).where(eq(episodeStates.showId, '100')).all()).toEqual(
      []
    );
    expect(db.select().from(showTags).all()).toEqual([]);
    expect(db.select().from(notificationHistory).all()).toEqual([]);
  });
});
