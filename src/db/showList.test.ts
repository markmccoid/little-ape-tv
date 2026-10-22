import { beforeEach, describe, expect, it } from '@jest/globals';

import { selectShowList, type ShowListCriteria, type ShowListSort } from './showList';
import {
  addShowTag,
  insertShow,
  setFavorite,
  setUserRating,
  setWatchProviders,
  writeSeasonSummary,
} from './shows';
import { insertTag } from './tags';
import { createTestDb } from './testing/createTestDb';
import type { Db } from './types';

const sortBy = (sortField: string, sortDirection: 'asc' | 'desc' = 'asc'): ShowListSort[] => [
  { sortField, sortDirection, active: true, position: 1 },
];

const summary = (overrides: Partial<Parameters<typeof writeSeasonSummary>[2]> = {}) => ({
  allWatched: false,
  totalEpisodes: 0,
  totalWatched: 0,
  lastWatchedSeason: 0,
  nextDlSeason: null,
  nextDlEpisode: null,
  nextDlAirDate: null,
  nextDlStatus: 'n' as const,
  seasons: [],
  ...overrides,
});

let db: Db;
const ids = (criteria: ShowListCriteria) => selectShowList(db, criteria).map((show) => show.id);

beforeEach(() => {
  db = createTestDb().db;
  insertTag(db, 'scifi', 'Sci-Fi');
  insertTag(db, 'rewatch', 'Rewatch');

  // 1: Andor - Drama + Sci-Fi, tags scifi, on Disney (337), favorite, all watched
  insertShow(db, { id: '1', name: 'Andor', genres: ['Drama', 'Sci-Fi'] });
  addShowTag(db, '1', 'scifi');
  setWatchProviders(db, '1', [337]);
  setFavorite(db, '1', 'on');
  setUserRating(db, '1', 9);
  writeSeasonSummary(
    db,
    '1',
    summary({
      allWatched: true,
      nextDlAirDate: 2000,
      seasons: [
        { season: 2, totalEpisodes: 12, watched: 12, downloaded: 0, favorited: 0 },
        { season: 0, totalEpisodes: 3, watched: 0, downloaded: 0, favorited: 0 },
        { season: 1, totalEpisodes: 12, watched: 12, downloaded: 0, favorited: 1 },
      ],
    })
  );

  // 2: severance - Drama + Mystery, tags scifi + rewatch, on Apple (350)
  insertShow(db, { id: '2', name: 'severance', genres: ['Drama', 'Mystery'] });
  addShowTag(db, '2', 'scifi');
  addShowTag(db, '2', 'rewatch');
  setWatchProviders(db, '2', [350]);
  setUserRating(db, '2', 10);
  writeSeasonSummary(db, '2', summary({ nextDlAirDate: 1000 }));

  // 3: Bluey_100% - Animation, no tags, no providers, no next download date
  insertShow(db, { id: '3', name: 'Bluey_100%', genres: ['Animation'] });
  setUserRating(db, '3', 7);
});

describe('selectShowList filters', () => {
  it('returns every show with no criteria', () => {
    expect(ids({}).sort()).toEqual(['1', '2', '3']);
  });

  it('include tags requires ALL of them, exclude tags requires NONE', () => {
    expect(ids({ includeTags: ['scifi'] }).sort()).toEqual(['1', '2']);
    expect(ids({ includeTags: ['scifi', 'rewatch'] })).toEqual(['2']);
    expect(ids({ excludeTags: ['rewatch'] }).sort()).toEqual(['1', '3']);
    expect(ids({ includeTags: ['scifi'], excludeTags: ['rewatch'] })).toEqual(['1']);
  });

  it('include genres requires ALL of them, exclude genres requires NONE', () => {
    expect(ids({ includeGenres: ['Drama'] }).sort()).toEqual(['1', '2']);
    expect(ids({ includeGenres: ['Drama', 'Mystery'] })).toEqual(['2']);
    expect(ids({ excludeGenres: ['Drama'] })).toEqual(['3']);
  });

  it('watch providers match ANY of them', () => {
    expect(ids({ includeWatchProviders: [337, 350] }).sort()).toEqual(['1', '2']);
    expect(ids({ includeWatchProviders: [8] })).toEqual([]);
  });

  it('favorite and all-watched are tri-state', () => {
    expect(ids({ filterIsFavorited: 'include' })).toEqual(['1']);
    expect(ids({ filterIsFavorited: 'exclude' }).sort()).toEqual(['2', '3']);
    expect(ids({ filterIsFavorited: 'off' })).toHaveLength(3);
    expect(ids({ filterIsAllWatched: 'include' })).toEqual(['1']);
    expect(ids({ filterIsAllWatched: 'exclude' }).sort()).toEqual(['2', '3']);
  });

  it('name search is case-insensitive and combines with other filters', () => {
    expect(ids({ showName: 'SEVER' })).toEqual(['2']);
    expect(ids({ showName: 'AND', includeTags: ['scifi'], excludeTags: ['rewatch'] })).toEqual([
      '1',
    ]);
  });

  it('name search with ignoreOtherFilters matches only the name', () => {
    expect(ids({ showName: 'sever', ignoreOtherFilters: true, includeTags: ['missing'] })).toEqual([
      '2',
    ]);
  });

  it('treats % and _ in the name search literally', () => {
    expect(ids({ showName: '_100%' })).toEqual(['3']);
    expect(ids({ showName: '%' })).toEqual(['3']);
  });
});

describe('selectShowList sorting', () => {
  it('sorts names case-insensitively', () => {
    expect(ids({ sort: sortBy('name') })).toEqual(['1', '3', '2']);
    expect(ids({ sort: sortBy('name', 'desc') })).toEqual(['2', '3', '1']);
  });

  it('keeps shows without a next download date last in both directions', () => {
    expect(ids({ sort: sortBy('sortNextDLDate', 'asc') })).toEqual(['2', '1', '3']);
    expect(ids({ sort: sortBy('sortNextDLDate', 'desc') })).toEqual(['1', '2', '3']);
  });

  it('applies active sorts in position order and ignores inactive ones', () => {
    const sort: ShowListSort[] = [
      { sortField: 'name', sortDirection: 'asc', active: false, position: 1 },
      { sortField: 'userRating', sortDirection: 'desc', active: true, position: 2 },
    ];
    expect(ids({ sort })).toEqual(['2', '1', '3']);
  });
});

describe('selectShowList rows', () => {
  it('includes tag ids and season summaries without specials, ordered by season', () => {
    const andor = selectShowList(db, {}).find((show) => show.id === '1')!;
    expect(andor.tagIds).toEqual(['scifi']);
    expect(andor.seasonSummaries.map((season) => season.season)).toEqual([1, 2]);
    expect(andor.seasonSummaries[0]).toEqual({
      season: 1,
      totalEpisodes: 12,
      watched: 12,
      downloaded: 0,
      favorited: 1,
    });
    const bluey = selectShowList(db, {}).find((show) => show.id === '3')!;
    expect(bluey.tagIds).toEqual([]);
    expect(bluey.seasonSummaries).toEqual([]);
  });
});
