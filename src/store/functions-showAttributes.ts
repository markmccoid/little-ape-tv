//~ -----------------------------------------------
//~ ShowAttributes Function Start

import { TVShowSeasonDetails } from '@markmccoid/tmdb_api';
import { savedShows$ } from './store-shows';
import { use$, useObserve } from '@legendapp/state/react';
import { confirmAlert } from '~/utils/alert';
import { eventDispatcher, EventName } from '~/utils/EventDispatcher';
// import { useEffect, useMemo, useState } from 'react';
// import { getShowDetails } from './functions-shows';
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
  tec: number; // totalEpisodeCount
  asw: boolean; // allSeasonsWatched
  lws: number; // lastWatchedSeason
  gtw: number; // grandTotalWatched
  nde: NextDownloadEpisode;
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

// export const useWatchedEpisodeCount = (
//   showId: string,
//   seasons: TVShowSeasonDetails[]
// ): SeasonEpisodesState => {
//   const seasonEpisodeCounts: Record<number, number> = {};
//   seasons.forEach((season) => {
//     seasonEpisodeCounts[season.seasonNumber] = season.episodes.length;
//   });

//   const tempShowAttributes = use$(savedShows$.showAttributes[showId]);
//   if (!tempShowAttributes || !tempShowAttributes.seasons) return {} as SeasonEpisodesState;

//   const seasonEpisodesState = Object.entries(tempShowAttributes.seasons).reduce(
//     (fin: SeasonEpisodesState, [seasonNumber, seasonData]: [string, Season]) => {
//       const numSeason = Number(seasonNumber);

//       // Initialize season data if it doesn't exist
//       if (!fin[seasonNumber]) {
//         fin[seasonNumber] = {
//           watched: 0,
//           downloaded: 0,
//           favorited: 0,
//           allWatched: false,
//           allDownloaded: false,
//           episodeCount: seasonEpisodeCounts[numSeason] || 0,
//         };
//       }

//       // Use summary data directly
//       fin[seasonNumber].watched = seasonData.summary.tw;
//       fin[seasonNumber].downloaded = seasonData.summary.td;
//       fin[seasonNumber].favorited = seasonData.summary.tf;
//       fin[seasonNumber].allWatched = seasonData.summary.tw === seasonData.summary.te;
//       fin[seasonNumber].allDownloaded = seasonData.summary.td === seasonData.summary.te;

//       // Update aggregate counts
//       let episodes = fin['numEpisodesWatched'] || 0;
//       episodes = fin[seasonNumber].allWatched
//         ? episodes + seasonEpisodeCounts[numSeason]
//         : episodes;
//       fin['numEpisodesWatched'] = episodes;

//       fin['lastWatchedSeason'] = fin[seasonNumber].allWatched
//         ? numSeason
//         : fin['lastWatchedSeason'] || 0;

//       return fin;
//     },
//     {} as SeasonEpisodesState
//   );
//   return seasonEpisodesState;
// };

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
    // Check to see if the prev episode is marked.  If not ask if we should mark ALL previous episode
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
type NextDownloadEpisode =
  | {
      season?: number;
      episode?: number;
      airDate?: string;
      status: 's' | 'a' | 'n';
    }
  | undefined;
