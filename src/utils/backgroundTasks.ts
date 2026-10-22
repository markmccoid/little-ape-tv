import * as BackgroundTask from 'expo-background-task';
import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';
import { tvGetShowDetails } from '@markmccoid/tmdb_api';
import * as Linking from 'expo-linking';
import { addDaysToEpoch, formatEpoch, getEpochwithTime } from './utils';
import { BackgroundRunLog, settings$ } from '~/store/store-settings';
import dayjs from 'dayjs';
import { getWatchProviders } from '~/data/query.shows';
import { Alert } from 'react-native';
import { dbKeys } from '~/data/dbKeys';
import { databaseReady, getDb } from '~/db/client';
import {
  clearWatchProviders,
  markProvidersChecked,
  selectShowsDueForNotifyCheck,
  selectShowsDueForProviderCheck,
  updateNotifyFields,
  upsertNotificationHistory,
} from '~/db/notifications';
import { queryClient } from './queryClient';

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
    logBackgroundRun({ numShows: -1, type: 'notify-ERROR', detail: String(error) });
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
//~ ------------------------------------------
//~ Check the Saved Shows that are due (see isDueForNotifyCheck) and schedule a
//~ notification for a new episode airing within NOTIFICATION_INTERVAL days.
//~ Runs in the background: writes SQLite directly; the app refreshes its show
//~ queries when it returns to the foreground.
//~ ------------------------------------------
export async function checkForShowUpdatesAndNotify() {
  await databaseReady();
  const db = getDb();
  const currentDate = getEpochwithTime();
  // no time information just date (unix seconds)
  const today = formatEpoch(Date.now());
  const NOTIFICATION_INTERVAL = 2;

  const eligibleShows = selectShowsDueForNotifyCheck(db, today);
  for (const show of eligibleShows) {
    updateNotifyFields(db, show.id, { dateLastNotifyChecked: today });
  }
  logBackgroundRun({ numShows: eligibleShows.length, type: 'notify' });

  for (const show of eligibleShows) {
    try {
      // Default the offset days to 1...we will check everyday until
      // show has eneded or is inactive.  When inactive check every 7 days
      updateNotifyFields(db, show.id, { nextNotifyOffset: 1 });
      const response = await tvGetShowDetails(parseInt(show.id));
      const { lastAirDate, nextAirDate, lastEpisodeToAir, nextEpisodeToAir } = response.data;

      if (!nextAirDate?.epoch) {
        // NO Next Air Date -> Set check for 7 days in future
        updateNotifyFields(db, show.id, { nextNotifyOffset: 7 });
        upsertNotificationHistory(db, {
          showId: show.id,
          season: 0,
          episode: 0,
          dateChecked: getEpochwithTime(),
          dateLastNotify: today,
          text: 'INACTIVE CHECKING IN 7 DAYS',
          // FOR TESTING
          otherInfo: `Status: ${show.showStatus}`,
        });
        // Check if the next air date is past the current date + the interval
      } else if (nextAirDate.epoch > addDaysToEpoch(currentDate, NOTIFICATION_INTERVAL)) {
        // set the offset date to be on the day of the show
        const daysUntilNextAir = dayjs.unix(nextAirDate.epoch).diff(dayjs.unix(currentDate), 'day');
        updateNotifyFields(db, show.id, { nextNotifyOffset: daysUntilNextAir });
        upsertNotificationHistory(db, {
          showId: show.id,
          season: 0,
          episode: 0,
          dateChecked: getEpochwithTime(),
          text: 'NOT IN NOTIFICATION_INTERVAL',
          // FOR TESTING
          otherInfo: `Next Air Date-${nextAirDate.formatted}`,
        });
        continue;
      }

      // Store the new next air date
      updateNotifyFields(db, show.id, { nextAirDate: nextAirDate?.epoch || null });

      if (nextEpisodeToAir) {
        // Skip if we already sent a notification about this S-E
        const seasonEpisode = `S${nextEpisodeToAir.seasonNumber}E${nextEpisodeToAir.episodeNumber}`;
        if (show.lastNotifySeasonEpisode === seasonEpisode) continue;

        const url = Linking.createURL(`/${show.id}`);
        const body = `${nextAirDate.formatted} - ${seasonEpisode}`;
        //~ Get the notification time from settings
        const { hour, minute } = settings$.notificationTime.peek();
        // Today at the desired time, or tomorrow if that time has passed
        let notifyDate = dayjs().hour(hour).minute(minute).second(0).millisecond(0);
        if (notifyDate.isBefore(dayjs())) {
          notifyDate = notifyDate.add(1, 'day');
        }
        const notifyDateJS = notifyDate.toDate();

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
        updateNotifyFields(db, show.id, {
          dateLastNotified: formatEpoch(notifyDate.unix()),
          lastNotifySeasonEpisode: seasonEpisode,
        });
        upsertNotificationHistory(db, {
          showId: show.id,
          season: nextEpisodeToAir.seasonNumber,
          episode: nextEpisodeToAir.episodeNumber,
          dateSent: dayjs(notifyDateJS).unix(),
          dateChecked: getEpochwithTime(),
          dateLastNotify: today,
          text: body,
          // FOR TESTING
          otherInfo: `LAST-${lastAirDate.formatted} | NEXT-${nextAirDate.formatted} | LAST S-${lastEpisodeToAir.seasonNumber} E-${lastEpisodeToAir.episodeNumber}`,
        });
      }
    } catch (error) {
      console.error(`Error checking show ${show.id}:`, error);
    }
  }
  refreshDbQueries();
}

//# ------------------------
//# Refresh Watch Providers for shows not checked in the last 10 days
//# ------------------------
export const checkForProviderUpdates = async () => {
  await databaseReady();
  const db = getDb();
  const today = formatEpoch(Date.now());

  const showIds = selectShowsDueForProviderCheck(db, today);
  for (const showId of showIds) {
    markProvidersChecked(db, showId, today);
    await getWatchProviders(showId);
  }
  logBackgroundRun({ numShows: showIds.length, type: 'provider' });
  refreshDbQueries();
};

//# REMOVE AFTER TEST - Clear stream update dates
export const clearStreamUpdatedEpoch = () => {
  clearWatchProviders(getDb());
  refreshDbQueries();
};

//~ Keep the last 25 runs
const logBackgroundRun = (run: Omit<BackgroundRunLog, 'dateTimeEpoch'>) => {
  const existingRuns = settings$.backgroundRunLog.peek() || [];
  settings$.backgroundRunLog.set(
    [...existingRuns, { dateTimeEpoch: getEpochwithTime(), ...run }].slice(-25)
  );
};

const refreshDbQueries = () => queryClient.invalidateQueries({ queryKey: dbKeys.all });

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
