import { genres$ } from '~/store/store-genres';
//~ -----------------------------------------------
//~ Show Function Start

import { Observable } from '@legendapp/state';
import { TVSearchResultItem } from '@markmccoid/tmdb_api';
import { queryClient } from '~/app/_layout';
import { search$ } from './store-search';
// import { savedShows$ } from './store-shows';
import { InfiniteData } from '@tanstack/react-query';
import { formatEpoch } from '~/utils/utils';
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
  genres?: string[];
  // User specific
  userRating?: number;
  favorite?: number; // Epoch date number
  userTags?: string[];
  dateAddedEpoch: number;
  // Stores the streaming data for a show (allows for search)
  streaming: {
    dateAddedEpoch: number;
    providers: number[];
  };
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
  toggleFavoriteShow: (showId: string, action: 'toggle' | 'off' | 'on') => void;
  updateShowTags: (showId: string, tagId: string, action: 'add' | 'remove') => void;
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
      savedShows$.shows[newShow.tmdbId].set({
        ...newShow,
        isStoredLocally: true,
        dateAddedEpoch: formatEpoch(Date.now()),
      });
      //Retag items in search
      reTagSearch(savedShows$);
      // Add new item to genres list
      genres$.genreList.set(
        Array.from(new Set([...(newShow?.genres || []), ...genres$.genreList.peek()]))
      );
    },
    removeShow: (showId) => {
      savedShows$.shows[showId].delete();
      //Retag items in search
      reTagSearch(savedShows$);
      // Need to resync list of genres in genres$.  Can't just filter out, must recalc
      const savedShowsObj = savedShows$.shows.peek();

      genres$.genreList.set(
        Array.from(
          new Set(
            Object.keys(savedShowsObj)
              .map((key) => savedShowsObj[key]?.genres)
              .flatMap((el) => el)
              .filter((el): el is string => typeof el === 'string')
          )
        )
      );
    },
    toggleFavoriteShow: (showId, action) => {
      action = action ?? 'toggle';
      const favoriteState = savedShows$.shows[showId]?.favorite.peek();
      if (action === 'toggle') {
        const newState = favoriteState ? undefined : formatEpoch(Date.now());
        savedShows$.shows[showId].favorite.set(newState);
      } else {
        savedShows$.shows[showId].favorite.set(
          action === 'off' ? undefined : formatEpoch(Date.now())
        );
      }
    },
    updateShowTags: (showId, tagId, action) => {
      savedShows$.shows[showId].userTags.set((prev) => {
        let newTagArray: string[] = [];
        if (action === 'add') {
          newTagArray = Array.from(new Set([...(prev || []), tagId]));
        } else if (action === 'remove') {
          newTagArray = prev?.filter((el) => el !== tagId) || [];
        }
        return newTagArray;
      });
    },
    tagShows: (showResults) => {
      const savedShows = savedShows$.shows.peek();
      const showIds = new Set(Object.keys(savedShows));
      return showResults.map((show) => ({
        ...show,
        isStoredLocally: showIds.has(show.id.toString()),
      }));
    },
    reset: () => {
      savedShows$.shows.set({});
      //-- Store to MMKV
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
