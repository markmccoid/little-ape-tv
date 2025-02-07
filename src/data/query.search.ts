import {
  movieSearchByTitle,
  tvDiscover,
  tvGetPopular,
  tvSearchByTitle,
} from '@markmccoid/tmdb_api';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { search$ } from '~/store/store-search';
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
      if (!searchValue) {
        const discoverResults = await tvDiscover(
          { firstAirDateYear: 2023, withOriginCountry: ['US'] },
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
