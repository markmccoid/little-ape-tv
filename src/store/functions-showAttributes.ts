//~ -----------------------------------------------
//~ ShowAttributes Function Start

import { TVShowSeasonDetails } from '@markmccoid/tmdb_api';
import { savedShows$ } from './store-shows';
import { use$ } from '@legendapp/state/react';
import { confirmAlert } from '~/utils/alert';

// ====================================================
// ====================================================
// savedShowAttributes$ functions
// ====================================================
// ====================================================
export type EpisodeAttributes = {
  watched?: boolean;
  downloaded?: boolean;
  favorited?: boolean;
  dateWatched?: number;
  rating?: number;
};
type SeasonEpisodeKey = string; // `${seasonNumber}-${episodeNumber}`;
type ShowId = string;
export type SeasonEpisodeAttributes = Record<SeasonEpisodeKey, EpisodeAttributes>;
export type SavedShowsAttributes = Record<ShowId, SeasonEpisodeAttributes>;

/*
Attributes object will have showId as keys and EpisodeAttributes as values
{
  showId: {
    '1-1': { // SeasonEpisodeKey
    watched: boolean,  
    downloaded: boolean,
    dateWatched: number,
    rating: number
    },
    '1-2': {
    watched: boolean,
    downloaded: boolean,
    dateWatched: number,  
    rating: number
    }
  },
  ...
}

The SeasonEpisodeKey is a string that is a combination of the season number and episode number.
*/
export const buildSeasonEpisodeKey = (seasonNumber: number, episodeNumber: number) => {
  return `${seasonNumber}-${episodeNumber}`;
};

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

