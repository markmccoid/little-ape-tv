//~ -----------------------------------------------
//~ ShowAttributes Function Start

import { TVShowSeasonDetails } from '@markmccoid/tmdb_api';
import { savedShows$ } from './store-shows';
import { use$ } from '@legendapp/state/react';
import { confirmAlert } from '~/utils/alert';
import { useEffect, useMemo, useState } from 'react';
import { eventDispatcher, EventName } from '~/utils/EventDispatcher';

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
  nds: NextDownloadEpisode; // nextDownloadEpisode
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
type NextDownloadEpisode =
  | {
      season?: number;
      episode?: number;
      airDate?: string;
      status: 's' | 'a' | 'n';
    }
  | undefined;
type SeasonsSummaryVerbose = {
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
export const useSeasonSummary = (
  showId: string,
  seasons: TVShowSeasonDetails[]
): SeasonsSummaryVerbose => {
  const seasonsAttributeData = use$(savedShows$.showAttributes[showId]?.seasons) || {};
  const seasonEpisodeCounts: Record<number, number> = {};
  seasons.forEach((season) => {
    seasonEpisodeCounts[season.seasonNumber] = season.episodes.length;
  });

  let lastWatchedSeason = 0;
  let grandTotalWatched = 0;

  // status
  // s = "some downloaded", a = "all downloaded" n = "none downloaded"
  let nextDownloadEpisode: NextDownloadEpisode = undefined;
  let allDownloaded = true;

  // First, find the last downloaded episode
  let lastDownloadedSeason = 0;
  let lastDownloadedEpisode = 0;

  // Loop through seasons in order
  seasons.forEach((season) => {
    if (season.seasonNumber === 0) return; // Skip special season

    //# --------- DOWNLOAD Status START ---------------------
    // Get only "d" download attribuetes
    /*
    {"episodes": {"1": {"w": true}, "2": {"w": true}, "3": {"w": true}}}
    */
    const result = { episodes: {} as { [key: number]: { d: boolean } } };
    const tempAttribs = seasonsAttributeData[season.seasonNumber] || { episodes: {} };
    for (const episode in tempAttribs.episodes) {
      if (tempAttribs?.episodes?.[episode].hasOwnProperty('d')) {
        result.episodes[episode] = { d: tempAttribs.episodes[episode].d };
      }
    }
    const seasonAttribData = result; //seasonsAttributeData[season.seasonNumber];

    if (Object.keys(seasonAttribData.episodes).length === 0) {
      allDownloaded = false;
      if (!nextDownloadEpisode) {
        //~ If you wanted to show that nothing or at least the first has not yet been downloaded
        //~ uncomment.  Otherwise we want it to be null
        nextDownloadEpisode = {
          season: season.seasonNumber,
          episode: 1,
          airDate: season.episodes[0].airDate.formatted,
          status: 's',
        };
      }
      return;
    }

    // Check each episode in the season
    season.episodes.forEach((ep, idx) => {
      const isDownloaded = seasonAttribData.episodes[ep.episodeNumber]?.d;
      if (isDownloaded) {
        lastDownloadedSeason = season.seasonNumber;
        lastDownloadedEpisode = ep.episodeNumber;
      } else {
        allDownloaded = false;
        if (
          !nextDownloadEpisode &&
          lastDownloadedSeason <= season.seasonNumber &&
          lastDownloadedSeason > 0
        ) {
          console.log('Setting next episode.', lastDownloadedSeason, season.seasonNumber);
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
  //# --------- DOWNLOAD Status END ---------------------

  const seasonsSummary = Object.keys(seasonsAttributeData).reduce<SeasonsSummary>(
    (final, season: string) => {
      const seasonNum = parseInt(season);
      const numDownloaded = getSeasonTotalsByType(seasonsAttributeData[seasonNum].episodes, 'd');
      const numWatched = getSeasonTotalsByType(seasonsAttributeData[seasonNum].episodes, 'w');
      if (numWatched === seasonEpisodeCounts[seasonNum]) {
        lastWatchedSeason = parseInt(season);
      }
      grandTotalWatched = grandTotalWatched + numWatched;
      return {
        ...final,
        lws: lastWatchedSeason,
        gtw: grandTotalWatched,
        nds: nextDownloadEpisode || { status: 'n' },
        [season]: {
          te: seasonEpisodeCounts[seasonNum],
          tw: numWatched,
          aw: numWatched === seasonEpisodeCounts[seasonNum],
          td: numDownloaded,
          ad: numDownloaded === seasonEpisodeCounts[seasonNum],
          tf: getSeasonTotalsByType(seasonsAttributeData[seasonNum].episodes, 'f'),
        },
      };
    },
    { lws: 0, gtw: 0, nds: { status: 'n' } } as SeasonsSummary
  );

  // Store the seasonSummary data on savedShow$.showAttributes observable
  savedShows$.showAttributes[showId].summary.set(seasonsSummary);

  //emit event to update the average runtime
  eventDispatcher.emit(
    EventName.UpdateAvgEpisodeRuntime,
    showId,
    seasons.map((el) => el.seasonNumber)
  );
  return expandSummaryNames(seasonsSummary);
};

//# ----------------------------------------------------------------------------
//# returns the SAVED seasonSummary, does not calculate anything!!
//# ----------------------------------------------------------------------------
export const useSavedSeasonSummary = (showId: string): SeasonsSummaryVerbose => {
  const [seasonsSummary, setSeasonsSummary] = useState<SeasonsSummaryVerbose>(
    {} as SeasonsSummaryVerbose
  );
  const summary = use$(savedShows$.showAttributes[showId].summary);
  return useMemo(() => expandSummaryNames(summary || {}), [summary]);

  // const summary = use$(savedShows$.showAttributes[showId].summary);

  useEffect(() => {
    const newSummary = expandSummaryNames(summary);
    const frameId = requestAnimationFrame(() => {
      setSeasonsSummary(newSummary);
    });

    // Cleanup to prevent memory leaks or updates after unmount
    return () => cancelAnimationFrame(frameId);
  }, [summary]);

  return seasonsSummary;
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
  if (!summaryData)
    return { lastWatchedSeason: 0, grandTotalWatched: 0, nextDownloadEpisode: { status: 'n' } };
  let newData = { lastWatchedSeason: 0, grandTotalWatched: 0 };

  for (let season in summaryData) {
    newData = {
      ...newData,
      lastWatchedSeason: summaryData.lws,
      grandTotalWatched: summaryData.gtw,
      nextDownloadEpisode: summaryData.nds,
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
