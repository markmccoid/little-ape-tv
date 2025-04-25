import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';
import { savedShows$ } from '~/store/store-shows';
import { tvGetShowDetails } from '@markmccoid/tmdb_api';
import * as Linking from 'expo-linking';

const BACKGROUND_FETCH_TASK = 'check-new-episodes';

// Define the background task
TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  try {
    await checkForNewEpisodes();
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error('Background fetch failed:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

// Register the background task
export async function registerBackgroundFetch() {
  await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
    minimumInterval: 360 * 60, // 6 hours in seconds
    stopOnTerminate: false, // Continue running after app is closed (iOS)
    startOnBoot: true, // Restart task on device reboot (Android)
  });
}

//!! Need to implement a last checked date on the show object.
//!! Don't need to check a show more than once a day.

async function checkForNewEpisodes() {
  // Returns shows that have not yet ended and are marked to be tracked
  const watchedShows = getWatchedShows();
  const currentDate = Date.now();

  for (const show of watchedShows) {
    // Get stored next air date from AsyncStorage
    const nextAirDate = show.nextAirDateEpoch || 0;

    // Skip API call if next episode hasn't aired yet
    if (nextAirDate > currentDate) {
      continue;
    }

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

      // Check if there's a new episode and notify (example logic)
      if (lastEpisodeToAir /* your condition for new episode */) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: `New Episode: ${show.name}`,
            body: `S${lastEpisodeToAir.seasonNumber}E${lastEpisodeToAir.episodeNumber} is now available!\n
            ${Linking.createURL(`/${show.tmdbId}`)}`,
          },
          trigger: null, // Send immediately
        });
      }
    } catch (error) {
      console.error(`Error checking show ${show.tmdbId}:`, error);
    }
  }
}

export function getWatchedShows() {
  const shows = savedShows$.shows.peek();
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

    showsToCheck.push(show);
  }
  // console.log(
  //   'showsToCheck',
  //   showsToCheck.map((el) => el.name)
  // );
  return showsToCheck;
}
