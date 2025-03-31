import { authManager } from '~/authentication/AuthProvider';
import { observable, Observable, syncState } from '@legendapp/state';
import { createShowFunctions } from './functions-shows';
import type { ShowFunctions, SavedShow, SavedShows } from './functions-shows';
import type { ShowAttributes } from './functions-showAttributes';
import { type TagFunctions, type Tag, createTagFunctions } from './functions-tags';
import { synced } from '@legendapp/state/sync';
import { ObservablePersistMMKV } from '@legendapp/state/persist-plugins/mmkv';
import { useEffect, useState } from 'react';
import { use$ } from '@legendapp/state/react';
import { Alert } from 'react-native';
import dayjs from 'dayjs';

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
const initialState: { shows: SavedShows; showAttributes: ShowAttributes } = {
  shows: {},
  showAttributes: {},
};
const tagInitialState: { tagList: Tag[] } = { tagList: [] };

//~ ==================
//~ --- savedShow$ --------
//~ Create the Observable, minus the functions
//~ ==================
export type SavedShowObservable = {
  shows: SavedShows;
  showAttributes: ShowAttributes;
} & ShowFunctions;
export const savedShows$ = observable<SavedShowObservable>(
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

//# ============================================================================
//# HOOKS
//# ============================================================================

//# ---------------------------------------------------ava-------------------------
//# returns the detail for a savedShow
//# ----------------------------------------------------------------------------
export const useSavedShow = (showId: string) => {
  if (savedShows$.shows?.[showId].peek() === undefined) {
    console.log('SHOW NOT FOUND removing', showId);
    // Alert.alert('Show not found', 'Removing show from saved shows');
    savedShows$.removeShow(showId);
  }

  return use$(savedShows$.shows?.[showId]) ?? {};

  /*
  // This will work, but I don't think it is worth doing.
  // WIll instead in components needing attributes, use the useSavedSeasonSummary hook
  const showAttributes = use$(savedShows$.showAttributes?.[showId]);
  const nextDLEpisodeDate = showAttributes?.summary?.nde?.airDate;
  const showData = use$(savedShows$.shows?.[showId]) ?? {};
  return {
    ...showData,
    nextDLEpisodeDate: nextDLEpisodeDate,
  };
  */
};

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
