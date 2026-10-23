import { use$ } from '@legendapp/state/react';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { getDb } from '~/db/client';
import { selectEpisodeStateMap, episodeKey, type EpisodeFlags } from '~/db/episodes';
import { selectShowList, type ShowListCriteria } from '~/db/showList';
import {
  selectGenres,
  selectSavedShowPosters,
  selectSeasonSummaries,
  selectShow,
} from '~/db/shows';
import { selectNotificationHistory } from '~/db/notifications';
import { selectTags } from '~/db/tags';
import { dbKeys } from './dbKeys';
import { updateShowTags } from './actions.savedShows';

import { filterCriteria$ } from '~/store/store-filterCriteria';

//~ -----------------------------------------------
//~ React Query hooks over the SQLite show data.
//~ Every key lives under dbKeys.all (dbKeys.ts); writes (see actions.savedShows.ts) invalidate
//~ the whole root, so these queries never go stale on their own.
//~ The reads are synchronous, so initialData fills a new key without a loading state.
//~ -----------------------------------------------

const dbQuery = <T>(queryKey: readonly unknown[], read: () => T) => ({
  queryKey,
  queryFn: read,
  initialData: read,
  staleTime: Infinity,
});

//# ------------------------------------------------------
//# useFilteredShows - the library list, filtered and sorted by filterCriteria$
//# ------------------------------------------------------
export const useFilteredShows = () => {
  const baseFilters = use$(filterCriteria$.baseFilters);
  const { showName, ignoreOtherFilters } = use$(filterCriteria$.nameFilter);
  const sortSettings = use$(filterCriteria$.sortSettings);

  // Built every render, not memoized: Legend State updates these objects in place
  // (e.g. baseFilters.assign from the filter screen), so their identity doesn't change.
  // React Query hashes the key by value, so an unchanged criteria reuses the cache.
  const criteria: ShowListCriteria = {
    showName,
    ignoreOtherFilters,
    includeTags: baseFilters.includeTags,
    excludeTags: baseFilters.excludeTags,
    includeGenres: baseFilters.includeGenres,
    excludeGenres: baseFilters.excludeGenres,
    includeWatchProviders: baseFilters.includeWatchProviders,
    filterIsFavorited: baseFilters.filterIsFavorited,
    filterIsAllWatched: baseFilters.filterIsAllWatched,
    sort: sortSettings.map(({ sortField, sortDirection, active, position }) => ({
      sortField,
      sortDirection,
      active,
      position,
    })),
  };

  const { data } = useQuery(
    dbQuery(dbKeys.showList(criteria), () => selectShowList(getDb(), criteria))
  );
  return data;
};

//# ------------------------------------------------------
//# useSavedShow - one Saved Show (null when the show is not saved)
//# ------------------------------------------------------
export const useSavedShow = (showId: string) => {
  const { data } = useQuery(
    dbQuery(dbKeys.show(showId), () => selectShow(getDb(), showId) ?? null)
  );
  return data;
};

export const useSeasonSummaries = (showId: string) => {
  const { data } = useQuery(
    dbQuery(dbKeys.seasonSummaries(showId), () => selectSeasonSummaries(getDb(), showId))
  );
  return data;
};

//~ The saved poster for a show, undefined when the show is not saved or has none
export const useSavedPosterUrl = (showId: string) => {
  const { data } = useQuery({
    ...dbQuery(dbKeys.savedShowPosters(), () => selectSavedShowPosters(getDb())),
    select: (posters: Record<string, string | null>) => posters[showId] ?? undefined,
  });
  return data;
};

// Genres across all Saved Shows
export const useGenres = () => {
  const { data } = useQuery(dbQuery(dbKeys.genres(), () => selectGenres(getDb())));
  return data;
};

export const useTags = () => {
  const { data } = useQuery(dbQuery(dbKeys.tags(), () => selectTags(getDb())));
  return data;
};

//~ Every tag, with whether it is on the given list of tag ids
export const matchTagIds = (
  tags: { id: string; name: string }[],
  tagIds: string[] | undefined
): { id: string; name: string; state: 'include' | 'off' }[] => {
  const selected = new Set(tagIds ?? []);
  return tags.map((tag) => ({
    id: tag.id,
    name: tag.name,
    state: selected.has(tag.id) ? 'include' : 'off',
  }));
};

export const useMatchedTags = (tagIds: string[] | undefined) => {
  const tags = useTags();
  return useMemo(() => matchTagIds(tags, tagIds), [tags, tagIds]);
};

//~ Tags for a Saved Show, with a toggle that adds/removes the tag on the show
export const useShowTags = (showId: string) => {
  const show = useSavedShow(showId);
  const matchedTags = useMatchedTags(show?.tagIds);

  const toggleTagState = (tagId: string) => {
    const foundTag = matchedTags.find((el) => el.id === tagId);
    if (!foundTag) return;
    updateShowTags(showId, tagId, foundTag.state === 'include' ? 'remove' : 'add');
  };

  return { matchedTags, toggleTagState, isFavorited: !!show?.favoritedAt };
};

//~ ------------------------------------------------
//~ Tags / Genres with their include/exclude state in the current Filter Criteria
//~ ------------------------------------------------
type FilterState = 'off' | 'include' | 'exclude';
const filterState = (value: string, include: string[], exclude: string[]): FilterState =>
  include.includes(value) ? 'include' : exclude.includes(value) ? 'exclude' : 'off';

export const useFilterTags = () => {
  const includeTags = use$(filterCriteria$.baseFilters.includeTags) || [];
  const excludeTags = use$(filterCriteria$.baseFilters.excludeTags) || [];
  const tagList = useTags();
  return tagList.map((tag) => ({ ...tag, state: filterState(tag.id, includeTags, excludeTags) }));
};

export const useFilterGenres = () => {
  const includeGenres = use$(filterCriteria$.baseFilters.includeGenres) || [];
  const excludeGenres = use$(filterCriteria$.baseFilters.excludeGenres) || [];
  const genreList = useGenres();
  return genreList.map((genre) => ({
    genre,
    state: filterState(genre, includeGenres, excludeGenres),
  }));
};

//# ------------------------------------------------------
//# Episode State for a show, keyed by episodeKey(season, episode)
//# ------------------------------------------------------
export const useEpisodeStates = (showId: string) => {
  const { data } = useQuery(
    dbQuery(dbKeys.episodeStates(showId), () => selectEpisodeStateMap(getDb(), showId))
  );
  return data;
};

const NO_FLAGS: EpisodeFlags = { watched: false, downloaded: false, favorited: false };
//~ One episode's flags.  The select means a row only re-renders when its own flags change.
export const useEpisodeState = (showId: string, season: number, episode: number) => {
  const { data } = useQuery({
    ...dbQuery(dbKeys.episodeStates(showId), () => selectEpisodeStateMap(getDb(), showId)),
    select: (states: Record<string, EpisodeFlags>) =>
      states[episodeKey(season, episode)] ?? NO_FLAGS,
  });
  return data;
};

//~ Last notification check/send per show, most recently checked first
export const useNotificationHistory = () => {
  const { data } = useQuery(
    dbQuery(dbKeys.notificationHistory(), () => selectNotificationHistory(getDb()))
  );
  return data;
};
