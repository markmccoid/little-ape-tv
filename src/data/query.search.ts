import { tvSearchByTitle } from '@markmccoid/tmdb_api';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { search$ } from '~/store/store-search';

export const useTitleSearch = (searchValue: string) => {
  const { data, fetchNextPage, hasNextPage, isLoading, error } = useInfiniteQuery({
    queryKey: ['searchByTitle', search$.searchVal.get()],
    queryFn: async ({ pageParam = 1 }) => {
      const showResults = await tvSearchByTitle(search$.searchVal.get(), pageParam); // Pass pageParam to your API call
      return showResults.data; // Return the entire data object from API, not just results.
    },
    enabled: search$.searchVal.get().length > 1,
    initialPageParam: 1,
    staleTime: 1000,
    getNextPageParam: (lastPage) => {
      if (lastPage && lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
  });

  const allPages = data?.pages?.map((page) => page.results).flat() || [];
  console.log(
    'allPages',
    allPages?.map((show) => show.name)
  );
  return { data: allPages, fetchNextPage, hasNextPage, isLoading, error };
};
