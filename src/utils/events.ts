import { ShowAttributes, updateSeasonSummary } from './../store/functions-showAttributes';
import { QueryClient } from '@tanstack/react-query';
import { eventDispatcher, EventName } from './EventDispatcher';
import { fetchSeasonsData, getWatchProviders, useShowSeasonData } from '~/data/query.shows';
import { savedShows$ } from '~/store/store-shows';

//!! -------------------------------------------------------
//!! setUpEvents
//!! This is called in root _layout.tsx
//!! -------------------------------------------------------
export const setupEvents = (queryClient: QueryClient) => {
  //- Update AvgEpisode Runtime based on season episode data
  //# --------------------------------------
  //# UpdateAvgEpisodeRuntime -> Is called from functions-shows.ts addShow
  //# and useSeasonSummary in functions-showAttributes.ts
  //#  updates the average runtime on the saved show object
  //# --------------------------------------
  eventDispatcher.on(EventName.UpdateAvgEpisodeRuntime, async (showId, seasonsArray) => {
    const seasonData = await fetchSeasonsData(parseInt(showId), seasonsArray);
    // Get a list of ALL of the runtimes for the episodes in the seasons
    // and calculate the trimmed mean.  Lop off 10% of the top and bottom
    // runtimes to get a more accurate average.
    const runTimes = seasonData
      .reduce((acc, season) => {
        season.episodes.forEach((episode) => acc.push(episode.runTime));
        return acc;
      }, [] as number[])
      .filter((el) => el);
    const avgRunTime = trimmedMean(runTimes, 0.1);
    savedShows$.shows[showId].avgEpisodeRunTime.set(avgRunTime);
    // savedShows$.shows[showId].avgEpisodeRunTime.set(Math.trunc(seasonData[0].episodeAvgRunTime));
    // console.log('emitted runtime', Math.trunc(seasonData[0].episodeAvgRunTime));
  });

  //# --------------------------------------
  //# UpdateSavedShowDetail -> Is called from when we view a show.
  //# makes ure the show details are up to date.
  //# --------------------------------------
  eventDispatcher.on(EventName.UpdateSavedShowDetail, async (showId, showDetails) => {
    savedShows$.updateSavedShowDetail(showId, showDetails);
    const showRunTime = savedShows$.shows[showId].avgEpisodeRunTime.peek();
    if (!showRunTime || isNaN(showRunTime)) {
      eventDispatcher.emit(
        EventName.UpdateAvgEpisodeRuntime,
        showId,
        showDetails.seasons.map((season) => season.seasonNumber)
      );
    }
  });
  //# --------------------------------------
  //# UpdateSavedShowDetail -> Is called from when we view a show.
  //# makes ure the show details are up to date.
  //# --------------------------------------
  eventDispatcher.on(EventName.UpdateSeasonSummary, async (showId, seasonsArray) => {
    const seasonData = await fetchSeasonsData(parseInt(showId), seasonsArray);
    updateSeasonSummary(showId, seasonData);
  });

  //# --------------------------------------
  //# UpdateSavedShowDetail -> Is called from when we view a show.
  //# makes ure the show details are up to date.
  //# --------------------------------------
  eventDispatcher.on(EventName.UpdateWatchProviders, async (showId) => {
    // The getWatchProviders function will update the streaming entry for the
    // show in savedShows$ as well as update the settings$.savedStreaminProviders
    // Just need to call it here
    await getWatchProviders(showId);
  });

  //-- Add more events here and they will be loaded when app starts from root _layout.tsx
};

//# --------------------------------------
//# Trimmed Mean helper function
//# --------------------------------------
export const trimmedMean = (arr: number[], trimPercent: number) => {
  // Return 0 for invalid inputs
  if (!arr || arr.length === 0 || trimPercent < 0 || trimPercent >= 0.5) return 0;

  // Filter out undefined and non-numeric values
  const validArr = arr.filter((val) => val !== undefined && !isNaN(val) && val !== 0);

  // Return 0 if no valid numbers remain
  if (validArr.length === 0) return 0;

  // Sort the array
  const sortedArr = validArr.sort((a, b) => a - b);

  // Calculate trim count, ensuring at least one element remains
  const trimCount = Math.floor(sortedArr.length * trimPercent);
  if (trimCount * 2 >= sortedArr.length) return sortedArr[Math.floor(sortedArr.length / 2)];

  // Slice the array and calculate mean
  const trimmedArr = sortedArr.slice(trimCount, sortedArr.length - trimCount);
  return Math.round(trimmedArr.reduce((acc, val) => acc + val, 0) / trimmedArr.length);
};
