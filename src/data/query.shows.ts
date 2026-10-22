import { use$ } from '@legendapp/state/react';
import {
  CastTVShows,
  getPersonDetails,
  getPersonDetails_typedef,
  movieGetPersonCredits,
  moviePersonCredits_typedef,
  tvGetImages,
  tvGetPersonCredits,
  tvGetShowCredits,
  tvGetShowDetails,
  tvGetShowEpisodeExternalIds,
  tvGetShowSeasonDetails,
  tvGetWatchProviders,
  TVShowDetails,
  TVShowSeasonDetails,
} from '@markmccoid/tmdb_api';
import { useQuery } from '@tanstack/react-query';
import { isShowSaved, updateShowWatchProviders } from '~/data/actions.savedShows';
import { useSavedShow } from '~/data/query.savedShows';
import type { SavedShowDetail } from '~/db/shows';
import axios from 'axios';
import { orderBy, sortBy } from 'lodash';
import { queryClient } from '~/utils/queryClient';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { settings$ } from '~/store/store-settings';
import { eventDispatcher, EventName } from '~/utils/EventDispatcher';
dayjs.extend(customParseFormat);

//# ------------------------------------------------------
//# useShowDetail - GET DETAILS For a Shows
//# ------------------------------------------------------
export type UseShowDetailsReturn = ReturnType<typeof useShowDetails>;
export type ShowDetailsData = UseShowDetailsReturn['data'];

//~ Fields from the Saved Show merged over the TMDB details.  Names match the TMDB
//~ details (posterURL, tmdbId) so the detail screens can read either.
export type SavedShowOverlay = {
  isStoredLocally: boolean;
  tmdbId: string;
  favorite?: number;
  userRating?: number;
  posterURL?: string;
  avgEpisodeRunTime?: number;
};
const toSavedShowOverlay = (showId: number, show: SavedShowDetail | null): SavedShowOverlay => {
  if (!show) return { isStoredLocally: false, tmdbId: showId.toString() };
  const overlay: SavedShowOverlay = {
    isStoredLocally: true,
    tmdbId: show.id,
    favorite: show.favoritedAt ?? undefined,
    userRating: show.userRating,
    posterURL: show.posterUrl ?? undefined,
    avgEpisodeRunTime: show.avgEpisodeRunTime ?? undefined,
  };
  // Drop empty fields so they don't hide the TMDB values when merged
  return Object.fromEntries(
    Object.entries(overlay).filter(([, value]) => value !== undefined)
  ) as SavedShowOverlay;
};

export const useShowDetails = (showId: number) => {
  const savedShow = useSavedShow(showId.toString());
  const overlay = toSavedShowOverlay(showId, savedShow);
  // Shown until TMDB answers when the show is saved
  const placeholder = savedShow
    ? ({
        ...overlay,
        name: savedShow.name,
        backdropURL: savedShow.backdropUrl ?? undefined,
        genres: savedShow.genres,
      } as Partial<TVShowDetails> & SavedShowOverlay)
    : undefined;

  const { data, ...rest } = useQuery<Partial<TVShowDetails> & Partial<SavedShowOverlay>, Error>({
    queryKey: ['showdetails', showId, overlay.isStoredLocally],
    queryFn: async () => {
      const showDetails = await tvGetShowDetails(showId, [
        'recommendations',
        'videos',
        'images',
        'credits',
      ]);
      const data = showDetails.data;
      // Keep the saved copy of the TMDB fields current
      if (overlay.isStoredLocally) {
        eventDispatcher.emit(EventName.UpdateSavedShowDetail, showId.toString(), data);
      }
      return { ...data };
    },
    placeholderData: placeholder,
  });
  // Merge the saved fields outside the query so local changes show immediately
  return { data: { ...data, ...overlay }, ...rest };
};

//# =================================
//# - Get TV Show Season Details from TMDB Api
//# =================================
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

//# ------------------------------------------------------
//# useShowCast
//# ------------------------------------------------------
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

//# ------------------------------------------------------
//# usePersonDetails
//# ------------------------------------------------------
// --- Combined Type for the Hook's Data ---
export type PersonCredit = {
  tvShows: CastTVShows[];
  movies: moviePersonCredits_typedef['data']['cast'];
  personDetails: getPersonDetails_typedef['data'];
};
export const usePersonDetails = (personId: string | undefined) => {
  // if (!personId) return;
  const { data, isLoading, ...rest } = useQuery<PersonCredit>({
    queryKey: ['personDetails', personId],
    queryFn: async () => {
      const [tvResp, movieResp, personDetailsResp] = await Promise.all([
        tvGetPersonCredits(parseInt(personId)),
        movieGetPersonCredits(parseInt(personId)),
        getPersonDetails(parseInt(personId)),
      ]);
      //~ dedupe TV Shows and remove any Genres that have been selected in settings.
      const seenIds = new Set<number>();
      const tvCast = tvResp.data.cast.filter((credit) => {
        if (
          !seenIds.has(credit.tvShowId) &&
          !credit.genres.some((genre) =>
            settings$.excludeGenresFromPerson.includes(genre.toLowerCase())
          )
        ) {
          seenIds.add(credit.tvShowId);
          return true; // Keep the first occurrence
        }
        return false; // Skip elements that have their id in seenIds
      });

      // console.log('usePersonDetails', movieResp.data.cast[0].posterURL, tvCast.length);

      return {
        tvShows: orderBy(tvCast, ['sortDate'], 'desc'),
        movies: orderBy(movieResp.data.cast, ['sortDate'], 'desc'),
        personDetails: personDetailsResp.data,
      } as PersonCredit;

      // const resp = await tvGetPersonCredits(parseInt(personId));
      // const resp2 = await movieGetPersonCredits(parseInt(personId));
      // return [...resp.data.cast, ...resp2.data.cast];
    },
    staleTime: 600000,
  });

  return { data, isLoading, ...rest };
};

