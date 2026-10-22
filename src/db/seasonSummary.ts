import { airDateToEpoch } from './dates';
import type { EpisodeStateMap } from './episodes';
import type { ShowSummaryInput } from './shows';

//~ -----------------------------------------------
//~ Season Summary calculation.
//~ Needs the TMDB seasons (episode counts and air dates) plus the Episode States.
//~ Ported rule-for-rule from the Legend State version (calculateSeasonSummary in
//~ functions-showAttributes.ts, replaced in phase 3), including its quirks:
//~  - seasons are processed in the order given (TMDB fetch puts season 0 last)
//~  - seasons with no episodes are left out of the summary
//~  - a show with no episodes at all counts as All Watched
//~ -----------------------------------------------
export type SummarySeason = {
  seasonNumber: number;
  episodes: { episodeNumber: number; airDate?: { formatted?: string } }[];
};

type NextDownload = {
  season?: number;
  episode?: number;
  airDate?: string;
  status: 's' | 'a' | 'n';
};

export const calculateSeasonSummary = (
  seasons: SummarySeason[],
  states: EpisodeStateMap
): ShowSummaryInput => {
  // Episode State counts per season (every stored episode counts, as before)
  const flagsBySeason = new Map<
    number,
    { watched: number; downloaded: number; favorited: number }
  >();
  const downloadedBySeason = new Map<number, Set<number>>();
  for (const [key, flags] of Object.entries(states)) {
    const [season, episode] = key.split(':').map(Number);
    const counts = flagsBySeason.get(season) ?? { watched: 0, downloaded: 0, favorited: 0 };
    if (flags.watched) counts.watched++;
    if (flags.downloaded) counts.downloaded++;
    if (flags.favorited) counts.favorited++;
    flagsBySeason.set(season, counts);
    if (flags.downloaded) {
      const downloaded = downloadedBySeason.get(season) ?? new Set<number>();
      downloaded.add(episode);
      downloadedBySeason.set(season, downloaded);
    }
  }

  const totalEpisodes = seasons
    .filter((season) => season.seasonNumber !== 0)
    .reduce((total, season) => total + season.episodes.length, 0);

  //~ --------- Next Download Episode ---------
  let nextDownload: NextDownload | undefined;
  let allDownloaded = true;
  let lastDownloadedSeason = 0;
  let lastDownloadedEpisode = 0;
  let lastSeasonAllDownloaded = false;

  for (const season of seasons) {
    if (season.seasonNumber === 0) continue;
    const downloaded = downloadedBySeason.get(season.seasonNumber) ?? new Set<number>();

    // Nothing downloaded in this season
    if (downloaded.size === 0 && !nextDownload) {
      allDownloaded = false;
      // A season with no episodes yet is assumed to be the (future) last season
      if (season.episodes.length === 0) {
        allDownloaded = true;
        continue;
      }
      nextDownload = {
        season: season.seasonNumber,
        episode: 1,
        airDate: season.episodes[0]?.airDate?.formatted,
        status: lastSeasonAllDownloaded ? 's' : 'n',
      };
      continue;
    }

    season.episodes.forEach((episode, index) => {
      if (downloaded.has(episode.episodeNumber)) {
        lastDownloadedSeason = season.seasonNumber;
        lastDownloadedEpisode = episode.episodeNumber;
        if (season.episodes.length === index + 1) lastSeasonAllDownloaded = true;
        return;
      }
      allDownloaded = false;
      if (
        (!nextDownload || nextDownload.status === 'n') &&
        lastDownloadedSeason <= season.seasonNumber &&
        lastDownloadedSeason > 0
      ) {
        nextDownload = {
          season: season.seasonNumber,
          episode: episode.episodeNumber,
          airDate: episode.airDate?.formatted,
          status: 's',
        };
      }
    });
  }

  if (lastDownloadedSeason === 0 && lastDownloadedEpisode === 0) {
    nextDownload = { ...(nextDownload ?? {}), status: 'n' };
  }
  if (allDownloaded) {
    nextDownload = { status: 'a' };
  }

  //~ --------- Per season totals ---------
  let lastWatchedSeason = 0;
  let totalWatched = 0;
  let allWatched = true;
  let anySeasonWithEpisodes = false;
  const seasonRows: ShowSummaryInput['seasons'] = [];

  for (const season of seasons) {
    const episodeCount = season.episodes.length;
    if (!episodeCount) continue;
    anySeasonWithEpisodes = true;

    const counts = flagsBySeason.get(season.seasonNumber) ?? {
      watched: 0,
      downloaded: 0,
      favorited: 0,
    };
    if (counts.watched === episodeCount) lastWatchedSeason = season.seasonNumber;
    totalWatched += counts.watched;
    // Season 0 (specials) never stops a show being All Watched
    allWatched = allWatched && (season.seasonNumber === 0 || counts.watched === episodeCount);

    seasonRows.push({
      season: season.seasonNumber,
      totalEpisodes: episodeCount,
      watched: counts.watched,
      downloaded: counts.downloaded,
      favorited: counts.favorited,
    });
  }

  const finalNextDownload: NextDownload = anySeasonWithEpisodes
    ? (nextDownload ?? { status: 'n' })
    : { status: 'n' };

  return {
    allWatched,
    totalEpisodes: anySeasonWithEpisodes ? totalEpisodes : 0,
    totalWatched,
    lastWatchedSeason,
    nextDlSeason: finalNextDownload.season ?? null,
    nextDlEpisode: finalNextDownload.episode ?? null,
    nextDlAirDate: airDateToEpoch(finalNextDownload.airDate),
    nextDlStatus: finalNextDownload.status,
    seasons: seasonRows,
  };
};

//~ Per-season lookup of a summary, for the episode screens
export const summaryBySeason = (summary: ShowSummaryInput) =>
  Object.fromEntries(summary.seasons.map((season) => [season.season, season]));
