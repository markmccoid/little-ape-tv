import { beforeEach, describe, expect, it } from '@jest/globals';

import {
  addShowTag,
  deleteShow,
  insertShow,
  refreshShowDetails,
  removeShowTag,
  selectGenres,
  selectSavedShowIds,
  selectShow,
  setFavorite,
  setShowTags,
  setWatchProviders,
  writeSeasonSummary,
} from './shows';
import { deleteTag, insertTag, reorderTags, selectTags } from './tags';
import { createTestDb } from './testing/createTestDb';
import type { Db } from './types';

let db: Db;
beforeEach(() => {
  db = createTestDb().db;
});

describe('shows', () => {
  it('inserts a show with its genres and reads it back', () => {
    insertShow(db, {
      id: '10',
      name: 'Andor',
      posterUrl: 'p.jpg',
      genres: ['Drama', 'Sci-Fi', 'Drama'],
    });
    expect(selectShow(db, '10')).toMatchObject({
      id: '10',
      name: 'Andor',
      posterUrl: 'p.jpg',
      userRating: 0,
      favoritedAt: null,
      trackAndNotify: true,
      nextDlStatus: 'n',
      genres: ['Drama', 'Sci-Fi'],
      tagIds: [],
    });
    expect(selectSavedShowIds(db)).toEqual(['10']);
    expect(selectShow(db, 'missing')).toBeUndefined();
  });

  it('refreshes TMDB fields and genres but keeps the chosen poster', () => {
    insertShow(db, { id: '10', name: 'Andor', posterUrl: 'mine.jpg', genres: ['Drama'] });
    refreshShowDetails(db, {
      id: '10',
      name: 'Andor (2022)',
      posterUrl: 'tmdb.jpg',
      showStatus: 'Ended',
      genres: ['Sci-Fi'],
    });
    expect(selectShow(db, '10')).toMatchObject({
      name: 'Andor (2022)',
      posterUrl: 'mine.jpg',
      showStatus: 'Ended',
      genres: ['Sci-Fi'],
    });
    // A show that is not saved is not created
    refreshShowDetails(db, { id: '99', name: 'Nope' });
    expect(selectShow(db, '99')).toBeUndefined();
  });

  it('toggles favorite on and off', () => {
    insertShow(db, { id: '10', name: 'Andor' });
    setFavorite(db, '10', 'toggle');
    expect(selectShow(db, '10')!.favoritedAt).toEqual(expect.any(Number));
    setFavorite(db, '10', 'toggle');
    expect(selectShow(db, '10')!.favoritedAt).toBeNull();
    setFavorite(db, '10', 'on');
    setFavorite(db, '10', 'off');
    expect(selectShow(db, '10')!.favoritedAt).toBeNull();
  });

  it('adds, removes and replaces show tags', () => {
    insertTag(db, 'a', 'A');
    insertTag(db, 'b', 'B');
    insertShow(db, { id: '10', name: 'Andor' });
    addShowTag(db, '10', 'a');
    addShowTag(db, '10', 'a');
    expect(selectShow(db, '10')!.tagIds).toEqual(['a']);
    setShowTags(db, '10', ['b', 'a']);
    expect(selectShow(db, '10')!.tagIds.sort()).toEqual(['a', 'b']);
    removeShowTag(db, '10', 'a');
    expect(selectShow(db, '10')!.tagIds).toEqual(['b']);
  });

  it('ignores watch provider and summary writes for unsaved shows', () => {
    setWatchProviders(db, '99', [8]);
    writeSeasonSummary(db, '99', {
      allWatched: true,
      totalEpisodes: 1,
      totalWatched: 1,
      lastWatchedSeason: 1,
      nextDlSeason: null,
      nextDlEpisode: null,
      nextDlAirDate: null,
      nextDlStatus: 'a',
      seasons: [{ season: 1, totalEpisodes: 1, watched: 1, downloaded: 0, favorited: 0 }],
    });
    expect(selectSavedShowIds(db)).toEqual([]);
  });

  it('derives the genre list from saved shows', () => {
    insertShow(db, { id: '1', name: 'A', genres: ['Drama', 'Comedy'] });
    insertShow(db, { id: '2', name: 'B', genres: ['Drama'] });
    expect(selectGenres(db)).toEqual(['Comedy', 'Drama']);
    deleteShow(db, '1');
    expect(selectGenres(db)).toEqual(['Drama']);
  });
});

describe('tags', () => {
  it('appends new tags and keeps positions contiguous', () => {
    insertTag(db, 'a', 'A');
    insertTag(db, 'b', 'B');
    insertTag(db, 'c', 'C');
    expect(selectTags(db).map((tag) => [tag.id, tag.position])).toEqual([
      ['a', 1],
      ['b', 2],
      ['c', 3],
    ]);

    reorderTags(db, ['c', 'a']);
    expect(selectTags(db).map((tag) => tag.id)).toEqual(['c', 'a', 'b']);

    insertShow(db, { id: '10', name: 'Andor' });
    addShowTag(db, '10', 'a');
    deleteTag(db, 'a');
    expect(selectTags(db).map((tag) => [tag.id, tag.position])).toEqual([
      ['c', 1],
      ['b', 2],
    ]);
    expect(selectShow(db, '10')!.tagIds).toEqual([]);
  });
});
