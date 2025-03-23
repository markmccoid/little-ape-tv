//~ -----------------------------------------------
//~ ShowAttributes Function Start

import { TVShowSeasonDetails } from '@markmccoid/tmdb_api';
import { savedShows$ } from './store-shows';
import { use$ } from '@legendapp/state/react';
import { confirmAlert } from '~/utils/alert';
import { useEffect, useState } from 'react';

// ====================================================
// ====================================================
// savedShowAttributes$ types and interfaces
// ====================================================
// ====================================================

// Type for an individual episode
interface EpisodeAttributes {
  w: boolean; // watched
  d: boolean; // downloaded
  dw: number; // dateWatched
  f: boolean; // favorited (rating)
}

// Type for the season summary
interface SeasonSummary {
  te: number; // totalEpisodes
  tw: number; // totalWatched
  td: number; // totalDownloaded
  tf: number; // totalFavorited
  aw: boolean; // allWatched
  ad: boolean; // allDownloaded
}
export type SeasonsSummary = {
  lws: number; // lastWatchedSeason
  gtw: number; // grandTotalWatched
} & {
  [seasonNum: number]: SeasonSummary;
};

// Type for a season
interface Season {
  episodes: {
    [episodeNumber: number]: EpisodeAttributes;
  };
}

// Type for the full show attributes object
export interface ShowAttributes {
  [showId: string]: {
    summary: SeasonsSummary;
    seasons: {
      [seasonNumber: number]: Season;
    };
  };
}

//~ -----------------------------------------------
//~ GET Watched Episode Count
//~ -----------------------------------------------
export type SeasonEpisodesState = {
  [seasonNumber: string]: {
    episodeCount: number;
    watched: number;
    downloaded: number;
    favorited: number;
    allWatched: boolean;
    allDownloaded: boolean;
  };
} & { lastWatchedSeason: number; numEpisodesWatched: number };
export type SeasonStateKeys = keyof SeasonEpisodesState;

export const useWatchedEpisodeCount = (
  showId: string,
  seasons: TVShowSeasonDetails[]
): SeasonEpisodesState => {
  const seasonEpisodeCounts: Record<number, number> = {};
  seasons.forEach((season) => {
    seasonEpisodeCounts[season.seasonNumber] = season.episodes.length;
  });

  const tempShowAttributes = use$(savedShows$.showAttributes[showId]);
  if (!tempShowAttributes || !tempShowAttributes.seasons) return {} as SeasonEpisodesState;

  const seasonEpisodesState = Object.entries(tempShowAttributes.seasons).reduce(
    (fin: SeasonEpisodesState, [seasonNumber, seasonData]: [string, Season]) => {
      const numSeason = Number(seasonNumber);

      // Initialize season data if it doesn't exist
      if (!fin[seasonNumber]) {
        fin[seasonNumber] = {
          watched: 0,
          downloaded: 0,
          favorited: 0,
          allWatched: false,
          allDownloaded: false,
          episodeCount: seasonEpisodeCounts[numSeason] || 0,
        };
      }

      // Use summary data directly
      fin[seasonNumber].watched = seasonData.summary.tw;
      fin[seasonNumber].downloaded = seasonData.summary.td;
      fin[seasonNumber].favorited = seasonData.summary.tf;
      fin[seasonNumber].allWatched = seasonData.summary.tw === seasonData.summary.te;
      fin[seasonNumber].allDownloaded = seasonData.summary.td === seasonData.summary.te;

      // Update aggregate counts
      let episodes = fin['numEpisodesWatched'] || 0;
      episodes = fin[seasonNumber].allWatched
        ? episodes + seasonEpisodeCounts[numSeason]
        : episodes;
      fin['numEpisodesWatched'] = episodes;

      fin['lastWatchedSeason'] = fin[seasonNumber].allWatched
        ? numSeason
        : fin['lastWatchedSeason'] || 0;

      return fin;
    },
    {} as SeasonEpisodesState
  );
  return seasonEpisodesState;
};

//~ -----------------------------------------------
//~ Toggle Watched Status
//~ -----------------------------------------------
export const toggleEpisodeWatched = (
  showId: string,
  seasonNumber: number,
  episodeNumber: number
) => {
  const episode = savedShows$.showAttributes[showId].seasons[seasonNumber].episodes[episodeNumber];
  const watched = episode.w.peek();
  // console.log('SEASON', savedShows$.showAttributes[showId].peek());
  // console.log('toggleWatched', episode, watched);
  if (watched) {
    episode.w.delete();
  } else {
    savedShows$.showAttributes[showId].seasons[seasonNumber].episodes[episodeNumber].w.set(true);

    if (episodeNumber <= 1) return;

    const prevEpisode =
      savedShows$.showAttributes[showId].seasons[seasonNumber].episodes[episodeNumber - 1];
    const prevWatched = prevEpisode.w.peek();

    if (prevWatched) return;

    confirmAlert(
      'Mark Previous',
      'Set Previous Episodes to Watched',
      () => {
        for (let e = episodeNumber - 1; e >= 1; e--) {
          const ep = savedShows$.showAttributes[showId].seasons[seasonNumber].episodes[e];
          if (!ep.w.peek()) {
            savedShows$.showAttributes[showId].seasons[seasonNumber].episodes[e].w.set(true);
            // savedShows$.showAttributes[showId].seasons[seasonNumber].summary.tw.set((v) => v + 1);
          }
        }
      },
      () => {}
    );
  }
};

