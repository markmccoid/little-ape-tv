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
  posterURL?: string;
  backdropURL?: string;
  avgEpisodeRunTime?: number;
  imdbEpisodesURL?: string;
  userRating?: number;
  userTags?: string[];
  genres?: string[];
  isStoredLocally: true;
};

type AddShowParms = Omit<SavedShow, 'userRating' | 'useTags'>;
type ShowId = string;
export type SavedShows = Record<ShowId, SavedShow>;

//~ -----------------------------------------------
//~ Show Function Start
//~ -----------------------------------------------
export type ShowFunctions = {
  addShow: (newShow: AddShowParms) => void;
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
    addShow: (newShow) => {
      //! Need to deal with undefined posterURL and backdropURL
      savedShows$.shows[newShow.tmdbId].set({ ...newShow, isStoredLocally: true });
      //-- Store to MMKV
    },
    removeShow: (showId) => {
      savedShows$.shows[showId].delete();
      //-- Store to MMKV
    },
    reset: () => {
      savedShows$.shows.set({});
      //-- Store to MMKV
    },
  };
};
