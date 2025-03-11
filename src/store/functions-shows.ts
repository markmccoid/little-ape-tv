import { genres$ } from '~/store/store-genres';
//~ -----------------------------------------------
//~ Show Function Start

import { Observable } from '@legendapp/state';
import {
  tvGetShowDetails,
  TVSearchResultItem,
  TVShowDetails,
  TVShowDetailsBase,
} from '@markmccoid/tmdb_api';
import { queryClient } from '~/app/_layout';
import { search$ } from './store-search';
// import { savedShows$ } from './store-shows';
import { InfiniteData } from '@tanstack/react-query';
import { formatEpoch } from '~/utils/utils';
import { SavedShowObservable } from './store-shows';

//~ -----------------------------------------------
export type SavedShow = {
  tmdbId: string;
  imdbId?: string;
  tvdbId?: number;
  name: string;
  posterURL?: string;
  backdropURL?: string;
  avgEpisodeRunTime?: number;
  firstAirDateEpoch: number;
  imdbEpisodesURL?: string;
  genres?: string[];
  // User specific
  userRating?: number;
  favorite?: number; // Epoch date number
  userTags?: string[];
  dateAddedEpoch: number;
  dateLastUpdatedEpoch: number;
  // Stores the streaming data for a show (allows for search)
  streaming?: {
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
  addShow: (showId: string) => Promise<void>;
  removeShow: (showId: string) => void;
  toggleFavoriteShow: (showId: string, action: 'toggle' | 'off' | 'on') => void;
  updateShowTags: (showId: string, tagId: string, action: 'add' | 'remove') => void;
  updateShowUserRating: (showId: string, newRating: number) => void;
  tagShows: (
    showResults: TVSearchResultItem[]
  ) => (TVSearchResultItem & { isStoredLocally: boolean })[];
  reset: () => void;
};

export const createShowFunctions = (
  savedShows$: Observable<SavedShowObservable>
): ShowFunctions => {
  return {
    addShow: async (showId) => {
      //! Need to deal with undefined posterURL and backdropURL
      const data = await getShowDetails(parseInt(showId));
      savedShows$.shows[showId].set({
        isStoredLocally: true,
        tmdbId: data.id.toString(),
        imdbId: data.imdbId,
        tvdbId: data.tvdbId,
        name: data.name,
        posterURL: data.posterURL,
        backdropURL: data.backdropURL,
        avgEpisodeRunTime: data.avgEpisodeRunTime,
        imdbEpisodesURL: data.imdbEpisodesURL,
        firstAirDateEpoch: data.firstAirDate.epoch,
        genres: data.genres,
        // User specific
        userRating: 0,
        dateAddedEpoch: formatEpoch(Date.now()),
        dateLastUpdatedEpoch: formatEpoch(Date.now()),
        // Stores the streaming data for a show (allows for search)
        // streaming?: {
        //   dateAddedEpoch: formatEpoch(Date.now()),
        //   providers: []
        // };
      });
      // console.log('Show Added', showId, data.name);

      //Retag items in search
      reTagSearch(savedShows$);
      // Add genres from this new show to our master list of genres
      genres$.genreList.set(
        Array.from(new Set([...(data?.genres || []), ...genres$.genreList.peek()]))
      );
    },
    removeShow: (showId) => {
      savedShows$.shows[showId].delete();
      savedShows$.showAttributes[showId].delete();
      console.log('Remove Attr', savedShows$.showAttributes[showId].peek());
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
    updateShowUserRating: (showId, newRating) => {
      savedShows$.shows[showId].userRating.set(newRating);
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

//~ ------------------------------------------------------
//~ getShowDetail - GET DETAILS For a Show, used in Add A Show
//~ ------------------------------------------------------
export const getShowDetails = async (showId: number) => {
  // Expectation is this will always return NULL as we use this
  // in adding function so we will assume this data is not already stored
  // and always query and use "false" as last part of query key
  const queryKey = ['movidedetails', showId, false];
  let data: TVShowDetails | undefined = queryClient.getQueryData(queryKey);
  console.log('DATA from getShowDetails', data);
  if (!data) {
    const result = await tvGetShowDetails(showId, ['recommendations']);
    data = result.data;
  }
  return data;
};