//~ -----------------------------------------------
//~ Toggle Downloaded Status
//~ -----------------------------------------------
export const toggleEpisodeDownloaded = (
  showId: string,
  seasonNumber: number,
  episodeNumber: number
) => {
  const episode = savedShows$.showAttributes[showId].seasons[seasonNumber].episodes[episodeNumber];
  const downloaded = episode.d.peek();

  if (downloaded) {
    episode.d.delete();
  } else {
    savedShows$.showAttributes[showId].seasons[seasonNumber].episodes[episodeNumber].d.set(true);
  }
};

//~ -----------------------------------------------
//~ Toggle Favorited Status
//~ -----------------------------------------------
export const toggleEpisodeFavorited = (
  showId: string,
  seasonNumber: number,
  episodeNumber: number
) => {
  const episode = savedShows$.showAttributes[showId].seasons[seasonNumber].episodes[episodeNumber];
  const favorited = episode.f.peek();

  if (favorited) {
    episode.f.delete();
  } else {
    savedShows$.showAttributes[showId].seasons[seasonNumber].episodes[episodeNumber].f.set(true); // Assuming 1 as default favorited value
  }
};

//~ -----------------------------------------------
//~ Update All Episodes in Season Utility functions
//~ -----------------------------------------------
export const setSeasonToWatched = (showId: string, seasonNumber: number, numOfEpisodes: number) => {
  updateAllEpisodes(showId, seasonNumber, numOfEpisodes, 'w', 'set');
};

export const removeSeasonFromWatched = (
  showId: string,
  seasonNumber: number,
  numOfEpisodes: number
) => {
  updateAllEpisodes(showId, seasonNumber, numOfEpisodes, 'w', 'remove');
};

export const setSeasonToDownloaded = (
  showId: string,
  seasonNumber: number,
  numOfEpisodes: number
) => {
  updateAllEpisodes(showId, seasonNumber, numOfEpisodes, 'd', 'set');
};

export const removeSeasonFromDownloaded = (
  showId: string,
  seasonNumber: number,
  numOfEpisodes: number
) => {
  updateAllEpisodes(showId, seasonNumber, numOfEpisodes, 'd', 'remove');
};

export const updateAllEpisodes = (
  showId: string,
  seasonNumber: number,
  numOfEpisodes: number,
  field: 'w' | 'd',
  action: 'set' | 'remove'
) => {
  // initialize season in showAttributes observable
  if (!savedShows$.showAttributes[showId].seasons[seasonNumber]) {
    savedShows$.showAttributes[showId].seasons.set({ [seasonNumber]: { episodes: {} } });
  }
  const season = savedShows$.showAttributes[showId].seasons[seasonNumber];

  if (action === 'set') {
    let count = 0;
    for (let i = 1; i <= numOfEpisodes; i++) {
      if (!season.episodes[i][field].peek()) {
        season.episodes[i][field].set(true);
        count++;
      }
    }
  } else {
    let count = 0;
    for (let i = 1; i <= numOfEpisodes; i++) {
      if (season.episodes[i][field].peek()) {
        season.episodes[i][field].delete();
        count++;
      }
    }
  }
};

//# ------------------------------------------------------------
//# Attribute Getter Hooks
//# ------------------------------------------------------------
//~ Gets episode attributes from storage and exands the names to more readable form
export const useEpisodeAttributes = (showId: string, seasonNum: number, episodeNum: number) => {
  const { w, d, f, dw } =
    use$(savedShows$.showAttributes[showId]?.seasons[seasonNum]?.episodes[episodeNum]) || {};
  //  console.log('useepisode attribes', w, d, f, dw);
  return {
    watched: w,
    downloaded: d,
    favorited: f,
    dateWatched: dw,
  };
};

/*
[
  { '1': { te: 10, tw: 8, td: 6, tf: 4 } },
  { '2': { te: 8, tw: 8, td: 4, tf: 2 } }
  ]
  */
