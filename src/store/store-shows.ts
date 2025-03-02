import { authManager } from '~/authentication/AuthProvider';
import { observable, Observable, syncState } from '@legendapp/state';
import { createShowFunctions } from './functions-shows';
import type { ShowFunctions, SavedShow, SavedShows, SavedShowsAttributes } from './functions-shows';
import { type TagFunctions, type Tag, createTagFunctions } from './functions-tags';
import { synced } from '@legendapp/state/sync';
import { ObservablePersistMMKV } from '@legendapp/state/persist-plugins/mmkv';

//~ -----------------------------------------------
//~ Observer Creation
//~ -----------------------------------------------
// Default values
const defaultShowsValue = {};
const defaultTagListValue: Tag[] = [];

//-- Load any stored item from MMKV
// const savedShows = authManager.userStorage?.getItem('savedshows');
// const storedTags = authManager.userStorage?.getItem('tags');

// Create the initial state, if nothing loaded from MMKV then the default will be used
const initialState: { shows: SavedShows; showAttributes: SavedShowsAttributes } = {
  shows: {},
  showAttributes: {},
};
const tagInitialState: { tagList: Tag[] } = { tagList: [] };

//~ ==================
//~ --- savedShow$ --------
//~ Create the Observable, minus the functions
//~ ==================
export const savedShows$ = observable<
  { shows: SavedShows; showAttributes: SavedShowsAttributes } & ShowFunctions
>(
  synced({
    initial: initialState,
    persist: {
      plugin: new ObservablePersistMMKV({ id: authManager.currentUser?.id }),
      name: 'savedshows',
    },
  })
);
//~ Add the function by running a function that accepts observable to create functions with.
savedShows$.set({ ...initialState, ...createShowFunctions(savedShows$) });

//~ ==================
//~ --- savedShowAttributes$ --------
//~ Create the Observable, minus the functions
//~ ==================

//~ ==================
//~ --- tags$ --------
//~ ==================
// export const tags$ = observable<{ tagList: Tag[] } & TagFunctions>({
//   ...tagInitialState,
//   ...({} as TagFunctions),
// });

export const tags$ = observable<{ tagList: Tag[] } & TagFunctions>(
  synced({
    initial: tagInitialState,
    persist: {
      plugin: new ObservablePersistMMKV({ id: authManager.currentUser?.id }),
      name: 'tags',
    },
  })
);
//~ Add the functions
tags$.set({ ...tagInitialState, ...createTagFunctions(tags$) });

//-- ===================
//-- Handle Auth Change
//-- ===================
// authManager.subscribe(() => {
//   //-- Load any stored item from MMKV
//   const savedShows = authManager.userStorage?.getItem('savedshows');
//   //~ set the loaded shows or initial value
//   savedShows$.shows.set(savedShows || defaultShowsValue);

//   //~ LOAD Tags
//   const tagList = authManager.userStorage?.getItem('tags');
//   tags$.tagList.set(tagList || []);
// });
