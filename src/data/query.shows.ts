import { use$ } from '@legendapp/state/react';
import {
  tvGetImages,
  tvGetShowCredits,
  tvGetShowDetails,
  tvGetShowEpisodeExternalIds,
  tvGetShowSeasonDetails,
  tvGetWatchProviders,
  TVShowDetails,
  TVShowSeasonDetails,
} from '@markmccoid/tmdb_api';
import { SavedShow } from '~/store/functions-shows';
import { useQuery } from '@tanstack/react-query';
import { savedShows$ } from '~/store/store-shows';
import axios from 'axios';
import { filterCriteria$, SortField } from '~/store/store-filterCriteria';
import { orderBy, sortBy } from 'lodash';
import { queryClient } from '~/utils/queryClient';

//~ ------------------------------------------------------
//~ useShows - FILTERED SAVED Shows
//~ ------------------------------------------------------
export const useShows = () => {
  const savedShowsObj = use$(savedShows$.shows);
  const {
    includeGenres = [],
    includeTags = [],
    excludeGenres = [],
    excludeTags = [],
  } = use$(filterCriteria$.baseFilters);
  const filterIsFavorited = use$(filterCriteria$.baseFilters.filterIsFavorited);
  const { showName, ignoreOtherFilters } = use$(filterCriteria$.nameFilter);
  const sortSettings = use$(filterCriteria$.sortSettings);
  const savedShows = Object.values(savedShowsObj); // More performant than Object.keys().map()

  // NO Early return for no filters because we also want a change in the sort to run.
  // This shouldn't be triggered unless a change in the baseFilters, nameFilter or sortSettings
  // const hasNoFilters =
  //   !includeTags.length &&
  //   !excludeTags.length &&
  //   !includeGenres.length &&
  //   !excludeGenres.length &&
  //   filterIsFavorited === 'off' &&
  //   !showName;
  // if (hasNoFilters) return savedShows;

  // Pre-process showName for better performance
  const normalizedShowName = showName?.toLowerCase() || '';

  // Filter predicates
  // These functions will be called within the filter on savedShows
  const matchesName = (show: SavedShow) =>
    !normalizedShowName || show.name.toLowerCase().includes(normalizedShowName);

  const matchesTags = (show: SavedShow) => {
    const userTags = show.userTags || [];
    return (
      includeTags.every((tag) => userTags.includes(tag)) &&
      !excludeTags.some((tag) => userTags.includes(tag))
    );
  };

  const matchesGenres = (show: SavedShow) => {
    const showGenres = show.genres || [];
    return (
      includeGenres.every((genre) => showGenres.includes(genre)) &&
      !excludeGenres.some((genre) => showGenres.includes(genre))
    );
  };

  const matchesFavorite = (show: SavedShow) => {
    const isFavorite = !!show.favorite;
    return filterIsFavorited === 'include'
      ? isFavorite
      : filterIsFavorited === 'exclude'
        ? !isFavorite
        : true;
  };

  const filteredShows = savedShows.filter((show) => {
    // Quick name-only filter when ignoring other filters
    if (ignoreOtherFilters && normalizedShowName) {
      return matchesName(show);
    }
    // Full filter
    return matchesName(show) && matchesTags(show) && matchesGenres(show) && matchesFavorite(show);
  });
  const { sortFields, sortDirections } = getSort(sortSettings);

  return orderBy(filteredShows, sortFields, sortDirections);
};

//~ ------------------------------------------------------
//~ useShowDetail - GET DETAILS For a Shows
//~ ------------------------------------------------------
export type UseShowDetailsReturn = ReturnType<typeof useShowDetails>;
export type ShowDetailsData = UseShowDetailsReturn['data'];

export const useShowDetails = (showId: number) => {
  // Load show if saved locally from legend state
  const localShow = use$(savedShows$.shows[showId]) as SavedShow;
  // This query will immediately return the placeholder data if available (locally saved show)
  // Then pull details from tmdb_api and merge with localShow if available.
  const { data, ...rest } = useQuery<Partial<SavedShow> & Partial<TVShowDetails>, Error>({
    queryKey: ['showdetails', showId, localShow?.isStoredLocally || false],
    queryFn: async () => {
      const showDetails = await tvGetShowDetails(showId, [
        'recommendations',
        'videos',
        'images',
        'credits',
      ]);

      // const showDetails = await tvGetShowDetails(showId, ['recommendations', 'videos', 'images']);
      // merge with placeholder data. This type must match the placehodlerData type
      const data = showDetails.data;
      // console.log('data url', showDetails.apiCall);
      return { ...data };
      // return { ...data, ...localShow };
    },
    // if locally saved show
    placeholderData: localShow,
  });
  // We needed to merge the local data outside of the useQuery function so that
  // changes to local data update immediately.  Otherwise only cache data is returned
  // until useQuery reads from API again
  return { data: { ...data, ...localShow }, ...rest };
};