type SeasonsSummaryVerbose = {
  lastWatchedSeason: number;
  grandTotalWatched: number;
} & {
  [seasonNum: number]: SeasonSummaryVerbose;
};
type SeasonSummaryVerbose = {
  totalEpisodes: number;
  watched: number;
  allWatched: boolean;
  downloaded: number;
  allDownloaded: boolean;
  favorited: number;
};
//~ Returns a seasonSummary object with the season numbers as the keys and the summary object as the value to them
//~ verbose names are returned
//~  This is the Function that stores the seasonsSummary on the the showAttributes record for a showId
export const useSeasonSummary = (
  showId: string,
  seasons: TVShowSeasonDetails[]
): SeasonsSummaryVerbose => {
  const seasonData = use$(savedShows$.showAttributes[showId]?.seasons) || {};
  // Get the episode count for each season.
  const seasonEpisodeCounts: Record<number, number> = {};
  seasons.forEach((season) => {
    seasonEpisodeCounts[season.seasonNumber] = season.episodes.length;
  });

  // Loop through saved season attribute data and reduce data down into a summary Object
  /*
  { 1: { totalEpisodes, watched, allWatched, downloaded, allDownloaded, favorited }}
  */

  let lastWatchedSeason = 0;
  let grandTotalWatched = 0;
  const seasonsSummary: SeasonsSummary = Object.keys(seasonData).reduce(
    (final, season: string) => {
      const seasonNum = parseInt(season);
      const numDownloaded = getSeasonTotalsByType(seasonData[seasonNum].episodes, 'd');
      const numWatched = getSeasonTotalsByType(seasonData[seasonNum].episodes, 'w');
      if (numWatched === seasonEpisodeCounts[seasonNum]) {
        lastWatchedSeason = parseInt(season);
      }
      grandTotalWatched = grandTotalWatched + numWatched;
      return {
        ...final,
        lws: lastWatchedSeason,
        gtw: grandTotalWatched,
        [season]: {
          te: seasonEpisodeCounts[seasonNum],
          tw: numWatched,
          aw: numWatched === seasonEpisodeCounts[seasonNum],
          td: numDownloaded,
          ad: numDownloaded === seasonEpisodeCounts[seasonNum],
          tf: getSeasonTotalsByType(seasonData[seasonNum].episodes, 'f'),
        },
      };
    },
    { lws: 0 }
  );

  // Store the seasonSummary data on savedShow$.showAttributes observable
  savedShows$.showAttributes[showId].summary.set(seasonsSummary);

  return expandSummaryNames(seasonsSummary);
};

//# ----------------------------------------------------------------------------
//# returns the SAVED seasonSummary, does not calculate anything!!
//# ----------------------------------------------------------------------------
export const useSavedSeasonSummary = (showId: string): SeasonsSummaryVerbose => {
  const [seasonsSummary, setSeasonsSummary] = useState<SeasonsSummaryVerbose>();

  // We can't subscribe directly, as I was getting react errors about updates happening while other rerending
  // this way with requestAnimationFrame, we wait to update state until the rendering is finished and then
  // component using this hook with update with new summary data.
  useEffect(() => {
    // Subscribe to changes
    const unsubscribe = savedShows$.showAttributes[showId].summary.onChange((newValue) => {
      requestAnimationFrame(() => {
        setSeasonsSummary(expandSummaryNames(newValue.value));
      });
    });

    // initial populatation of summary data.
    requestAnimationFrame(() => {
      const initialValue = savedShows$.showAttributes[showId].summary.peek();
      setSeasonsSummary(expandSummaryNames(initialValue));
    });

    return () => unsubscribe();
  }, [showId]);

  return seasonsSummary as SeasonsSummaryVerbose;
};

//~ Gets an episodes attributes object and loops through to total "w"atched "d"ownloaded or "f"avorited episode counts
function getSeasonTotalsByType(
  episodes: { [episodeNumber: number]: EpisodeAttributes },
  type: 'w' | 'd' | 'f'
) {
  return Object.keys(episodes).reduce((final: number, ep: string) => {
    const episodeNum = parseInt(ep);
    final = final + (!!episodes[episodeNum][type] ? 1 : 0);
    // console.log(final, episodes[episodeNum])
    return final;
  }, 0);
}

// Expand the seasons summary names from their shortened to full
// We shorten to save space when storing
function expandSummaryNames(summaryData: SeasonsSummary): SeasonsSummaryVerbose {
  if (!summaryData) return { lastWatchedSeason: 0, grandTotalWatched: 0 };
  let newData = { lastWatchedSeason: 0, grandTotalWatched: 0 };

  for (let season in summaryData) {
    newData = {
      ...newData,
      lastWatchedSeason: summaryData.lws,
      grandTotalWatched: summaryData.gtw,
      [season]: {
        totalEpisodes: summaryData[season].te,
        watched: summaryData[season].tw,
        allWatched: summaryData[season].aw,
        downloaded: summaryData[season].td,
        allDownloaded: summaryData[season].ad,
        favorited: summaryData[season].tf,
      },
    };
  }

  return newData;
}