export type SeasonsSummaryVerbose = {
  totalEpisodeCount: number;
  allSeasonsWatched: boolean;
  lastWatchedSeason: number;
  grandTotalWatched: number;
  nextDownloadEpisode: NextDownloadEpisode;
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
// export const useSeasonSummary = (
//   showId: string,
//   seasons: TVShowSeasonDetails[]
// ): SeasonsSummaryVerbose => {
//   // const seasonsAttributeData = use$(savedShows$.showAttributes[showId]?.seasons) || {};
//   const currentSummary = use$(savedShows$.showAttributes[showId]?.summary);

//   useObserve(() => {
//     // This runs whenever seasonsAttributeData changes (including nested properties)
//     // const data = seasonsAttributeData; // Access the raw value to trigger observation
//     const seasonsAttributeData = savedShows$.showAttributes[showId]?.seasons.get() || {};

//     const newSummary = calculateSeasonSummary(showId, seasonsAttributeData, seasons);
//     savedShows$.showAttributes[showId].summary.set(newSummary);

//     eventDispatcher.emit(
//       EventName.UpdateAvgEpisodeRuntime,
//       showId,
//       seasons.map((el) => el.seasonNumber)
//     );
//   });

//   return expandSummaryNames(currentSummary || {});
// };

//# Update Seasons Summary
//# Called from useObserveEffect in SeasonEpisodeList
export const updateSeasonSummary = (showId: string, seasons: TVShowSeasonDetails[]) => {
  //! If the show is not stored locally, don't update the summary
  if (!savedShows$.shows[showId].peek()?.isStoredLocally) return;

  // Get the showAttributes for the seasons.  This is will hold the episodes and if they are watched/downloaded/favoriated
  const seasonsAttributeData: { [seasonNumber: number]: Season } =
    savedShows$.showAttributes[showId]?.seasons.get() || {};
  // Calculate the new summary
  const newSummary = calculateSeasonSummary(showId, seasonsAttributeData, seasons);
  // Update the summary in the observable state
  savedShows$.showAttributes[showId].summary.set(newSummary);
  // Check if the avgEpisodeRunTime is set, if not emit an event to calculate it
  const avgRunTime = savedShows$.shows[showId].avgEpisodeRunTime.peek();
  //! REMOVE START
  //! forcing this everytime until we populate the avgRunTime
  // eventDispatcher.emit(
  //   EventName.UpdateAvgEpisodeRuntime,
  //   showId,
  //   seasons.map((el) => el.seasonNumber)
  // );
  //! REMOVE END
  if (avgRunTime === 0 || isNaN(Number(avgRunTime))) {
    eventDispatcher.emit(
      EventName.UpdateAvgEpisodeRuntime,
      showId,
      seasons.map((el) => el.seasonNumber)
    );
  }
};
//# -------------------------------------------------
//# Calculate Season Summary
//# -------------------------------------------------
const calculateSeasonSummary = (
  showId: string,
  seasonsAttributeData: { [seasonNumber: number]: Season },
  seasons: TVShowSeasonDetails[]
) => {
  const seasonEpisodeCounts: Record<number, number> = {};
  let totalEpisodesCount: number = 0;
  seasons.forEach((season) => {
    seasonEpisodeCounts[season.seasonNumber] = season.episodes.length;
    if (season.seasonNumber !== 0) {
      totalEpisodesCount = totalEpisodesCount + season.episodes.length;
    }
  });

  let lastWatchedSeason = 0;
  let grandTotalWatched = 0;

  //! --------- START DOWNLOAD STATUS CALC ---------
  // s = "some downloaded", a = "all downloaded" n = "none downloaded"
  let nextDownloadEpisode: NextDownloadEpisode = undefined;
  let allDownloaded = true;

  // First, find the last downloaded episode
  let lastDownloadedSeason = 0;
  let lastDownloadedEpisode = 0;
  let lastSeasonAllDownloaded = false;

  // Loop through seasons in order
  seasons.forEach((season) => {
    if (season.seasonNumber === 0) return; // Skip special season

    /* Get only "d" download attribuetes
    {"episodes": {"1": {"w": true}, "2": {"w": true}, "3": {"w": true}}}
    */
    let result = { episodes: {} as { [key: number]: { d: boolean } } };
    // We are inside a forEach.  Look at the episodes for the season we are one
    const tempAttribs = seasonsAttributeData[season.seasonNumber] || { episodes: {} };
    for (const episode in tempAttribs.episodes) {
      if (tempAttribs?.episodes?.[episode].hasOwnProperty('d')) {
        result.episodes[episode] = { d: tempAttribs.episodes[episode].d };
      }
    }
    // Downloaded episodes for the given seasons
    const seasonAttribData = result;

    // Checking if NO episodes are downloaded for the season
    // If not we set nextDownloadEpisode
    if (Object.keys(seasonAttribData.episodes).length === 0 && !nextDownloadEpisode) {
      allDownloaded = false;

      // Sometimes a season has no episodes. If that is the case
      // we ASSUME that it is a new season that has no episodes yet and
      // thus the LAST season which is why mark as allDownloaded to true
      // because there is nothing to download yet.
      if (season.episodes.length === 0) {
        allDownloaded = true;
        return;
      }

      // the lastSeasonAllDownloaded check, makes sure we set the status to "s" if
      // there are previous seasons with all the episodes downloaded.
      nextDownloadEpisode = {
        season: season.seasonNumber,
        episode: 1,
        airDate: season?.episodes[0]?.airDate.formatted,
        status: lastSeasonAllDownloaded ? 's' : 'n',
      };

      return;
    }

    // Loop through the actual seasons/episodes and
    // Check each episode against our seasonAttribute episodes to see if it was downloaded.
    const seasonEpisodeCount = season.episodes.length;
    season.episodes.forEach((ep, idx) => {
      const isDownloaded = seasonAttribData.episodes[ep.episodeNumber]?.d;

      if (isDownloaded) {
        lastDownloadedSeason = season.seasonNumber;
        lastDownloadedEpisode = ep.episodeNumber;
        // if ALL episodes are downloaded, set the lastSeasonAllDownloaded to true
        if (seasonEpisodeCount === idx + 1) {
          lastSeasonAllDownloaded = true;
        }
      } else {
        allDownloaded = false;
        if (
          (!nextDownloadEpisode || nextDownloadEpisode.status === 'n') &&
          lastDownloadedSeason <= season.seasonNumber &&
          lastDownloadedSeason > 0
        ) {
          nextDownloadEpisode = {
            season: season.seasonNumber,
            episode: ep.episodeNumber,
            airDate: ep.airDate.formatted,
            status: 's',
          };
        }
        return;
      }
    });
  });

  if (lastDownloadedSeason === 0 && lastDownloadedEpisode === 0) {
    nextDownloadEpisode = {
      ...(typeof nextDownloadEpisode === 'object' && nextDownloadEpisode !== null
        ? nextDownloadEpisode
        : {}),
      status: 'n',
    };
  }

  if (allDownloaded) {
    nextDownloadEpisode = {
      season: undefined,
      episode: undefined,
      airDate: undefined,
      status: 'a',
    };
  }

  //! --------- END DOWNLOAD STATUS CALC ---------

  //~ Calculate the summary data for each season as well as the lastWatchedSeasons(lws), grandTotalWatched(gtw), and nextDownloadEpisode (nde)
  //~ Need to loop through each season (even if NO attributes applied).  This is so we know if ALL seasons have been watched
  const seasonsSummary = seasons
    .map((el) => el.seasonNumber)
    .reduce<SeasonsSummary>(
      (final, seasonNum: number) => {
        // const seasonNum = parseInt(season);
        // If there are NO episodes in season, do NOT include it in the Season Summary.

        if (seasonEpisodeCounts[seasonNum] === 0 || !seasonEpisodeCounts[seasonNum]) return final;

        const numDownloaded = getSeasonTotalsByType(seasonsAttributeData[seasonNum]?.episodes, 'd');
        const numWatched = getSeasonTotalsByType(seasonsAttributeData[seasonNum]?.episodes, 'w');
        // checking also for episodes > 0, should never happen because of first 'if' check in reduce.
        if (numWatched === seasonEpisodeCounts[seasonNum] && seasonEpisodeCounts[seasonNum] > 0) {
          lastWatchedSeason = seasonNum;
        }
        grandTotalWatched = grandTotalWatched + numWatched;
        // Calculate asw for this season (skip season 0, force true on season 0)
        // Need to do this so that our final.asw && seasonAsw works properly.
        const seasonAsw = seasonNum === 0 ? true : numWatched === seasonEpisodeCounts[seasonNum];

        // console.log(
        //   'seasonSummary',
        //   seasonNum,
        //   numWatched,
        //   seasonEpisodeCounts[seasonNum],
        //   final.asw,
        //   seasonAsw,
        //   final.asw && seasonAsw
        // );

        return {
          ...final,
          asw: final.asw && seasonAsw,
          tec: totalEpisodesCount,
          lws: lastWatchedSeason,
          gtw: grandTotalWatched,
          nde: nextDownloadEpisode || { status: 'n' },
          [seasonNum]: {
            te: seasonEpisodeCounts[seasonNum],
            tw: numWatched,
            aw: numWatched === seasonEpisodeCounts[seasonNum],
            td: numDownloaded,
            ad: numDownloaded === seasonEpisodeCounts[seasonNum],
            tf: getSeasonTotalsByType(seasonsAttributeData[seasonNum]?.episodes, 'f'),
          },
        };
      },
      { tec: 0, asw: true, lws: 0, gtw: 0, nde: { status: 'n' } } as SeasonsSummary
    );

  //!! OLD SEASONSUMMARY
  // const seasonsSummary = Object.keys(seasonsAttributeData).reduce<SeasonsSummary>(
  //   (final, season: string) => {
  //     const seasonNum = parseInt(season);
  //     const numDownloaded = getSeasonTotalsByType(seasonsAttributeData[seasonNum].episodes, 'd');
  //     const numWatched = getSeasonTotalsByType(seasonsAttributeData[seasonNum].episodes, 'w');
  //     if (numWatched === seasonEpisodeCounts[seasonNum]) {
  //       lastWatchedSeason = parseInt(season);
  //     }
  //     grandTotalWatched = grandTotalWatched + numWatched;

  //     // Calculate asw for this season (skip season 0, force true on season 0)
  //     // Need to do this so that our final.asw && seasonAsw works properly.
  //     const seasonAsw = seasonNum === 0 ? true : numWatched === seasonEpisodeCounts[seasonNum];

  //     console.log(
  //       'seasonSummary',
  //       seasonNum,
  //       numWatched,
  //       seasonEpisodeCounts[seasonNum],
  //       final.asw,
  //       seasonAsw,
  //       final.asw && seasonAsw
  //     );
  //     return {
  //       ...final,
  //       asw: final.asw && seasonAsw,
  //       tec: totalEpisodesCount,
  //       lws: lastWatchedSeason,
  //       gtw: grandTotalWatched,
  //       nde: nextDownloadEpisode || { status: 'n' },
  //       [season]: {
  //         te: seasonEpisodeCounts[seasonNum],
  //         tw: numWatched,
  //         aw: numWatched === seasonEpisodeCounts[seasonNum],
  //         td: numDownloaded,
  //         ad: numDownloaded === seasonEpisodeCounts[seasonNum],
  //         tf: getSeasonTotalsByType(seasonsAttributeData[seasonNum].episodes, 'f'),
  //       },
  //     };
  //   },
  //   { tec: 0, asw: true, lws: 0, gtw: 0, nde: { status: 'n' } } as SeasonsSummary
  // );

  // Store the seasonSummary data on savedShow$.showAttributes observable
  // savedShows$.showAttributes[showId].summary.set(seasonsSummary);

  //emit event to update the average runtime
  // eventDispatcher.emit(
  //   EventName.UpdateAvgEpisodeRuntime,
  //   showId,
  //   seasons.map((el) => el.seasonNumber)
  // );
  return seasonsSummary;
};
//! -------------------------------------------------

//# ----------------------------------------------------------------------------
//# returns the SAVED seasonSummary, does not calculate anything!!
//# ----------------------------------------------------------------------------
export const useSavedSeasonSummary = (showId: string): SeasonsSummaryVerbose => {
  const summary = use$(savedShows$.showAttributes[showId].summary);
  return expandSummaryNames(summary || {});
  // return useMemo(() => expandSummaryNames(summary || {}), [summary]);
};

//~ Gets an episodes attributes object and loops through to total "w"atched "d"ownloaded or "f"avorited episode counts
function getSeasonTotalsByType(
  episodes: { [episodeNumber: number]: EpisodeAttributes },
  type: 'w' | 'd' | 'f'
) {
  if (!episodes) return 0;
  return Object.keys(episodes).reduce((final: number, ep: string) => {
    const episodeNum = parseInt(ep);
    final = final + (!!episodes[episodeNum][type] ? 1 : 0);
    // console.log(final, episodes[episodeNum])
    return final;
  }, 0);
}

// Expand the seasons summary names from their shortened to full
// We shorten to save space when storing
export function expandSummaryNames(summaryData: SeasonsSummary): SeasonsSummaryVerbose {
  // if (!summaryData)
  //   return { lastWatchedSeason: 0, grandTotalWatched: 0, nextDownloadEpisode: { status: 'n' } };
  let newData: SeasonsSummaryVerbose = {
    totalEpisodeCount: summaryData?.tec || 0,
    allSeasonsWatched: summaryData?.asw || false,
    lastWatchedSeason: summaryData?.lws || 0,
    grandTotalWatched: summaryData?.gtw || 0,
    nextDownloadEpisode: summaryData?.nde || { status: 'n' },
  };

  for (let season in summaryData) {
    // along with season data we have the three other keys that summarize
    // the all the shows seasons
    if (['lws', 'gtw', 'nde', 'asw', 'tec'].includes(season)) continue;
    newData = {
      ...newData,
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
