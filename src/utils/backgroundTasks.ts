import * as BackgroundTask from 'expo-background-task';
import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';
import { savedShows$ } from '~/store/store-shows';
import { tvGetShowDetails } from '@markmccoid/tmdb_api';
import * as Linking from 'expo-linking';
import { addDaysToEpoch, formatEpoch, getEpochwithTime, subtractDaysFromEpoch } from './utils';
import { BackgroundRunLog, settings$ } from '~/store/store-settings';
import dayjs from 'dayjs';
import { getWatchProviders } from '~/data/query.shows';
import { Alert } from 'react-native';

const CHECK_NEW_EPISODES_TASK = 'check-new-episodes';
const UPDATE_WATCH_PROVIDERS = 'update-watch-providers';

// Define the background tasks
TaskManager.defineTask(CHECK_NEW_EPISODES_TASK, async () => {
  try {
    await checkForShowUpdatesAndNotify();
    return BackgroundTask.BackgroundTaskResult.Success; // Changed return type
  } catch (error) {
    console.error('Background task failed:', error);
    return BackgroundTask.BackgroundTaskResult.Failed;
  }
});
TaskManager.defineTask(UPDATE_WATCH_PROVIDERS, async () => {
  try {
    await checkForProviderUpdates();
    return BackgroundTask.BackgroundTaskResult.Success; // Changed return type
  } catch (error) {
    console.error('Background task failed:', error);
    const existingRuns = settings$.backgroundRunLog.peek();
    settings$.backgroundRunLog.set(
      [
        ...(existingRuns || []),
        { dateTimeEpoch: getEpochwithTime(), numShows: -1, type: 'notify-ERROR', detail: error },
      ].slice(-25) as BackgroundRunLog[]
    ); // Just keep the last 25 runs
    return BackgroundTask.BackgroundTaskResult.Failed;
  }
});

// NOTE: Per expo docs the last minimum interval is used for ALL background tasks
export async function registerBackgroundTask() {
  try {
    // Register both tasks with the same minimum interval (6 hours)
    // This is required by Expo's background task system
    await BackgroundTask.registerTaskAsync(CHECK_NEW_EPISODES_TASK, {
      minimumInterval: 60 * 6, // 6 hours in minutes
    });
    await BackgroundTask.registerTaskAsync(UPDATE_WATCH_PROVIDERS, {
      minimumInterval: 60 * 6, // Must match the first task's interval
    });
  } catch (error) {
    console.error('Failed to register background task:', error);
  }
}
//!! Need to implement a last checked date on the show object.
//!! Don't need to check a show more than once a day.

