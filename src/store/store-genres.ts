import { authManager } from '~/authentication/AuthProvider';
import { observable } from '@legendapp/state';

import { synced } from '@legendapp/state/sync';
import { ObservablePersistMMKV } from '@legendapp/state/persist-plugins/mmkv';

//~ ==================
//~ --- genres$ --------
//~ ==================
const genreInitialState: { genreList: string[] } = { genreList: [] };

export const genres$ = observable<{ genreList: string[] }>(
  synced({
    initial: genreInitialState,
    persist: {
      plugin: new ObservablePersistMMKV({ id: authManager.currentUser?.id }),
      name: 'genres',
    },
  })
);
