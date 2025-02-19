import { use$ } from '@legendapp/state/react';
import { tvGetShowDetails, TVSearchResultItem, TVShowDetails } from '@markmccoid/tmdb_api';
import { SavedShow } from '~/store/functions-shows';
import { useQuery } from '@tanstack/react-query';
import { savedShows$ } from '~/store/store-shows';
import axios from 'axios';

//~ ------------------------------------------------------
//~ useShows - FILTERED SAVED Shows
//~ ------------------------------------------------------
export const useShows = () => {
  const savedShowsObj = use$(savedShows$.shows);
  const savedShows = Object.keys(savedShowsObj).map((key) => savedShowsObj[key]);
  return savedShows;
};

//~ ------------------------------------------------------
//~ useShowDetail - GET DETAILS For a Shows
//~ ------------------------------------------------------
export const useShowDetails = (showId: number) => {
  // Load show if saved locally from legend state
  const localShow = use$(savedShows$.shows[showId]);
  // This query will immediately return the placeholder data if available (locally saved show)
  // Then pull details from tmdb_api and merge with localShow if available.
  const { data, ...rest } = useQuery<Partial<SavedShow> & Partial<TVShowDetails>, Error>({
    queryKey: ['movidedetails', showId, localShow?.isStoredLocally || false],
    queryFn: async () => {
      const showDetails = await tvGetShowDetails(showId);
      // merge with placeholder data. This type must match the placehodlerData type
      const data = showDetails.data;

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