export async function checkForShowUpdatesAndNotify() {
  // Returns shows that have not yet ended and are marked to be tracked
  const eligibleShows = selectEligibleShows();
  const currentDate = getEpochwithTime();
  const NOTIFICATION_INTERVAL = 2;

  for (const show of eligibleShows) {
    try {
      // Default the offset days to 1...we will check everyday until
      // show has eneded or is inactive.  When inactive check every 7 days
      savedShows$.shows[show.tmdbId].nextNotifyOffset.set(1);
      // Fetch show details from TMDB
      const response = await tvGetShowDetails(parseInt(show.tmdbId));
      // const response = await axios.get(
      //   `https://api.themoviedb.org/3/tv/${show.id}?api_key=${TMDB_API_KEY}`
      // );
      const { lastAirDate, nextAirDate, lastEpisodeToAir, nextEpisodeToAir } = response.data;
      // Skip API call if next episode is greater than NOTIFICATION_INTERVAL days in the future
      // OR if there is no nextAirDate
      if (!nextAirDate?.epoch) {
        // NO Next Air Date -> Set check for 7 days in future
        savedShows$.shows[show.tmdbId].nextNotifyOffset.set(7);
        settings$.notificationHistory.set({
          ...settings$.notificationHistory.peek(),
          [show.tmdbId]: {
            Id: show.tmdbId,
            name: show.name,
            season: 0,
            episode: 0,
            dateSent: undefined,
            dateChecked: getEpochwithTime(),
            dateLastNotify: savedShows$.shows[show.tmdbId].dateLastNotifyCheckedEpoch.peek(),
            text: 'INACTIVE CHECKING IN 7 DAYS',
            // FOR TESTING
            otherInfo: `Status: ${show.showStatus}`,
          },
        });
        // Check if the next air date is past the current date + the interval
      } else if (nextAirDate.epoch > addDaysToEpoch(currentDate, NOTIFICATION_INTERVAL)) {
        // set the offset date to be on the day of the show
        const daysUntilNextAir = dayjs.unix(nextAirDate.epoch).diff(dayjs.unix(currentDate), 'day');
        savedShows$.shows[show.tmdbId].nextNotifyOffset.set(daysUntilNextAir);
        // Store in the notification history
        settings$.notificationHistory.set({
          ...settings$.notificationHistory.peek(),
          [show.tmdbId]: {
            Id: show.tmdbId,
            name: show.name,
            season: 0,
            episode: 0,
            dateSent: undefined,
            dateChecked: getEpochwithTime(),
            text: 'NOT IN NOTIFICATION_INTERVAL',
            // FOR TESTING
            otherInfo: `Next Air Date-${nextAirDate.formatted}`,
          },
        });

        continue;
      }

      // Store the new next air date
      savedShows$.shows[show.tmdbId].nextAirDateEpoch.set(nextAirDate?.epoch || undefined);

      // Check if there's a new episode and notify (example logic)
      if (nextEpisodeToAir) {
        // FIRST check to see if we have sent a notification about this S-E and if so skip
        const seasonEpisode = `S${nextEpisodeToAir.seasonNumber}E${nextEpisodeToAir.episodeNumber}`;

        if (savedShows$.shows[show.tmdbId].lastNotifySeasonEpisode.peek() === seasonEpisode) {
          continue;
        }
        const url = Linking.createURL(`/${show.tmdbId}`);
        const body = `${nextAirDate.formatted} - ${seasonEpisode}`;
        //~ Get the notification time from settings
        const { hour, minute } = settings$.notificationTime.peek();
        // Create a dayjs object for today at the desired time
        let notifyDate = dayjs().hour(hour).minute(minute).second(0).millisecond(0);
        // If that time has already passed, move to the next day
        if (notifyDate.isBefore(dayjs())) {
          notifyDate = notifyDate.add(1, 'day');
        }
        // convert to JS Date object:
        const notifyDateJS = notifyDate.toDate();

        // Schedule notification
        await Notifications.scheduleNotificationAsync({
          content: {
            title: `New Episode: ${show.name}`,
            body,
            data: { url },
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: notifyDateJS,
          },
        });
        // Update the last notify date to when we sent the notification
        savedShows$.shows[show.tmdbId].dateLastNotifiedEpoch.set(formatEpoch(notifyDate.unix()));
        savedShows$.shows[show.tmdbId].lastNotifySeasonEpisode.set(seasonEpisode);
        // Store in the notification history
        settings$.notificationHistory.set({
          ...settings$.notificationHistory.peek(),
          [show.tmdbId]: {
            Id: show.tmdbId,
            name: show.name,
            season: nextEpisodeToAir.seasonNumber,
            episode: nextEpisodeToAir.episodeNumber,
            dateSent: dayjs(notifyDateJS).unix(),
            dateChecked: getEpochwithTime(),
            dateLastNotify: savedShows$.shows[show.tmdbId].dateLastNotifyCheckedEpoch.peek(),
            text: body,
            // FOR TESTING
            otherInfo: `LAST-${lastAirDate.formatted} | NEXT-${nextAirDate.formatted} | LAST S-${lastEpisodeToAir.seasonNumber} E-${lastEpisodeToAir.episodeNumber}`,
          },
        });
      }
    } catch (error) {
      console.error(`Error checking show ${show.tmdbId}:`, error);
    }
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
    Returning Series, Planned, In Production, Ended, Canceled, Pilot
   */
  const showsToCheck = [];
  for (const [key, show] of Object.entries(shows)) {
    const showOver =
      !show?.showStatus ||
      show?.showStatus?.toLowerCase() === 'ended' ||
      show?.showStatus?.toLowerCase() === 'canceled';
    // console.log('show', show.name, show.showStatus, showOver);
    // Skip shows that are not tracked or if they have ended
    //! Implement after you figure out how to update all existing shows
    // if (!show.trackAndNotify || showOver) {
    if (showOver) {
      continue;
    }

    // If nextNotifyEpoch is not set, set it to currentEpoch
    // it is null, then it will be added to showsToCheck
    const nextNotifyOffset =
      !show?.nextNotifyOffset || show.nextNotifyOffset <= 0 ? 1 : show.nextNotifyOffset;
    // if null subtract one day so that show will be added to showsToCheck
    const lastNotifyCheckEpoch = !show?.dateLastNotifyCheckedEpoch
      ? Math.floor(currentEpoch - 86400) // minus one day
      : show.dateLastNotifyCheckedEpoch + nextNotifyOffset * 86400; //Offset by value stored on show

    // if lastNotifyCheckEpoch is less than currentEpoch then add to showsToCheck
    if (lastNotifyCheckEpoch <= currentEpoch) {
      showsToCheck.push(show);
      // UPDATE the dateLastNotifyCheckedEpoch with current date
      savedShows$.shows[show.tmdbId].dateLastNotifyCheckedEpoch.set(currentEpoch);
    }
  }
  // console.log(
  //   'showsToCheck',
  //   showsToCheck.map((el) => el.name)
  // );
  const existingRuns = settings$.backgroundRunLog.peek();

  settings$.backgroundRunLog.set(
    [
      ...(existingRuns || []),
      { dateTimeEpoch: getEpochwithTime(), numShows: showsToCheck.length, type: 'notify' },
    ].slice(-25) as BackgroundRunLog[]
  ); // Just keep the last 25 runs
  // Sort so we process those with a stored nextAirDate first
  return showsToCheck.sort(
    (a, b) => (a.nextAirDateEpoch || Infinity) - (b.nextAirDateEpoch || Infinity)
  );
  // return showsToCheck;
}

//# ------------------------
export const checkForProviderUpdates = async () => {
  const shows = savedShows$.shows.peek();
  // no time information just date (unix seconds)
  const currentEpoch = formatEpoch(Date.now());

  let showsToCheck = [];
  for (const [key, show] of Object.entries(shows)) {
    const lastUpdateEpoch = show.streaming?.dateUpdatedEpoch;
    if (!lastUpdateEpoch) {
      savedShows$.shows[key].streaming.dateUpdatedEpoch.set(currentEpoch);
      await getWatchProviders(key);
      showsToCheck.push(show);
      continue;
    }
    const daysBetween = (currentEpoch - lastUpdateEpoch) / 86400;

    if (daysBetween >= 10) {
      savedShows$.shows[key].streaming.dateUpdatedEpoch.set(currentEpoch);
      await getWatchProviders(key);
      showsToCheck.push(show);
    }
  }

  const existingRuns = settings$.backgroundRunLog.peek();

  settings$.backgroundRunLog.set(
    [
      ...(existingRuns || []),
      { dateTimeEpoch: getEpochwithTime(), numShows: showsToCheck.length, type: 'provider' },
    ].slice(-25) as BackgroundRunLog[]
  ); // Just keep the last 25 runs
};
//# REMOVE AFTER TEST - Clear stream update dates
export const clearStreamUpdatedEpoch = () => {
  const shows = savedShows$.shows.peek();
  //clear the savedStreamingProviders too
  // settings$.savedStreamingProviders.set([]);
  Object.keys(shows).forEach((key) =>
    savedShows$.shows[key].streaming.set({ dateUpdatedEpoch: undefined, providers: [] })
  );
};

//# REMOVE TASK
export const removeBackgroundTask = async (taskName: string) => {
  try {
    await BackgroundTask.unregisterTaskAsync(taskName);
    Alert.alert(`Removal of Background Task ${taskName} complete`);
  } catch (e) {
    Alert.alert(`Removal of Background Task ${taskName} failed: ${e}`);
  }
};

export const getBGTaskStatus = async () => {
  const status = await BackgroundTask.getStatusAsync();
  // console.log('STT', status);
  Alert.alert(`BG Status is ${status === 1 ? 'Restricted' : 'Available'}`);
};
