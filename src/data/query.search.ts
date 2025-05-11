import { use$ } from '@legendapp/state/react';
import {
  movieSearchByTitle,
  tvDiscover,
  rawTVGetAllGenres,
  tvSearchByTitle,
  getTMDBConsts,
} from '@markmccoid/tmdb_api';
import { getTMDBConfig, getTVGenres } from '@markmccoid/tmdb_api/config';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { first } from 'lodash';
import { search$ } from '~/store/store-search';
import { settings$ } from '~/store/store-settings';
import { savedShows$ } from '~/store/store-shows';

//~ ---------------------------------------------------------
//~ TITLE SEARCH Hook
//~ ---------------------------------------------------------
export const useTitleSearch = (searchValue: string) => {
  const { data, fetchNextPage, hasNextPage, isLoading, error } = useInfiniteQuery({
    queryKey: ['searchByTitle', search$.searchVal.get() || 'discover'],
    queryFn: async ({ pageParam = 1 }) => {
      // If no searchValue passed then discover
      //! Should allow users to specify what they see here and do a search.  Give them inputs for default search.
      const { firstAirDateYear, includeGenres, excludeGenres } = settings$.initialQuery.peek();

      if (!searchValue) {
        const discoverResults = await tvDiscover(
          {
            firstAirDateYear:
              parseInt(firstAirDateYear) || parseInt(dayjs().subtract(5, 'month').format('YYYY')),
            genres: includeGenres || [],
            withoutGenres: excludeGenres || [],
            withOriginCountry: ['US'],
            sortBy: 'popularity.desc',
          },
          pageParam
        );

        return discoverResults.data;
      }
      const showResults = await tvSearchByTitle(search$.searchVal.get(), pageParam); // Pass pageParam to your API call
      return showResults.data; // Return the entire data object from API, not just results.
    },
    enabled: true, //search$.searchVal.get().length > 1,
    initialPageParam: 1,
    staleTime: 0,
    getNextPageParam: (lastPage) => {
      if (lastPage && lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
  });

  const allPages = data?.pages?.map((page) => page.results).flat() || [];
  const taggedShows = savedShows$.tagShows(allPages);

  return { data: taggedShows, fetchNextPage, hasNextPage, isLoading, error };
};

//## ----------------------------------------------------------------
//## useGenres - Get list of all genres on their Ids
//## ----------------------------------------------------------------
export const useAllGenres = () => {
  const TMDBConsts = getTMDBConsts();
  // console.log(TMDBConsts);
  const genres = Object.entries(TMDBConsts.TV_GENRE_OBJ).map(([id, name]) => ({ id, name }));
  return genres || [];
};
