import { describe, expect, it } from '@jest/globals';

import { exportDatabase, restoreDatabase } from './backup';
import { episodeKey, selectEpisodeStateMap, setEpisodeFlags } from './episodes';
import { selectNotificationHistory, upsertNotificationHistory } from './notifications';
import {
  addShowTag,
  insertShow,
  selectSeasonSummaries,
  selectShow,
  setFavorite,
  setUserRating,
  setWatchProviders,
  writeSeasonSummary,
} from './shows';
import { insertTag, selectTags } from './tags';
import { createTestDb } from './testing/createTestDb';
import type { Db } from './types';

const seed = (db: Db) => {
  insertTag(db, 'scifi', 'Sci-Fi');
  insertTag(db, 'rewatch', 'Rewatch');
  insertShow(db, { id: '1', name: 'Andor', genres: ['Drama', 'Sci-Fi'], posterUrl: 'p.jpg' });
  addShowTag(db, '1', 'scifi');
  setWatchProviders(db, '1', [337]);
  setFavorite(db, '1', 'on');
  setUserRating(db, '1', 11);
  setEpisodeFlags(db, '1', 1, [1, 2], 'watched', true);
  setEpisodeFlags(db, '1', 1, [2], 'downloaded', true);
  writeSeasonSummary(db, '1', {
    allWatched: false,
    totalEpisodes: 12,
    totalWatched: 2,
    lastWatchedSeason: 0,
    nextDlSeason: 1,
    nextDlEpisode: 3,
    nextDlAirDate: 1700000000,
    nextDlStatus: 's',
    seasons: [{ season: 1, totalEpisodes: 12, watched: 2, downloaded: 1, favorited: 0 }],
  });
  upsertNotificationHistory(db, {
    showId: '1',
    season: 2,
    episode: 1,
    dateChecked: 1700000100,
    text: 'S2E1 soon',
  });
  insertShow(db, { id: '2', name: 'Bluey', genres: ['Animation'] });
};

describe('database backup', () => {
  it('round-trips every show detail through export and restore', () => {
    const source = createTestDb().db;
    seed(source);
    // Through JSON, as it is written to and read from the backup file
    const backup = JSON.parse(JSON.stringify(exportDatabase(source)));

    const target = createTestDb().db;
    insertShow(target, { id: '99', name: 'Replaced' });
    expect(restoreDatabase(target, backup)).toEqual({ shows: 2, episodeStates: 2, tags: 2 });

    expect(selectShow(target, '99')).toBeUndefined();
    expect(selectShow(target, '1')).toEqual(selectShow(source, '1'));
    expect(selectShow(target, '2')).toEqual(selectShow(source, '2'));
    expect(selectTags(target)).toEqual(selectTags(source));
    expect(selectEpisodeStateMap(target, '1')).toEqual(selectEpisodeStateMap(source, '1'));
    expect(selectEpisodeStateMap(target, '1')[episodeKey(1, 2)]).toEqual({
      watched: true,
      downloaded: true,
      favorited: false,
    });
    expect(selectSeasonSummaries(target, '1')).toEqual(selectSeasonSummaries(source, '1'));
    expect(selectNotificationHistory(target)).toEqual(selectNotificationHistory(source));
    expect(exportDatabase(target)).toEqual(backup);
  });

  it('rolls back and keeps the existing data when the backup is invalid', () => {
    const db = createTestDb().db;
    seed(db);
    const broken = JSON.parse(JSON.stringify(exportDatabase(db)));
    broken.shows[1].name = null;

    expect(() => restoreDatabase(db, broken)).toThrow();
    expect(selectShow(db, '1')?.name).toBe('Andor');
    expect(selectTags(db)).toHaveLength(2);
    expect(() => restoreDatabase(db, {} as any)).toThrow('Backup has no shows or tags.');
  });
});
