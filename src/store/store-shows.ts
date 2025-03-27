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
  if (!showId) return {};
  const [showDetail, setShowDetail] = useState({} as SavedShow);
  const show = use$(savedShows$.shows[showId]);
  useEffect(() => {
    requestAnimationFrame(() => setShowDetail(show));
  }, [show]);
  return showDetail;
  // We can't subscribe directly, as I was getting react errors about updates happening while other rerending
  // this way with requestAnimationFrame, we wait to update state until the rendering is finished and then
  // component using this hook with update with new summary data.
  useEffect(() => {
    // Subscribe to changes
    const unsubscribe = savedShows$.shows[showId].onChange(
      (newValue) => {
        console.log('newValue UsedSaveShow', newValue);
        requestAnimationFrame(() => {
          setShowDetail(newValue.value);
        });
      },
      { initial: true, immediate: true }
    );

    // // initial populatation of summary data.
    // requestAnimationFrame(() => {
    //   const initialValue = savedShows$.shows[showId].peek();
    //   setShowDetail(initialValue);
    // });

    return () => unsubscribe();
  }, [showId]);

  return showDetail;
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
