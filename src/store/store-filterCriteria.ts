import uuid from 'react-native-uuid';
import { observable } from '@legendapp/state';
import { tags$ } from './store-shows';
import { Tag } from './functions-tags';
import { genres$ } from './store-genres';
import { use$ } from '@legendapp/state/react';

//**
// store-settings contains
//  */

//~ --------------------------------------------------------
//~ Filter container.  not saved, just used for filter session
//~  When user selects filters to filter list of shows, it goes here
//~  It is not saved to disk.  The store-settings holds saved filters
//~ --------------------------------------------------------
// Define the array as the single source of truth
// This is for our tri-state filters like favorite
// Use for tags??
const inclusionStates = ['off', 'include', 'exclude'] as const;

// Derive the type from the array
export type InclusionState = (typeof inclusionStates)[number];
type BaseFilters = {
  filterIsWatched?: InclusionState;
  filterIsFavorited?: InclusionState;
  // List of tags to include in filter
  includeTags?: string[];
  // List of tags to exclude from filter
  excludeTags?: string[];
  includeGenres?: string[];
  excludeGenres?: string[];
};
type NameFilter = {
  showName: string;
};
export type FilterStatus = {
  overallStatus: 'active' | 'inactive';
  tags: 'active' | 'inactive';
  genres: 'active' | 'inactive';
  watched: 'active' | 'inactive';
  favorited: 'active' | 'inactive';
};

export type FilterCriteria = {
  baseFilters: BaseFilters;
  nameFilter: NameFilter;
  actionClearTags: () => void;
  actionClearGenres: () => void;
};

//~ - - - - - - - - - - - - - - - - - -
//~ filterCriteria$ Observable
//~ - - - - - - - - - - - - - - - - - -
export const filterCriteria$ = observable<FilterCriteria>({
  baseFilters: {},
  nameFilter: { showName: '' },
  actionClearTags: () => {
    filterCriteria$.baseFilters.assign({
      includeTags: [],
      excludeTags: [],
    });
  },
  actionClearGenres: () => {
    filterCriteria$.baseFilters.assign({
      includeGenres: [],
      excludeGenres: [],
    });
  },
});

// ---------------------------------------
//-- filterCriteria$ Observable Functions
// ---------------------------------------
//~ ------------------------------------------------
//~ Adds the state property to the tagList items so we know what is off/include/exclude
//~ so we can set the ui correctly.
//~ ------------------------------------------------
export const useFilterTags = () => {
  const includeTags = use$(filterCriteria$.baseFilters.includeTags) || [];
  const excludeTags = use$(filterCriteria$.baseFilters.excludeTags) || [];
  // const { excludeTags = [], includeTags = [] } = filterCriteria$.baseFilters.get();
  const tagList = tags$.tagList.peek();

  return tagList.map((tag) => {
    if (includeTags.includes(tag.id)) {
      return { ...tag, state: 'include' };
    } else if (excludeTags.includes(tag.id)) {
      return { ...tag, state: 'exclude' };
    } else {
      return { ...tag, state: 'off' };
    }
  }) as (Tag & { state: 'off' | 'include' | 'exclude' })[];
};

export const useFilterGenres = () => {
  const includeGenres = use$(filterCriteria$.baseFilters.includeGenres) || [];
  const excludeGenres = use$(filterCriteria$.baseFilters.excludeGenres) || [];

  const genreList = genres$.genreList.peek();
  return genreList.map((genre) => {
    if (includeGenres.includes(genre)) {
      return { genre, state: 'include' };
    }
    if (excludeGenres.includes(genre)) {
      return { genre, state: 'exclude' };
    }
    return { genre, state: 'off' };
  }) as { genre: string; state: 'off' | 'include' | 'exclude' }[];
};

//~ ------------------------------------------------
//~ Updates both the includeTags and excludeTags arrays in filterCriteria.baseFitlers
//~ ------------------------------------------------
export const fcUpdateTagsGenres = (
  items: string,
  newState: 'off' | 'include' | 'exclude',
  itemType: 'genres' | 'tags'
) => {
  const { excludeGenres, includeGenres, excludeTags, includeTags } =
    filterCriteria$.baseFilters.peek();
  let includeItems = includeGenres;
  let excludeItems = excludeGenres;
  let includeKey = 'includeGenres';
  let excludeKey = 'excludeGenres';
  if (itemType === 'tags') {
    includeItems = includeTags;
    excludeItems = excludeTags;
    includeKey = 'includeTags';
    excludeKey = 'excludeTags';
  }
  // Based on new state of tagId, we need to either clear from both include and exclude buckets
  // or add to one and remove from the other
  type StateFunc = (
    includeItems: string[],
    excludeItems: string[],
    itemId: string
  ) => { newInclude: string[]; newExclude: string[] };

  // Setup object that has the three state functions and then use the newState
  // to dynamically call the correct one for the newState of the tagId passed
  // Effectively adding and/or removing from one list or another.
  type StateFunctions = {
    includeItems: StateFunc;
    excludeItems: StateFunc;
    offItems: StateFunc;
  };
  const upFunctions: StateFunctions = {
    includeItems: handleincludeState,
    excludeItems: handleexcludeState,
    offItems: handleoffState,
  };

  const stateUpdateFunc = `${newState}Items`;
  const newItems = upFunctions[stateUpdateFunc](includeItems, excludeItems, items);

  filterCriteria$.baseFilters.assign({
    [includeKey]: newItems.newInclude,
    [excludeKey]: newItems.newExclude,
  });
};
// Tag/Genre update helpers
const handleincludeState = (
  includeTags: string[] = [],
  excludeTags: string[] = [],
  tagId: string
) => {
  const newInclude = Array.from(new Set([...includeTags, tagId]));
  const newExclude = excludeTags.filter((el) => el !== tagId);
  return { newInclude, newExclude };
};
const handleexcludeState = (
  includeTags: string[] = [],
  excludeTags: string[] = [],
  tagId: string
) => {
  const newExclude = Array.from(new Set([...excludeTags, tagId]));
  const newInclude = includeTags.filter((el) => el !== tagId);
  return { newInclude, newExclude };
};
const handleoffState = (includeTags: string[] = [], excludeTags: string[] = [], tagId: string) => {
  const newInclude = includeTags.filter((el) => el !== tagId);
  const newExclude = excludeTags.filter((el) => el !== tagId);
  return { newInclude, newExclude };
};
// - Tag update helpers END ----------

//~ -----------------------------------------------------------------------------------------------
//~ HELPER FUNCTIONS
//~ -----------------------------------------------------------------------------------------------
// --------------
// -- Helper functions for tri-state filters like Watched and Favorited
// Takes in an inlcusion string or a inclusion index and returns inclusion string
export function getInclusionValue(inclusionState: InclusionState | 0 | 1 | 2) {
  // If a number then access the inclusionStates (defined globally) via index
  if (typeof inclusionState === 'number' && !isNaN(inclusionState)) {
    // Access by index when inclusionState is a number
    return inclusionStates[inclusionState];
  }
  return inclusionState as InclusionState;
}
// takes an inclusion string and returns the appropriate index.  Useful for segmented control settings.
// 0 = "off" , 1 = "includes", 2 = "exclude"
export const getInclusionIndex = (inclusionState: InclusionState | undefined) => {
  const inclusionIndex = inclusionStates.findIndex((el) => el === inclusionState);
  if (inclusionIndex === -1) return 0;
  return inclusionIndex;
};
