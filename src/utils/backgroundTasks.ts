import { ShowAttributes } from './../store/functions-showAttributes';
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';
import { savedShows$ } from '~/store/store-shows';
import { tvGetShowDetails } from '@markmccoid/tmdb_api';
import * as Linking from 'expo-linking';
import { addDaysToEpoch, formatEpoch, getEpochwithTime } from './utils';
import { expandSummaryNames } from '~/store/functions-showAttributes';
import { SeasonsSummaryVerbose } from '~/store/functions-showAttributes';

const BACKGROUND_FETCH_TASK = 'check-new-episodes';

// Define the background task
TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  try {
    await checkForShowUpdatesAndNotify();
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error('Background fetch failed:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

// Register the background task
export async function registerBackgroundFetch() {
  try {
    await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
      minimumInterval: 60, //1 hour to test then ->  360 * 60, // 6 hours in seconds
      stopOnTerminate: false, // Continue running after app is closed (iOS)
      startOnBoot: true, // Restart task on device reboot (Android)
    });
  } catch (error) {
    console.error('Failed to register background fetch task:', error);
  }
}

//!! Need to implement a last checked date on the show object.
//!! Don't need to check a show more than once a day.

export async function checkForShowUpdatesAndNotify() {
  // Returns shows that have not yet ended and are marked to be tracked
  const eligibleShows = selectEligibleShows();
  const currentDate = getEpochwithTime();
  for (const show of eligibleShows) {
    // Get stored next air date from AsyncStorage
    const nextAirDate = show.nextAirDateEpoch || 0;
    const seasonSummary = expandSummaryNames(
      savedShows$.showAttributes[show.tmdbId].summary.peek()
    );
    //~ ------------------------------------------
    //~  Season Info so that we can figure out if a show
    //~  that is returning is done with episodes for the season.
    //~ ------------------------------------------

    interface SeasonInfo {
      seasonNumber: number;
      totalEpisodes: number;
    }
    const seasonStuff = Object.keys(seasonSummary)
      .filter((key) => {
        const num = parseInt(key);
        return !isNaN(num) && num > 0; // Only include keys that are numeric and greater than 0
      })
      .reduce((acc: SeasonInfo[], key) => {
        acc.push({
          seasonNumber: parseInt(key), // Convert string key to number
          totalEpisodes: seasonSummary[key].totalEpisodes,
        });
        return acc;
      }, [] as SeasonInfo[]);
    // Skip API call if next episode hasn't aired yet
    // if (nextAirDate > currentDate) {
    //   continue;
    // }

    try {
      // Fetch show details from TMDB
      const response = await tvGetShowDetails(parseInt(show.tmdbId));
      // const response = await axios.get(
      //   `https://api.themoviedb.org/3/tv/${show.id}?api_key=${TMDB_API_KEY}`
      // );
      const { lastAirDate, nextAirDate, lastEpisodeToAir, nextEpisodeToAir } = response.data;

      // Store the new next air date
      const newNextAirDate = nextAirDate?.epoch || undefined;
      savedShows$.shows[show.tmdbId].nextAirDateEpoch.set(newNextAirDate);
      console.log('SHOW', show.name, seasonStuff);

      console.log('Last Episode to Air', lastEpisodeToAir?.airDate?.formatted);
      console.log('nextt Episode to Air', nextEpisodeToAir?.airDate?.formatted);
      //! Check if lastEpisodeToAir's season is over and if so
      //! set the nextNotifyEpoch to 10 days from now.
      //! this means we will check to see if there are new episodes every 10 days.
      const currentSeasons = seasonStuff.find(
        (el) => el.seasonNumber === lastEpisodeToAir?.seasonNumber
      );
      if (currentSeasons?.totalEpisodes === lastEpisodeToAir?.episodeNumber) {
        savedShows$.shows[show.tmdbId].dateNextNotifyEpoch.set(addDaysToEpoch(currentDate, 10));
      }

      // Check if there's a new episode and notify (example logic)
      if (nextEpisodeToAir) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: `New Episode: ${show.name}`,
            body: `${nextAirDate.formatted} - S${nextEpisodeToAir.seasonNumber}E${nextEpisodeToAir.episodeNumber} is now available!
${Linking.createURL(`/${show.tmdbId}`)}`,
          },
          trigger: null, // Send immediately
        });
        // Update the next notify date to 3 days from the nextAirDate
        savedShows$.shows[show.tmdbId].dateNextNotifyEpoch.set(
          formatEpoch(addDaysToEpoch(nextAirDate?.epoch, 3))
        );
      }
    } catch (error) {
      console.error(`Error checking show ${show.tmdbId}:`, error);
    }
    console.log(
      'show',
      show.name,
      'nextAirDate',
      nextAirDate,
      savedShows$.shows[show.tmdbId].dateNextNotifyEpoch.peek()
    );
  }
}

//~ ------------------------------------------
//~ Filters saved shows to identify those that are still active and have not received a recent notification,
//~ making them eligible for update checks and potential notifications.
//~ ------------------------------------------
export function selectEligibleShows() {
  const shows = savedShows$.shows.peek();
  // no time information just date (unix seconds)
  const currentEpoch = formatEpoch(Date.now());

  /*
   SHOW Status options from tdmb api
    Returning Series
    Planned
    In Production
    Ended
    Canceled
    Pilot ?
   */
  const showsToCheck = [];
  for (const [key, show] of Object.entries(shows)) {
    const showOver = show.showStatus === 'Ended' || show.showStatus === 'Canceled';
    // console.log('show', show.name, show.showStatus, showOver);
    // Skip shows that are not tracked or if they have ended
    //! Implement after you figure out how to update all existing shows
    // if (!show.trackAndNotify || showOver) {
    if (showOver) {
      continue;
    }

    // If nextNotifyEpoch is not set, set it to currentEpoch
    // it is null, then it will be added to showsToCheck
    const nextNotifyEpoch = !show?.dateNextNotifyEpoch ? currentEpoch : show.dateNextNotifyEpoch;

    console.log('nextepoch', nextNotifyEpoch, currentEpoch);
    // if currentEpoch is greater than nextNotifyEpoch, then add to showsToCheck
    if (nextNotifyEpoch <= currentEpoch || !nextNotifyEpoch) {
      showsToCheck.push(show);
      // savedShows$.shows[key].dateLastNotifiedEpoch.set(addDaysToEpoch(nextNotifyEpoch, 5));
    }
  }
  console.log(
    'showsToCheck',
    showsToCheck.map((el) => el.name)
  );
  return showsToCheck;
}
