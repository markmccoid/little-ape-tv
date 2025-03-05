//~ -----------------------------------------------
//~ ShowAttributes Function Start

import { TVShowSeasonDetails } from '@markmccoid/tmdb_api';
import { savedShows$ } from './store-shows';
import { use$ } from '@legendapp/state/react';

// ====================================================
// ====================================================
// savedShowAttributes$ functions
// ====================================================
// ====================================================
export type EpisodeAttributes = {
  watched?: boolean;
  downloaded?: boolean;
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
    watched: number;
    downloaded: number;
    allWatched: boolean;
    allDownloaded: boolean;
  };
} & { lastWatchedSeason: number };
export type SeasonStateKeys = keyof SeasonEpisodesState;

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
      // console.log('Season Number', seasonNumber, tempSeasonEpisodeState[epStateKey].watched);
      // Initialize fin[seasonNumber] if it doesn't exist
      if (!fin[seasonNumber]) {
        fin[seasonNumber] = { watched: 0, downloaded: 0, allWatched: false, allDownloaded: false };
      }
      // Assign if episode watched or downloaded
      fin[seasonNumber].watched = fin[seasonNumber].watched + isWatched;
      fin[seasonNumber].allWatched =
        fin[seasonNumber].watched === seasonEpisodeCounts?.[Number(seasonNumber)];
      fin[seasonNumber].downloaded = fin[seasonNumber].downloaded + isDownloaded;
      fin[seasonNumber].allDownloaded =
        fin[seasonNumber].downloaded === seasonEpisodeCounts?.[Number(seasonNumber)];
      fin['lastWatchedSeason'] = fin[seasonNumber].allWatched
        ? Number(seasonNumber)
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
  const episodeKey = buildSeasonEpisodeKey(seasonNumber, episodeNumber);
  const watched = savedShows$.showAttributes[showId][episodeKey].watched.peek();
  if (watched === true) {
    savedShows$.showAttributes[showId][episodeKey].watched.delete();
  } else {
    savedShows$.showAttributes[showId][episodeKey].watched.set(!!!watched);
  }
};
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
