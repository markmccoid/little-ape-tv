import { Notification } from './../../node_modules/expo-notifications/build/Notifications.types.d';
// import uuid from 'react-native-uuid';
import { observable } from '@legendapp/state';
import { ObservablePersistMMKV } from '@legendapp/state/persist-plugins/mmkv';
import { authManager } from '~/authentication/AuthProvider';
import { synced } from '@legendapp/state/sync';
import { ThemeOption } from '~/components/settings/ThemeSelector';
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
type Settings = {
  searchNumColumns: 2 | 3;
  showImageInEpisode: boolean;
  downloadOptions: DownloadOptions;
  // List of genres to exclude from a persons list of shows the were cast members in
  excludeGenresFromPerson: string[];
  defaultTheme: ThemeOption;
  userRatingMax: number;
  notificationTime: { hour: number; minute: number };
  // Each show will only store the LAST notification sent to the user
  notificationHistory: Record<string, NotificationRecord>;
};
//~ - - - - - - - - - - - - - - - - - -
//~ settings$ Observable
//~ - - - - - - - - - - - - - - - - - -
const initialState = {
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