//# ----------------------------------------------------
//# useWatchProviders
//#
//# ----------------------------------------------------
export type ProviderInfo = {
  provider: string;
  logoURL: string;
  providerId: number;
  displayPriority: number;
};
export type WatchProvidersType = {
  justWatchLink: string;
  watchProviders: WatchProviderOnly[];
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
      return await fetchWatchProviders(showId, region);
      // const tempData = await tvGetWatchProviders(parseInt(showId), [region]);

      // const data = tempData.data.results.US;
      // const watchProviders: WatchProviderOnly[] = [
      //   { type: 'stream', title: 'Stream', providers: data?.stream },
      //   { type: 'rent', title: 'Rent', providers: data?.rent },
      //   { type: 'buy', title: 'Buy', providers: data?.buy },
      // ];
      // return { watchProviders, justWatchLink: data?.justWatchLink };
    },
  });
};
//~ Function to call tmdb api and get watch providers
const fetchWatchProviders = async (showId: string, region: string = 'US') => {
  const tempData = await tvGetWatchProviders(parseInt(showId), [region]);

  const data = tempData.data.results.US;
  const watchProviders: WatchProviderOnly[] = [
    { type: 'stream', title: 'Stream', providers: data?.stream },
    { type: 'rent', title: 'Rent', providers: data?.rent },
    { type: 'buy', title: 'Buy', providers: data?.buy },
  ];

  // If not storedLocallacy just return info.
  // console.log('local', savedShows$.shows[showId]?.isStoredLocally.peek());
  if (!isShowSaved(showId)) {
    return { watchProviders, justWatchLink: data?.justWatchLink };
  }

  updateShowStreamingProviders(showId, watchProviders);

  // Return data
  return { watchProviders, justWatchLink: data?.justWatchLink };
};

//~ ------------------------------------------------------
//# getWatchProviders
//~ Called from events. first checks react query for data
//~  if none, calls fetchWatchProviders
//~ ------------------------------------------------------
export const getWatchProviders = async (showId: string) => {
  // Match the query key for useShowSeasonData so we can grab cached data if available
  const queryKey = ['watchProviders', showId];

  let watchProviders: WatchProvidersType | undefined = queryClient.getQueryData(queryKey);

  if (!watchProviders) {
    watchProviders = await fetchWatchProviders(showId);
  } else {
    // store watachprovider info
    updateShowStreamingProviders(showId, watchProviders.watchProviders);
  }
  return watchProviders;
};
//~ Function to update streaming providers
const updateShowStreamingProviders = (showId: string, watchProviders: WatchProviderOnly[]) => {
  //-- 1.  Update savedShows$ streaming providers id data whenever we query for watchProvider
  // We will also do this via a scheduled job via events
  // pull the streaming providers and only grab their ids
  const streamingProviders = [
    ...(watchProviders.find((el) => el.type === 'stream')?.providers || []),
  ] as ProviderInfo[];
  const updatedProviders = streamingProviders.map((el) => el.providerId) || [];
  updateShowWatchProviders(showId, updatedProviders);

  //-- 2.  Update settings$ streamingProvidersLookup data. make sure all are located in this array
  //! NO LONGER USING savedStreamingProviders
  // const existingSavedProviders = settings$.savedStreamingProviders.peek() || [];
  // const newProviders = mergeStreamingProviders(existingSavedProviders, [...streamingProviders]);
  // settings$.savedStreamingProviders.set(newProviders || []);
};

//# ------------------------------------------------------

//# ------------------------------------------------------
//# ------------------------------------------------------
/**
 * Merges existing streaming providers with new providers data.
 * If a provider with the same providerId exists, updates its provider name and logoURL.
 * If a provider doesn't exist, adds it to the array.
 *
 * @param existingProviders - The current array of streaming providers
 * @param newProviders - The new providers data to merge
 * @returns The merged array of providers
 */
function mergeStreamingProviders(
  existingProviders: ProviderInfo[],
  newProviders: ProviderInfo[]
): ProviderInfo[] {
  // Create a Map for O(1) lookups using providerId as the key
  const providerMap = new Map<number, ProviderInfo>();

  // Populate the map with existing providers
  for (const provider of existingProviders) {
    providerMap.set(provider.providerId, provider);
  }

  // Process new providers - update existing or add new ones
  for (const newProvider of newProviders) {
    const existing = providerMap.get(newProvider.providerId);

    if (existing) {
      // Update only the provider name and logoURL of existing provider
      existing.provider = newProvider.provider;
      existing.logoURL = newProvider.logoURL;
    } else {
      // Add new provider to the map
      providerMap.set(newProvider.providerId, newProvider);
    }
  }

  // Convert the map values back to an array
  return Array.from(providerMap.values());
}

//# ------------------------------------------------------

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
