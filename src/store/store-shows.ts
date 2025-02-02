import { authManager } from '~/authentication/AuthProvider';
import { observable, Observable, syncState } from '@legendapp/state';
import { createShowFunctions } from './functions-shows';
import type { ShowFunctions, SavedShow, SavedShows } from './functions-shows';
import { type TagFunctions, type Tag, createTagFunctions } from './functions-tags';

//~ -----------------------------------------------
//~ Observer Creation
//~ -----------------------------------------------
// Default values
const defaultShowsValue = {};
const defaultTagListValue: Tag[] = [];

//-- Load any stored item from MMKV
const savedShows = authManager.userStorage?.getItem('savedshows');
const storedTags = authManager.userStorage?.getItem('tags');

// Create the initial state, if nothing loaded from MMKV then the default will be used
const initialState: { shows: SavedShows } = { shows: savedShows || defaultShowsValue };
const tagInitialState: { tagList: Tag[] } = { tagList: storedTags || defaultTagListValue };

//~ ==================
//~ --- savedShow$ --------
//~ Create the Observable, minus the functions
//~ ==================
export const savedShows$ = observable<{ shows: SavedShows } & ShowFunctions>({
  ...initialState,
  ...({} as ShowFunctions),
});
//~ Add the function by running a function that accepts observable to create functions with.
savedShows$.set({ ...initialState, ...createShowFunctions(savedShows$) });

//~ ==================
//~ --- tags$ --------
//~ ==================
export const tags$ = observable<{ tagList: Tag[] } & TagFunctions>({
  ...tagInitialState,
  ...({} as TagFunctions),
});
//~ Add the functions
tags$.set({ ...tagInitialState, ...createTagFunctions(tags$) });

//-- ===================
//-- Handle Auth Change
//-- ===================
authManager.subscribe(() => {
  //-- Load any stored item from MMKV
  const savedShows = authManager.userStorage?.getItem('savedshows');
  //~ set the loaded shows or initial value
  savedShows$.shows.set(savedShows || defaultShowsValue);

  //~ LOAD Tags
  const tagList = authManager.userStorage?.getItem('tags');
  tags$.tagList.set(tagList || []);
});
