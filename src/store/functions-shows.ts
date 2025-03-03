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
import { savedShows$ } from './store-shows';
import { use$ } from '@legendapp/state/react';

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
        genres: data.genres,
        // User specific
        userRating: 0,
        dateAddedEpoch: formatEpoch(Date.now()),
        // Stores the streaming data for a show (allows for search)
        // streaming?: {
        //   dateAddedEpoch: formatEpoch(Date.now()),
        //   providers: []
        // };
      });
      console.log('Show Added', showId, data.name);

      //Retag items in search
      reTagSearch(savedShows$);
      // Add genres from this new show to our master list of genres
      genres$.genreList.set(
        Array.from(new Set([...(data?.genres || []), ...genres$.genreList.peek()]))
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

// // ====================================================
// // ====================================================
// // savedShowAttributes$ functions
// // ====================================================
// // ====================================================
// export type EpisodeAttributes = {
//   watched?: boolean;
//   downloaded?: boolean;
//   dateWatched?: number;
//   rating?: number;
// };
// type SeasonEpisodeKey = string; // `${seasonNumber}-${episodeNumber}`;
// export type SeasonEpisodeAttributes = Record<SeasonEpisodeKey, EpisodeAttributes>;
// export type SavedShowsAttributes = Record<ShowId, SeasonEpisodeAttributes>;

// /*
// Attributes object will have showId as keys and EpisodeAttributes as values
// {
//   showId: {
//     '1-1': { // SeasonEpisodeKey
//     watched: boolean,
//     downloaded: boolean,
//     dateWatched: number,
//     rating: number
//     },
//     '1-2': {
//     watched: boolean,
//     downloaded: boolean,
//     dateWatched: number,
//     rating: number
//     }
//   },
//   ...
// }

// The SeasonEpisodeKey is a string that is a combination of the season number and episode number.
// */
// export const buildSeasonEpisodeKey = (seasonNumber: number, episodeNumber: number) => {
//   return `${seasonNumber}-${episodeNumber}`;
// };

// //~ GET Watched Episode Count

// interface SeasonEpisodesState {
//   [seasonNumber: string]: { watched: number; downloaded: number };
// }

// export const useWatchedEpisodeCount = (showId: string) => {
//   const tempSeasonEpisodeState = use$(savedShows$.showAttributes[showId]);
//   if (!tempSeasonEpisodeState) return;
//   const seasonEpisodesState = Object.keys(tempSeasonEpisodeState).reduce(
//     (fin: SeasonEpisodesState, epStateKey: string) => {
//       const seasonNumber = epStateKey.slice(0, epStateKey.indexOf('-'));
//       const isWatched = tempSeasonEpisodeState[epStateKey].watched ? 1 : 0;
//       const isDownloaded = tempSeasonEpisodeState[epStateKey].downloaded ? 1 : 0;
//       console.log('Season Number', seasonNumber, tempSeasonEpisodeState[epStateKey].watched);
//       // Initialize fin[seasonNumber] if it doesn't exist
//       if (!fin[seasonNumber]) {
//         fin[seasonNumber] = { watched: 0, downloaded: 0 };
//       }
//       // Assign if episode watched or downloaded
//       fin[seasonNumber].watched = fin[seasonNumber].watched + isWatched;
//       fin[seasonNumber].downloaded = fin[seasonNumber].downloaded + isDownloaded;

//       return fin;
//     },
//     {}
//   );
//   console.log('Season Episodes State', seasonEpisodesState);
//   return seasonEpisodesState;
// };
// export const getEpisodeAttributes = (
//   showId: string,
//   seasonNumber: number,
//   episodeNumber: number
// ) => {
//   const episodeKey = buildSeasonEpisodeKey(seasonNumber, episodeNumber);
//   return savedShows$.showAttributes[showId]?.[episodeKey]?.get();
// };

// //~ Toggle Watched Status
// export const toggleEpisodeWatched = (
//   showId: string,
//   seasonNumber: number,
//   episodeNumber: number
// ) => {
//   const episodeKey = buildSeasonEpisodeKey(seasonNumber, episodeNumber);
//   const watched = savedShows$.showAttributes[showId][episodeKey].watched.peek();
//   if (watched === true) {
//     savedShows$.showAttributes[showId][episodeKey].watched.delete();
//   } else {
//     savedShows$.showAttributes[showId][episodeKey].watched.set(!!!watched);
//   }
// };

// export const updateAllEpisodesWatched = (
//   showId: string,
//   seasonNumber: number,
//   numOfEpisodes: number,
//   action: 'watched' | 'unwatched'
// ) => {
//   if (action === 'watched') {
//     for (let i = 1; i <= numOfEpisodes; i++) {
//       const episodeKey = buildSeasonEpisodeKey(seasonNumber, i);
//       savedShows$.showAttributes[showId][episodeKey].watched.set(true);
//     }
//   } else {
//     for (let i = 1; i <= numOfEpisodes; i++) {
//       const episodeKey = buildSeasonEpisodeKey(seasonNumber, i);
//       savedShows$.showAttributes[showId][episodeKey].watched.delete();
//     }
//   }
// };
