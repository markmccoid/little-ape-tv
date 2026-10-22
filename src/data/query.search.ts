import { use$ } from '@legendapp/state/react';
import {
  movieSearchByTitle,
  tvDiscover,
  tvSearchByTitle,
  getTMDBConsts,
  TVSearchResultBase,
  TVSearchResultItem,
} from '@markmccoid/tmdb_api';
import { getTMDBConfig, getTVGenres } from '@markmccoid/tmdb_api/config';
import { InfiniteData, useInfiniteQuery, useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { first } from 'lodash';
import { settings$, WatchProviderAttributes } from '~/store/store-settings';
import { savedShows$ } from '~/store/store-shows';

type TitleSearchPage = TVSearchResultBase['data'];
export type TaggedSearchResult = TVSearchResultItem & { isStoredLocally: boolean };

const emptyResults: TaggedSearchResult[] = [];

// Stable select so a fetch-status update does not clone every card.
function selectTaggedShows(data: InfiniteData<TitleSearchPage>): TaggedSearchResult[] {
  const seen = new Set<number>();
  const shows: TVSearchResultItem[] = [];

  for (const page of data.pages) {
    for (const show of page.results) {
      if (seen.has(show.id)) continue;
      seen.add(show.id);
      shows.push(show);
    }
  }

  return savedShows$.tagShows(shows);
}

//~ ---------------------------------------------------------
//~ TITLE SEARCH Hook
//~ ---------------------------------------------------------
export const useTitleSearch = (searchValue: string) => {
  const term = searchValue || 'discover';
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, error } =
    useInfiniteQuery({
      queryKey: ['searchByTitle', term],
      queryFn: async ({ pageParam, queryKey }) => {
        // Read the term from the key so an in-flight page cannot belong to a newer search.
        const requestedTerm = queryKey[1] as string;
        const { firstAirDateYear, includeGenres, excludeGenres } = settings$.initialQuery.peek();

        if (requestedTerm === 'discover') {
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

        const showResults = await tvSearchByTitle(requestedTerm, pageParam);
        return showResults.data;
      },
      initialPageParam: 1,
      getNextPageParam: (lastPage) => {
        if (lastPage && lastPage.page < lastPage.totalPages) {
          return lastPage.page + 1;
        }
        return undefined;
      },
      select: selectTaggedShows,
    });

  return {
    data: data ?? emptyResults,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  };
};

//## ----------------------------------------------------------------
//## useTMDBConfig
//## ----------------------------------------------------------------
export const useTMDBConfig = () => {
  const TMDBConsts = getTMDBConsts();
  // console.log(TMDBConsts);
  const genres = Object.entries(TMDBConsts.TV_GENRE_OBJ).map(([id, name]) => ({ id, name }));

  return { genres: genres || [], watchProviders: TMDBConsts.WATCH_PROVIDERS };
};

//## ----------------------------------------------------------------
//## useWatchProviderAttribs - List of watchproviders that have ben
//##  stored in settings$.watchProviderAttributes
//## ----------------------------------------------------------------
export const useWatchProviderAttribs = () => {
  //
  const wpAttributes = use$(settings$.watchProviderAttributes) || [];

  return wpAttributes;
  // const tmdbConsts = getTMDBConsts();
  // const allWatchProviders = tmdbConsts.WATCH_PROVIDERS;

  // const mergedWP = allWatchProviders.map((wp) => {
  //   const attribRecord = wpAttributes.find((el) => el.providerId === wp.providerId);
  //   if (attribRecord) {
  //     return {
  //       ...attribRecord,
  //       ...wp, // overwrite info from attrib record that is unique to justWatch data
  //     };
  //   }
  //   return wp;
  // });

  // return mergedWP as WatchProviderAttributes[];
};
//## ----------------------------------------------------------------
//## useWatchProviderAttribs - List of watchproviders that have ben
//##  stored in settings$.watchProviderAttributes
//## ----------------------------------------------------------------
export const useMergedWatchProviders = (
  searchValue: string = '',
  filterState: 'all' | 'enabled' | 'disabled' = 'all'
) => {
  const tmdbConsts = getTMDBConsts();
  const allWatchProviders = tmdbConsts.WATCH_PROVIDERS;
  const wpAttributes = use$(settings$.watchProviderAttributes) || [];

  const mergedWP = allWatchProviders.map((wp) => {
    const attribRecord = wpAttributes.find((el) => el.providerId === wp.providerId);
    if (attribRecord) {
      return {
        ...attribRecord,
        ...wp, // overwrite info from attrib record that is unique to justWatch data
      };
    }
    return { ...wp, isHidden: false, isSearchOnly: true, showsWithProvider: 0 };
  });
  let finalProviders = mergedWP;
  if (searchValue) {
    finalProviders = mergedWP.filter((el) => el.provider.includes(searchValue));
  }
  if (filterState === 'enabled') {
    finalProviders = finalProviders.filter((el) => !el.isSearchOnly);
  }
  if (filterState === 'disabled') {
    finalProviders = finalProviders.filter((el) => el.isSearchOnly);
  }
  return finalProviders as WatchProviderAttributes[];
};
