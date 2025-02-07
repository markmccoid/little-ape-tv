import { savedShows$ } from '~/store/store-shows';
//~ -----------------------------------------------
//~ Show Function Start

import { Observable } from '@legendapp/state';
import { TVSearchResultItem } from '@markmccoid/tmdb_api';
import { queryClient } from '~/app/_layout';
import { search$ } from './store-search';
// import { savedShows$ } from './store-shows';
import { InfiniteData } from '@tanstack/react-query';
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
  isStoredLocally: boolean;
};

type AddShowParms = Omit<SavedShow, 'userRating' | 'useTags' | 'isStoredLocally'>;
type ShowId = string;
export type SavedShows = Record<ShowId, SavedShow>;

//~ -----------------------------------------------
//~ Show Function Start
//~ -----------------------------------------------
export type ShowFunctions = {
  addShow: (newShow: AddShowParms) => void;
  removeShow: (showId: string) => void;
  tagShows: (
    showResults: TVSearchResultItem[]
  ) => (TVSearchResultItem & { isStoredLocally: boolean })[];
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
      //Retag items in search
      reTagSearch(savedShows$);
    },
    removeShow: (showId) => {
      savedShows$.shows[showId].delete();
      //Retag items in search
      reTagSearch(savedShows$);
    },
    reset: () => {
      savedShows$.shows.set({});
      //-- Store to MMKV
    },
    tagShows: (showResults) => {
      const savedShows = savedShows$.shows.peek();
      const showIds = new Set(Object.keys(savedShows));
      return showResults.map((show) => ({
        ...show,
        isStoredLocally: showIds.has(show.id.toString()),
      }));
    },
  };
};

function reTagSearch(
  savedShows$: Observable<
    {
      shows: SavedShows;
    } & ShowFunctions
  >
) {
  queryClient.setQueryData(
    ['searchByTitle', search$.searchVal.peek() || 'discover'],
    (
      oldData:
        | InfiniteData<
            {
              page: number;
              totalResults: number;
              totalPages: number;
              results: TVSearchResultItem[];
            },
            unknown
          >
        | undefined
    ) => {
      if (!oldData) return oldData; // Handle initial state or missing data

      const savedShows = savedShows$.shows.peek();
      const showIds = new Set(Object.keys(savedShows));

      const updatedPages = oldData.pages.map((page) => {
        const updatedResults = page.results.map((result) => {
          // console.log('SHOWID HAS', showIds.has(result.id.toString()));
          return { ...result, isStoredLocally: showIds.has(result.id.toString()) };
        });

        return {
          ...page,
          results: updatedResults,
        };
      });

      return {
        ...oldData,
        pages: updatedPages,
      };
    }
  );
}
