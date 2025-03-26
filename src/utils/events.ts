import { QueryClient } from '@tanstack/react-query';
import { eventDispatcher, EventName } from './EventDispatcher';
import { fetchSeasonsData, useShowSeasonData } from '~/data/query.shows';
import { savedShows$ } from '~/store/store-shows';

//!! -------------------------------------------------------
//!! setUpEvents
//!! This is called in root _layout.tsx
//!! -------------------------------------------------------
export const setupEvents = (queryClient: QueryClient) => {
  //- Update AvgEpisode Runtime based on season episode data

  //# UpdateAvgEpisodeRuntime -> Is called from functions-shows.ts addShow
  //# and useSeasonSummary in functions-showAttributes.ts
  //#  updates the average runtime on the saved show object
  eventDispatcher.on(EventName.UpdateAvgEpisodeRuntime, async (showId, seasonsArray) => {
    const seasonData = await fetchSeasonsData(parseInt(showId), seasonsArray);
    savedShows$.shows[showId].avgEpisodeRunTime.set(Math.trunc(seasonData[0].episodeAvgRunTime));
    // console.log('emitted');
  });
};
