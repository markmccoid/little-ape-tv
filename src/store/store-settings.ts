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
type Settings = {
  searchNumColumns: 2 | 3;
  showImageInEpisode: boolean;
  downloadOptions: DownloadOptions;
  // List of genres to exclude from a persons list of shows the were cast members in
  excludeGenresFromPerson: string[];
  defaultTheme: ThemeOption;
  userRatingMax: number;
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
