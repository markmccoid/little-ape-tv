import { use$ } from '@legendapp/state/react';
import { tvGetShowDetails, TVSearchResultItem, TVShowDetails } from '@markmccoid/tmdb_api';
import { SavedShow } from '~/store/functions-shows';
import { useQuery } from '@tanstack/react-query';
import { savedShows$ } from '~/store/store-shows';

//~ ------------------------------------------------------
//~ useMovies - FILTERED SAVED Shows
//~ ------------------------------------------------------
export const useShows = () => {
  const savedShowsObj = use$(savedShows$.shows);
  const savedShows = Object.keys(savedShowsObj).map((key) => savedShowsObj[key]);
  return savedShows;
};

//~ ------------------------------------------------------
//~ useMovieDetail - GET DETAILS For a Shows
//~ ------------------------------------------------------
export const useMovieDetails = (showId: number) => {
  // Load show if saved locally from legend state
  const localShow = use$(savedShows$.shows[showId]);

  // This query will immediately return the placeholder data if available (locally saved show)
  // Then pull details from tmdb_api and merge with localShow if available.
  return useQuery<Partial<SavedShow> & Partial<TVShowDetails>, Error>({
    queryKey: ['movidedetails', showId, localShow?.isStoredLocally || false],
    queryFn: async () => {
      const showDetails = await tvGetShowDetails(showId);
      // merge with placeholder data. This type must match the placehodlerData type
      const data = showDetails.data;

      return { ...data, ...localShow };
    },
    // if locally saved show
    placeholderData: localShow,
  });
};