//*=================================
//*- Get TV Show Season Details from TMDB Api
//*=================================
export const useShowSeasonData = (showId: string, seasonNumbers: number[]) => {
  // console.log('useseasons', showId, seasonNumbers);
  if (!showId || !seasonNumbers) return [];

  return useQuery<TVShowSeasonDetails[], Error>({
    queryKey: ['seasons', showId, seasonNumbers],
    queryFn: async () => await fetchSeasonsData(parseInt(showId), seasonNumbers),
    //   {
    //   // Return details for each season
    //   // console.log('IN FETCH');
    //   const allSeasons = await Promise.all(
    //     seasonNumbers.map(async (season) => {
    //       // Need to pull off just the data piece.
    //       return tvGetShowSeasonDetails(parseInt(showId), season).then((resp) => {
    //         return resp.data;
    //       });
    //     })
    //   );
    //   const sortedSeasons = sortBy(allSeasons, ['seasonNumber']);
    //   if (sortedSeasons[0].seasonNumber === 0) {
    //     const holdSeasonZero = sortedSeasons[0];
    //     sortedSeasons.shift();
    //     sortedSeasons.push(holdSeasonZero);
    //   }
    //   return sortedSeasons;
    // },
  });
};

//# Used in the EventName.UpdateAvgEpisodeRuntime events.ts
export const fetchSeasonsData = async (showId: number, seasonNumbers: number[]) => {
  // Match the query key for useShowSeasonData so we can grab cached data if available
  const queryKey = ['seasons', showId.toString(), seasonNumbers];

  let allSeasons: TVShowSeasonDetails[] | undefined = queryClient.getQueryData(queryKey);
  // No cache data so fetch it.
  if (!allSeasons) {
    allSeasons = await Promise.all(
      seasonNumbers.map(async (season) => {
        // Need to pull off just the data piece.
        return tvGetShowSeasonDetails(showId, season).then((resp) => {
          return resp.data;
        });
      })
    );
  }

  const sortedSeasons = sortBy(allSeasons, ['seasonNumber']);
  if (sortedSeasons[0].seasonNumber === 0) {
    const holdSeasonZero = sortedSeasons[0];
    sortedSeasons.shift();
    sortedSeasons.push(holdSeasonZero);
  }
  // just grab first seasons avg episode runtime and add to saved
  // const avgShowRuntime = Math.trunc(sortedSeasons[0].episodeAvgRunTime);
  // console.log('Show Exists', Object.keys(savedShows$.shows[showId]).length > 0);
  // console.log(sortedSeasons.map((el) => `${el.name}-${Math.trunc(el.episodeAvgRunTime)}`));
  // if (
  //   Object.keys(savedShows$.shows[showId]).length > 0 &&
  //   !savedShows$.shows[showId].avgEpisodeRunTime.peek()
  // ) {
  //   savedShows$.shows[showId].avgEpisodeRunTime.set(avgShowRuntime);
  // }
  return sortedSeasons;
};
//*=================================
//*- Get Episode IMDB URL from TMDB Api
//*=================================
export const getEpisodeIMDBURL = async (
  tvShowId: number,
  seasonNumber: number,
  episodeNumber: number
) => {
  const results = await tvGetShowEpisodeExternalIds(tvShowId, seasonNumber, episodeNumber);
  return results.data;
};

//~ ------------------------------------------------------
//~ useShowCast
//~ ------------------------------------------------------
export const useShowCast = (showId: string | undefined) => {
  if (!showId) return;
  const { data, isLoading, ...rest } = useQuery({
    queryKey: ['showcast', showId],
    queryFn: async () => {
      const resp = await tvGetShowCredits(showId);
      return resp.data.cast;
    },
    staleTime: 600000,
  });

  return { data, isLoading, ...rest };
};

//~ ------------------------------------------------------
//~ useWatchProviders
//~ ------------------------------------------------------
export type ProviderInfo = {
  provider: string;
  logoURL: string;
  providerId: number;
  displayPriority: number;
};
export type WatchProvidersType = {
  justWatchLink: string;
  stream: ProviderInfo[];
  rent: ProviderInfo[];
  buy: ProviderInfo[];
};
export type WatchProviderOnly = {
  type: 'stream' | 'rent' | 'buy' | 'justWatchLink';
  title: string;
  providers: ProviderInfo[] | undefined;
};
export const useWatchProviders = (showId: string, region: string = 'US') => {
  return useQuery({
    queryKey: ['watchProviders', showId],
    queryFn: async () => {
      const tempData = await tvGetWatchProviders(parseInt(showId), [region]);

      const data = tempData.data.results.US;
      const watchProviders: WatchProviderOnly[] = [
        { type: 'stream', title: 'Stream', providers: data?.stream },
        { type: 'rent', title: 'Rent', providers: data?.rent },
        { type: 'buy', title: 'Buy', providers: data?.buy },
      ];
      return { watchProviders, justWatchLink: data?.justWatchLink };
    },
  });
};