// Calculate object with lastWatchedSeason and then a key for each season
// and list of attributes for that season
export const useWatchedEpisodeCount = (
  showId: string,
  seasons: TVShowSeasonDetails[]
): SeasonEpisodesState => {
  const seasonEpisodeCounts: Record<number, number> = {};
  seasons.forEach((season) => {
    seasonEpisodeCounts[season.seasonNumber] = season.episodes.length;
  });

  // console.log('Season Episode Counts', seasonEpisodeCounts);
  seasons.map((season) => ({
    seasonNumber: season.seasonNumber,
    episodeCount: season.episodes.length,
  }));
  // Get all of the showId's attributes
  const tempSeasonEpisodeState = use$(savedShows$.showAttributes[showId]);
  if (!tempSeasonEpisodeState) return;

  const seasonEpisodesState = Object.keys(tempSeasonEpisodeState).reduce(
    (fin: SeasonEpisodesState, epStateKey: string) => {
      // Get the season number from the key
      const seasonNumber: string = epStateKey.slice(0, epStateKey.indexOf('-'));

      // Get the watched and downloaded status - Should only return 1.
      // We are removing episodes that are marked as unwatched or undownloaded
      const isWatched = tempSeasonEpisodeState[epStateKey]?.watched ? 1 : 0;
      const isDownloaded = tempSeasonEpisodeState[epStateKey]?.downloaded ? 1 : 0;
      const isFavorited = tempSeasonEpisodeState[epStateKey]?.favorited ? 1 : 0;
      // console.log('Season Number', seasonNumber, tempSeasonEpisodeState[epStateKey].watched);
      // Initialize fin[seasonNumber] if it doesn't exist
      if (!fin[seasonNumber]) {
        fin[seasonNumber] = {
          watched: 0,
          downloaded: 0,
          favorited: 0,
          allWatched: false,
          allDownloaded: false,
          episodeCount: 0,
        };
      }
      // Assign how many episodes in each season are favorited, watched or downloaded
      fin[seasonNumber].favorited = fin[seasonNumber].favorited + isFavorited;
      // WATCHED
      fin[seasonNumber].watched = fin[seasonNumber].watched + isWatched;
      fin[seasonNumber].allWatched =
        fin[seasonNumber].watched === seasonEpisodeCounts?.[Number(seasonNumber)];
      // DOWNLOADED
      fin[seasonNumber].downloaded = fin[seasonNumber].downloaded + isDownloaded;
      fin[seasonNumber].allDownloaded =
        fin[seasonNumber].downloaded === seasonEpisodeCounts?.[Number(seasonNumber)];
      // Season Total Episode Count
      fin[seasonNumber].episodeCount = seasonEpisodeCounts?.[Number(seasonNumber)];

      // Aggregate number of episodes for each season marked as allWatched
      // We are going to use this help place the section list in the right place
      // when rendering for the first time.
      let episodes = fin['numEpisodesWatched'] || 0;
      episodes = fin[seasonNumber].allWatched
        ? episodes + seasonEpisodeCounts?.[Number(seasonNumber)]
        : episodes;
      fin['numEpisodesWatched'] = episodes;
      // Store the last season that is marked as allWatched
      fin['lastWatchedSeason'] = fin[seasonNumber].allWatched
        ? Number(seasonNumber)
        : fin['lastWatchedSeason'] || 0;

      return fin;
    },
    {} as SeasonEpisodesState
  );
  console.log(seasonEpisodesState.numEpisodesWatched);
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
  const episodeKey = buildSeasonEpisodeKey(seasonNumber, episodeNumber);
  const watched = savedShows$.showAttributes[showId][episodeKey].watched.peek();

  if (watched === true) {
    savedShows$.showAttributes[showId][episodeKey].watched.delete();
  } else {
    savedShows$.showAttributes[showId][episodeKey].watched.set(!!!watched);
    // if episode is 0 or 1 just return
    if (episodeNumber <= 1) return;
    // Else check to see if previous episode was watched, if so ask if they want previous checked
    let prevWatched = true;
    const prevEpisodeKey = buildSeasonEpisodeKey(seasonNumber, episodeNumber - 1);
    prevWatched = savedShows$.showAttributes[showId][prevEpisodeKey].watched.peek();
    if (prevWatched) return;
    // Loop through previous episodes for season and update watch to true
    confirmAlert(
      'Mark Previous',
      'Set Previous Episodes to Watched',
      () => {
        const prevEpisode = episodeNumber - 1;
        for (let e = prevEpisode; e >= 0; e--) {
          const episodeKey = buildSeasonEpisodeKey(seasonNumber, e);
          savedShows$.showAttributes[showId][episodeKey].watched.set(true);
        }
      },
      () => {} // Do nothing on Cancel
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
  const episodeKey = buildSeasonEpisodeKey(seasonNumber, episodeNumber);
  const downloaded = savedShows$.showAttributes[showId][episodeKey].downloaded.peek();
  if (downloaded === true) {
    savedShows$.showAttributes[showId][episodeKey].downloaded.delete();
  } else {
    savedShows$.showAttributes[showId][episodeKey].downloaded.set(!!!downloaded);
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
  const episodeKey = buildSeasonEpisodeKey(seasonNumber, episodeNumber);
  const favorited = savedShows$.showAttributes[showId][episodeKey].favorited.peek();
  if (favorited === true) {
    savedShows$.showAttributes[showId][episodeKey].favorited.delete();
  } else {
    savedShows$.showAttributes[showId][episodeKey].favorited.set(!!!favorited);
  }
};

//~ -----------------------------------------------
//~ Update All Episodes in Season Utility functions for Watched and Downloaded
//~ -----------------------------------------------
export const setSeasonToWatched = (showId: string, seasonNumber: number, numOfEpisodes: number) => {
  updateAllEpisodesWatched(showId, seasonNumber, numOfEpisodes, 'watched', 'set');
};
export const removeSeasonFromWatched = (
  showId: string,
  seasonNumber: number,
  numOfEpisodes: number
) => {
  updateAllEpisodesWatched(showId, seasonNumber, numOfEpisodes, 'watched', 'remove');
};
export const setSeasonToDownloaded = (
  showId: string,
  seasonNumber: number,
  numOfEpisodes: number
) => {
  updateAllEpisodesWatched(showId, seasonNumber, numOfEpisodes, 'downloaded', 'set');
};
export const removeSeasonFromDownloaded = (
  showId: string,
  seasonNumber: number,
  numOfEpisodes: number
) => {
  updateAllEpisodesWatched(showId, seasonNumber, numOfEpisodes, 'downloaded', 'remove');
};

// Helper functions all call this with hardcoded values for field and action
export const updateAllEpisodesWatched = (
  showId: string,
  seasonNumber: number,
  numOfEpisodes: number,
  field: 'watched' | 'downloaded',
  action: 'set' | 'remove'
) => {
  if (action === 'set') {
    for (let i = 1; i <= numOfEpisodes; i++) {
      const episodeKey = buildSeasonEpisodeKey(seasonNumber, i);
      savedShows$.showAttributes[showId][episodeKey][field].set(true);
    }
  } else {
    for (let i = 1; i <= numOfEpisodes; i++) {
      const episodeKey = buildSeasonEpisodeKey(seasonNumber, i);
      savedShows$.showAttributes[showId][episodeKey][field].delete();
    }
  }
};
