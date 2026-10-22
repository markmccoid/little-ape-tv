import { beforeEach, describe, expect, it } from '@jest/globals';

import {
  episodeKey,
  selectEpisodeStateMap,
  selectEpisodeStates,
  setEpisodeFlags,
} from './episodes';
import { deleteShow, insertShow } from './shows';
import { createTestDb } from './testing/createTestDb';
import type { Db } from './types';

let db: Db;
beforeEach(() => {
  db = createTestDb().db;
  insertShow(db, { id: '1', name: 'Andor' });
});

describe('setEpisodeFlags', () => {
  it('creates rows when a flag is set and removes them when every flag is off', () => {
    setEpisodeFlags(db, '1', 1, [1, 2], 'watched', true);
    setEpisodeFlags(db, '1', 1, [2], 'downloaded', true);
    expect(selectEpisodeStateMap(db, '1')).toEqual({
      [episodeKey(1, 1)]: { watched: true, downloaded: false, favorited: false },
      [episodeKey(1, 2)]: { watched: true, downloaded: true, favorited: false },
    });

    setEpisodeFlags(db, '1', 1, [1, 2], 'watched', false);
    expect(selectEpisodeStateMap(db, '1')).toEqual({
      [episodeKey(1, 2)]: { watched: false, downloaded: true, favorited: false },
    });
  });

  it('stamps watchedAt once and clears it when unwatched', () => {
    setEpisodeFlags(db, '1', 1, [1], 'watched', true);
    const first = selectEpisodeStates(db, '1')[0].watchedAt;
    expect(first).toEqual(expect.any(Number));

    setEpisodeFlags(db, '1', 1, [1], 'favorited', true);
    setEpisodeFlags(db, '1', 1, [1], 'watched', true);
    expect(selectEpisodeStates(db, '1')[0].watchedAt).toBe(first);

    setEpisodeFlags(db, '1', 1, [1], 'watched', false);
    expect(selectEpisodeStates(db, '1')[0]).toMatchObject({ watched: false, watchedAt: null });
  });

  it('only touches the given season', () => {
    setEpisodeFlags(db, '1', 1, [1], 'watched', true);
    setEpisodeFlags(db, '1', 2, [1], 'watched', true);
    setEpisodeFlags(db, '1', 1, [1], 'watched', false);
    expect(Object.keys(selectEpisodeStateMap(db, '1'))).toEqual([episodeKey(2, 1)]);
  });

  it('is removed with the show', () => {
    setEpisodeFlags(db, '1', 1, [1, 2, 3], 'watched', true);
    deleteShow(db, '1');
    expect(selectEpisodeStates(db, '1')).toEqual([]);
  });
});
