import { WatchProvider } from './../../node_modules/@markmccoid/tmdb_api/types/APICurated/API_TV.d';
import { Notification } from './../../node_modules/expo-notifications/build/Notifications.types.d';
// import uuid from 'react-native-uuid';
import { observable } from '@legendapp/state';
import { ObservablePersistMMKV } from '@legendapp/state/persist-plugins/mmkv';
import { authManager } from '~/authentication/AuthProvider';
import { synced } from '@legendapp/state/sync';
import { ThemeOption } from '~/components/settings/ThemeSelector';
import { ProviderInfo } from '~/data/query.shows';
import dayjs from 'dayjs';
import { getTMDBConsts } from '@markmccoid/tmdb_api';
//**

//# -- Get the first 30 watch providers from TMDB contants IF we have not yet
//# -- Initialized the watchProviderAttributes array in settings$.
export const initializeWatchProviders = () => {
  const currProviders = settings$.watchProviderAttributes.peek();

  if (!currProviders) {
    const tmdbConsts = getTMDBConsts();
    const initProviders = tmdbConsts.WATCH_PROVIDERS.slice(0, 30);

    const augmentedProviders: WatchProviderAttributes[] = initProviders.map((el) => ({
      ...el,
      isHidden: false,
      isSearchOnly: false,
      showsWithProvider: 0,
    }));
    settings$.watchProviderAttributes.set(augmentedProviders);
  }
};

type DownloadOptions = {
  showNextDownloadInfo: boolean;
};

export type NotificationRecord = {
  Id: string;
  name: string;
  season: number; // Season of last notification
  episode: number; // episode of last notification
  dateSent?: number; // Unix epoch time
  dateChecked?: number; // check date
  dateLastNotify?: number; // stored in savedShows[] records
  text: string;
  otherInfo?: string;
};

export type BackgroundRunLog = {
  dateTimeEpoch: number;
  numShows: number;
  type: 'notify' | 'provider' | 'notify-ERROR';
  detail?: string;
};
type InitialQuery = {
  firstAirDateYear: string;
  includeGenres: string[];
  excludeGenres: string[];
};
export type WatchProviderAttributes = {
  providerId: number;
  provider: string;
  logoPath: string;
  displayPriority: number;
  showsWithProvider?: number; // 0 no saved shows with this provider, 1 yes -- could instead store count of show
  isHidden?: boolean; //is this provider hidden from search/filter lists
  isSearchOnly: boolean; // true indicates it will NOT show up on settings screen.  It can be found in search and turned "on"
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
  // list of watch providers with
  watchProviderAttributes?: WatchProviderAttributes[];
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
  initialQuery: { firstAirDateYear: dayjs().format('YYYY'), includeGenres: [], excludeGenres: [] },
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

// settings$.watchProviderAttributes.delete();

export const toggleWatchProviderAttribs = (providerObj: WatchProviderAttributes) => {
  const providerAttribs = settings$.watchProviderAttributes.peek() || [];
  // Does the passed provider exist in the watchProviderAttributes array
  // Is so, remove, else add
  const providerIndex = providerAttribs.findIndex((el) => el.providerId === providerObj.providerId);
  if (providerIndex === -1) {
    //Adding to attribs
    const newProvider: WatchProviderAttributes = {
      ...providerObj,
      isHidden: false,
      isSearchOnly: false,
      displayPriority: providerAttribs.length + 1,
    };
    settings$.watchProviderAttributes.push(newProvider);
  } else {
    settings$.watchProviderAttributes[providerIndex].delete();
  }
};
