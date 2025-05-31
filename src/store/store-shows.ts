import { authManager } from '~/authentication/AuthProvider';
import { observable } from '@legendapp/state';
import { createShowFunctions } from './functions-shows';
import type { ShowFunctions, SavedShows } from './functions-shows';
import type { ShowAttributes } from './functions-showAttributes';
import { type TagFunctions, type Tag, createTagFunctions } from './functions-tags';
import { synced } from '@legendapp/state/sync';
import { ObservablePersistMMKV } from '@legendapp/state/persist-plugins/mmkv';
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
export const showMMKV = new ObservablePersistMMKV({ id: authManager.currentUser?.id });
export type SavedShowObservable = {
  shows: SavedShows;
  showAttributes: ShowAttributes;
} & ShowFunctions;
export const savedShows$ = observable<SavedShowObservable>(
  synced({
    initial: initialState,
    persist: {
      plugin: showMMKV, //new ObservablePersistMMKV({ id: authManager.currentUser?.id }),
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

//# ----------------------------------------------------------------------------
//# returns the detail for a savedShow
//# ----------------------------------------------------------------------------
export const useSavedShow = (showId: string) => {
  // we need to return {} if showId isn't found in savedShows$.shows. This happens whenever we remove a show.
  // The change causes the main routes to rerender and the showId they have is now gone.
  return use$(savedShows$.shows?.[showId]) ?? {};
};

export const useShowTags = (showId: string) => {
  const matchedTags = use$(tags$.matchTagIds(savedShows$.shows[showId].userTags.get()));

  //~ Toggle state (add/remove tags)
  const toggleTagState = (tagId: string) => {
    const foundTag = matchedTags.find((el) => el.id === tagId);
    if (!foundTag) return;
    if (foundTag.state === 'include') {
      savedShows$.updateShowTags(showId, tagId, 'remove');
    } else {
      savedShows$.updateShowTags(showId, tagId, 'add');
    }
  };

  return { matchedTags, toggleTagState };
};

//# ============================================================================
//# Export Show Data
//# ============================================================================
export const exportShowData = () => {
  const shows = savedShows$.shows.peek();
  const showAttributes = savedShows$.showAttributes.peek();
  const tags = tags$.tagList.peek();

  return {
    shows,
    showAttributes,
    tags,
  };
};

export const importShowData = (data: any) => {
  const { shows, showAttributes, tags } = data;
  // If null don't set the value
  if (shows) savedShows$.shows.set(shows);
  if (showAttributes) savedShows$.showAttributes.set(showAttributes);
  if (tags) tags$.tagList.set(tags);
};
//~ ==================

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
