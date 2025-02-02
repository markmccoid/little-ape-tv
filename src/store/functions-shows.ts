//~ -----------------------------------------------
//~ Show Function Start

import { Observable, whenReady } from '@legendapp/state';
import { authManager } from '~/authentication/AuthProvider';
//~ -----------------------------------------------
export type SavedShow = {
  tmdbId: string;
  imdbId?: string;
  tvdbId?: number;
  name: string;
  posterURL: string;
  backdropURL?: string;
  avgEpisodeRunTime?: number;
  imdbEpisodesURL?: string;
  userRating?: number;
  tags?: string[];
  genres?: string[];
  isStoredLocally: true;
};

type ShowId = string;
export type SavedShows = Record<ShowId, SavedShow>;

//~ -----------------------------------------------
//~ Show Function Start
//~ -----------------------------------------------
export type ShowFunctions = {
  addShow: (showId: string, name: string, posterURL: string) => void;
  removeShow: (showId: string) => void;
  reset: () => void;
};

export const createShowFunctions = (
  savedShows$: Observable<
    {
      shows: SavedShows;
    } & ShowFunctions
  >
): ShowFunctions => {
  return {
    addShow: (showId, name, posterURL) => {
      const newShow: SavedShow = { tmdbId: showId, name, posterURL, isStoredLocally: true };
      savedShows$.shows[showId].set({ ...newShow, tags: ['TestTag', 'T2'] });
      //-- Store to MMKV
      authManager.userStorage?.setItem('savedshows', savedShows$.shows.peek());
    },
    removeShow: (showId) => {
      savedShows$.shows[showId].delete();
      //-- Store to MMKV
      authManager.userStorage?.setItem('savedshows', savedShows$.shows.peek());
    },
    reset: () => {
      savedShows$.shows.set({});
      //-- Store to MMKV
      authManager.userStorage?.setItem('savedshows', {});
    },
  };
};
