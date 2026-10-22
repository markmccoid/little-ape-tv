import { describe, expect, it } from '@jest/globals';

import { airDateToEpoch } from './dates';
import { episodeKey, type EpisodeFlags, type EpisodeStateMap } from './episodes';
import { calculateSeasonSummary, type SummarySeason } from './seasonSummary';

const season = (seasonNumber: number, count: number): SummarySeason => ({
  seasonNumber,
  episodes: Array.from({ length: count }, (_, i) => ({
    episodeNumber: i + 1,
    airDate: { formatted: `0${seasonNumber + 1}-0${i + 1}-2024` },
  })),
});
// TMDB fetch order: regular seasons, then season 0 last
const SEASONS = [season(1, 3), season(2, 2), season(0, 1)];

const states = (
  entries: [season: number, episode: number, flags: Partial<EpisodeFlags>][]
): EpisodeStateMap =>
  Object.fromEntries(
    entries.map(([s, e, flags]) => [
      episodeKey(s, e),
      { watched: false, downloaded: false, favorited: false, ...flags },
    ])
  );

describe('calculateSeasonSummary - watched', () => {
  it('summarizes a show with nothing watched', () => {
    const summary = calculateSeasonSummary(SEASONS, {});
    expect(summary).toMatchObject({
      allWatched: false,
      totalEpisodes: 5,
      totalWatched: 0,
      lastWatchedSeason: 0,
    });
    expect(summary.seasons).toEqual([
      { season: 1, totalEpisodes: 3, watched: 0, downloaded: 0, favorited: 0 },
      { season: 2, totalEpisodes: 2, watched: 0, downloaded: 0, favorited: 0 },
      { season: 0, totalEpisodes: 1, watched: 0, downloaded: 0, favorited: 0 },
    ]);
  });

  it('tracks the last fully watched season and the watched total', () => {
    const summary = calculateSeasonSummary(
      SEASONS,
      states([
        [1, 1, { watched: true }],
        [1, 2, { watched: true, favorited: true }],
        [1, 3, { watched: true }],
        [2, 1, { watched: true }],
      ])
    );
    expect(summary).toMatchObject({ allWatched: false, totalWatched: 4, lastWatchedSeason: 1 });
    expect(summary.seasons[0]).toMatchObject({ watched: 3, favorited: 1 });
  });

  it('is All Watched when every regular season is watched, ignoring specials', () => {
    const watchedAll = states([
      [1, 1, { watched: true }],
      [1, 2, { watched: true }],
      [1, 3, { watched: true }],
      [2, 1, { watched: true }],
      [2, 2, { watched: true }],
    ]);
    expect(calculateSeasonSummary(SEASONS, watchedAll)).toMatchObject({
      allWatched: true,
      lastWatchedSeason: 2,
    });
    // Quirk kept from the original: specials come last, so watching them makes season 0 the last watched
    expect(
      calculateSeasonSummary(SEASONS, { ...watchedAll, ...states([[0, 1, { watched: true }]]) })
        .lastWatchedSeason
    ).toBe(0);
  });

  it('counts a show with no episodes as All Watched', () => {
    expect(calculateSeasonSummary([season(1, 0)], {})).toMatchObject({
      allWatched: true,
      totalEpisodes: 0,
      nextDlStatus: 'n',
      seasons: [],
    });
  });
});

describe('calculateSeasonSummary - Next Download Episode', () => {
  it('points at the first episode with status n when nothing is downloaded', () => {
    expect(calculateSeasonSummary(SEASONS, {})).toMatchObject({
      nextDlSeason: 1,
      nextDlEpisode: 1,
      nextDlAirDate: airDateToEpoch('02-01-2024'),
      nextDlStatus: 'n',
    });
  });

  it('points at the episode after the last downloaded one', () => {
    const summary = calculateSeasonSummary(
      SEASONS,
      states([
        [1, 1, { downloaded: true }],
        [1, 2, { downloaded: true }],
      ])
    );
    expect(summary).toMatchObject({
      nextDlSeason: 1,
      nextDlEpisode: 3,
      nextDlAirDate: airDateToEpoch('02-03-2024'),
      nextDlStatus: 's',
    });
  });

  it('moves to the next season when a season is fully downloaded', () => {
    const summary = calculateSeasonSummary(
      SEASONS,
      states([
        [1, 1, { downloaded: true }],
        [1, 2, { downloaded: true }],
        [1, 3, { downloaded: true }],
      ])
    );
    expect(summary).toMatchObject({ nextDlSeason: 2, nextDlEpisode: 1, nextDlStatus: 's' });
  });

  it('is status a with no episode when everything is downloaded', () => {
    const summary = calculateSeasonSummary(
      SEASONS,
      states([
        [1, 1, { downloaded: true }],
        [1, 2, { downloaded: true }],
        [1, 3, { downloaded: true }],
        [2, 1, { downloaded: true }],
        [2, 2, { downloaded: true }],
      ])
    );
    expect(summary).toMatchObject({
      nextDlSeason: null,
      nextDlEpisode: null,
      nextDlAirDate: null,
      nextDlStatus: 'a',
    });
  });

  it('treats a trailing season with no episodes as nothing left to download', () => {
    const summary = calculateSeasonSummary(
      [season(1, 2), season(2, 0)],
      states([
        [1, 1, { downloaded: true }],
        [1, 2, { downloaded: true }],
      ])
    );
    expect(summary.nextDlStatus).toBe('a');
  });
});