//~ ------------------------------------------------------
//~ useOMDBData
//~ ------------------------------------------------------
const OMDB_API_KEY = process.env.EXPO_PUBLIC_OMDB_API_KEY;
type OMDBDataRaw = {
  Title: string;
  Year: string;
  Rated: string;
  Released: string;
  Runtime: string;
  Genre: string; // ex: "Action, Comedy"
  Director: string;
  Writer: string; // ex: "Etan Cohen, Macon Blair"
  Actors: string; // ex: "Josh Brolin, Peter Dinklage, Taylour Paige"
  Plot: string;
  Language: string;
  Country: string;
  Awards: string;
  Poster: string;
  // Source - value
  // "Rotten Tomatoes" - "94%"
  // "Internet Movie Database" = "8.4/10"
  // "Metacritic" - "84/100"
  Ratings: Array<{
    Source: string;
    Value: string;
  }>;
  Metascore: string;
  imdbRating: string; // "5.1"
  imdbVotes: string; // number of votes making up rating
  imdbID: string;
  Type: string; // movie, series, episode
  DVD: string;
  BoxOffice: string; // "$23,278,931"
  Production: string;
  Website: string;
  Response: string;
};

export type OMDBData = {
  rated?: string;
  imdbRating?: string;
  imdbVotes?: string;
  rottenTomatoesScore?: string;
  rottenTomatoesRating?: string;
  omdbPosterURL?: string;
  boxOffice?: string;
  writer?: string;
  director?: string;
  omdbRunTime?: string;
  metascore?: string;
};

//-- Get the OMDB Data
const getOMDBData = async (imdbId: string | undefined): Promise<OMDBData | undefined> => {
  if (!imdbId) return undefined;
  const omdbURL = `https://www.omdbapi.com/?i=${imdbId}&apikey=${OMDB_API_KEY}`;
  try {
    const response = await axios.get(omdbURL);
    const omdbData = response.data as OMDBDataRaw;

    if (omdbData) {
      const rottenValue = omdbData?.Ratings.find((el) => el.Source === 'Rotten Tomatoes')?.Value;
      const metacritic = omdbData?.Ratings.find((el) => el.Source === 'Metacritic')?.Value;
      let rottenRating = undefined;
      if (rottenValue) {
        rottenRating = parseInt(rottenValue?.slice(0, 1)) < 6 ? 'Rotten' : 'Fresh';
      }
      const omdbInfo = {
        rated: omdbData?.Rated,
        imdbRating: omdbData?.imdbRating,
        imdbVotes: omdbData?.imdbVotes,
        rottenTomatoesScore: rottenValue,
        rottenTomatoesRating: rottenRating,
        writer: omdbData?.Writer,
        director: omdbData?.Director,
        omdbPosterURL: omdbData?.Poster,
        boxOffice: omdbData?.BoxOffice,
        omdbRunTime: omdbData?.Runtime,
        metascore: metacritic ? metacritic.slice(0, metacritic.indexOf('/')) : metacritic,
      };
      return omdbInfo;
    }
    return undefined;
  } catch (error) {
    console.error('Error fetching movie data:', error);
    return undefined;
  }
};

// OMDB Hook
export const useOMDBData = (imdbId: string | undefined) => {
  return useQuery<OMDBData | undefined, Error>({
    queryKey: ['omdbdata', imdbId],
    queryFn: async () => await getOMDBData(imdbId),
    enabled: !!imdbId,
  });
};

//- --------------------------------------
// Get active sort in correct order
//- --------------------------------------
const getSort = (sortSettings: SortField[]) => {
  const filteredAndSortedFields = sortSettings
    .filter((field) => field.active) // Filter for active fields
    .sort((a, b) => a.position - b.position); // Sort by index in ascending order

  const sortFields = filteredAndSortedFields.map((field) => field.sortField);
  const sortDirections = filteredAndSortedFields.map((field) => field.sortDirection);

  return {
    sortedFields: filteredAndSortedFields,
    sortFields,
    sortDirections,
  };
};

//~~ --------------------------------------------------------------------------------
//~ Get Show Images
//~~ --------------------------------------------------------------------------------
export const useShowImages = (showId: number | undefined) => {
  // if (!showId) return;
  const { data, isLoading, ...rest } = useQuery({
    queryKey: ['showImages', showId],
    queryFn: async () => {
      const resp = await tvGetImages(showId, 'posters');
      return resp.data;
    },
    staleTime: 600000,
  });

  return { data, isLoading, ...rest };
};
