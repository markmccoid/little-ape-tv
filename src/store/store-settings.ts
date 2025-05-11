import { Notification } from './../../node_modules/expo-notifications/build/Notifications.types.d';
// import uuid from 'react-native-uuid';
import { observable } from '@legendapp/state';
import { ObservablePersistMMKV } from '@legendapp/state/persist-plugins/mmkv';
import { authManager } from '~/authentication/AuthProvider';
import { synced } from '@legendapp/state/sync';
import { ThemeOption } from '~/components/settings/ThemeSelector';
import { ProviderInfo } from '~/data/query.shows';
import { initial } from 'lodash';
import dayjs from 'dayjs';
//**

type DownloadOptions = {
  showNextDownloadInfo: boolean;
};

type NotificationRecord = {
  Id: string;
  name: string;
  season: number; // Season of last notification
  episode: number; // episode of last notification
  dateSent?: number; // Unix epoch time
  dateChecked?: number; // check date
  text: string;
  otherInfo?: string;
};

export type SavedStreamingProviderInfo = ProviderInfo & { isHiddenFlag?: boolean };
export type BackgroundRunLog = {
  dateTimeEpoch: number;
  numShows: number;
  type: 'notify' | 'provider';
};
type InitialQuery = {
  firstAirDateYear: string;
  includeGenres: string[];
  excludeGenres: string[];
};
type Settings = {
  searchNumColumns: 2 | 3;
  showImageInEpisode: boolean;
  downloadOptions: DownloadOptions;
  // List of genres to exclude from a persons list of shows the were cast members in
  excludeGenresFromPerson: string[];
  defaultTheme: ThemeOption;
  userRatingMax: number;
  // The user can set when notifications will be sent out
  notificationTime: { hour: number; minute: number };
  // Each show will only store the LAST notification sent to the user
  notificationHistory: Record<string, NotificationRecord>;
  // history of when the background code runs and how many show
  backgroundRunLog?: BackgroundRunLog[];
  // Any show that is added gets its streaming providers added here
  // Lookup table for items stored on
  savedStreamingProviders?: SavedStreamingProviderInfo[];
  //
  initialQuery: InitialQuery;
};
//~ - - - - - - - - - - - - - - - - - -
//~ settings$ Observable
//~ - - - - - - - - - - - - - - - - - -
const initialState: Settings = {
  searchNumColumns: 2,
  showImageInEpisode: true,
  downloadOptions: { showNextDownloadInfo: false },
  // When on, these genres will be excluded when showing a persons shows they were in
  // PersonContainer.tsx
  excludeGenresFromPerson: [],
  defaultTheme: 'auto',
  userRatingMax: 10,
  notificationTime: { hour: 16, minute: 0 },
  notificationHistory: {},
  initialQuery: { firstAirDateYear: dayjs().format('YYYY') },
};
export const settings$ = observable<Settings>(
  synced({
    initial: initialState,
    persist: {
      plugin: new ObservablePersistMMKV({ id: authManager.currentUser?.id }),
      name: 'settings',
    },
  })
);

/**
 * Creates a lookup function that can efficiently find providers by providerId
 * using a Map for O(1) lookups. Useful when doing multiple lookups on the same array.
 *
 * @param providers - Array of ProviderInfo objects to create a lookup for
 * @returns A function that takes a providerId and returns the matching provider or undefined
 * USAGE:
     const providerLookup = createProviderLookup();
     // Returns an array of provider info
      const streamindData = streaming?.providers
        .map((providerId) => providerLookup(providerId))
        .filter((provider) => provider !== undefined);
 */
export const createProviderLookup = (providers?: SavedStreamingProviderInfo[]) => {
  // Create a Map for O(1) lookups
  const providerMap = new Map<number, SavedStreamingProviderInfo>();
  providers = settings$.savedStreamingProviders.get();
  // Populate the map
  providers.forEach((provider) => {
    providerMap.set(provider.providerId, provider);
  });

  // Return a lookup function that uses the map
  return (providerId: number): SavedStreamingProviderInfo | undefined =>
    providerMap.get(providerId);
};
