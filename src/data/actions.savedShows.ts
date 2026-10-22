import {
  type CastTVShows,
  tvGetShowDetails,
  type TVSearchResultItem,
  type TVShowDetails,
} from '@markmccoid/tmdb_api';
import type { InfiniteData } from '@tanstack/react-query';
import uuid from 'react-native-uuid';

import { dbKeys } from './dbKeys';

import { authManager } from '~/authentication/AuthProvider';
import { getDb } from '~/db/client';
import { reimportFromMMKV } from '~/db/legacy/migrateFromMMKV';
import {
  addShowTag,
  deleteShow,
  insertShow,
  refreshShowDetails,
  removeShowTag,
  selectSavedShowIds,
  selectShow,
  setAvgEpisodeRunTime,
  setFavorite,
  setPosterUrl,
  setShowTags,
  setUserRating,
  setWatchProviders,
  writeSeasonSummary,
  type ShowDetailsInput,
  type ShowSummaryInput,
} from '~/db/shows';
import { clearNotificationHistory, resetNotifySchedule } from '~/db/notifications';
import { deleteTag, insertTag, renameTag, reorderTags } from '~/db/tags';
import { search$ } from '~/store/store-search';
import { eventDispatcher, EventName } from '~/utils/EventDispatcher';
import { queryClient } from '~/utils/queryClient';

//~ -----------------------------------------------
//~ Writes to the SQLite show data.  Each one writes, then invalidates every
//~ dbKeys query so the screens re-read.
//~ -----------------------------------------------
const refreshQueries = () => queryClient.invalidateQueries({ queryKey: dbKeys.all });

const write = <A extends unknown[]>(fn: (...args: A) => void) => {
  return (...args: A) => {
    fn(...args);
    refreshQueries();
  };
};

export const isShowSaved = (showId: string) => !!selectShow(getDb(), showId);

//!! Throwaway with src/db/legacy: replaces all SQLite show data with the old store's data
export const reimportLegacyShows = () => {
  const userId = authManager.currentUser?.id;
  if (!userId) throw new Error('No user is logged in.');
  const counts = reimportFromMMKV(getDb(), userId);
  refreshQueries();
  return counts;
};

//# ======================================================
//# Saved Shows
//# ======================================================
export const addShow = async (showId: string) => {
  const data = await getShowDetails(parseInt(showId));
  insertShow(getDb(), toShowDetailsInput(data));
  refreshQueries();
  reTagSearch();

  const seasonNumbers = data.seasons.map((el) => el.seasonNumber) || [];
  eventDispatcher.emit(EventName.UpdateAvgEpisodeRuntime, showId, seasonNumbers);
  eventDispatcher.emit(EventName.UpdateSeasonSummary, showId, seasonNumbers);
  eventDispatcher.emit(EventName.UpdateWatchProviders, showId);
};

export const removeShow = (showId: string) => {
  deleteShow(getDb(), showId);
  refreshQueries();
  reTagSearch();
};

export const refreshSavedShowDetails = write((showId: string, data: TVShowDetails) =>
  refreshShowDetails(getDb(), { ...toShowDetailsInput(data), id: showId })
);

export const toggleFavoriteShow = write(
  (showId: string, action: 'toggle' | 'on' | 'off' = 'toggle') =>
    setFavorite(getDb(), showId, action)
);

export const updateShowUserRating = write((showId: string, rating: number) =>
  setUserRating(getDb(), showId, rating)
);

export const updateShowPoster = write((showId: string, posterUrl: string) =>
  setPosterUrl(getDb(), showId, posterUrl)
);

export const updateAvgEpisodeRunTime = write((showId: string, avgRunTime: number) =>
  setAvgEpisodeRunTime(getDb(), showId, avgRunTime)
);

export const updateShowWatchProviders = write((showId: string, providerIds: number[]) =>
  setWatchProviders(getDb(), showId, providerIds)
);

export const saveSeasonSummary = write((showId: string, summary: ShowSummaryInput) =>
  writeSeasonSummary(getDb(), showId, summary)
);

//# ======================================================
//# Show Tags
//# ======================================================
export const updateShowTags = write((showId: string, tagId: string, action: 'add' | 'remove') =>
  action === 'add' ? addShowTag(getDb(), showId, tagId) : removeShowTag(getDb(), showId, tagId)
);

export const replaceShowTags = write((showId: string, tagIds: string[]) =>
  setShowTags(getDb(), showId, tagIds)
);

//# ======================================================
//# Tags
//# ======================================================
export const addTag = write((name: string) => insertTag(getDb(), uuid.v4() as string, name));
export const editTag = write((tagId: string, name: string) => renameTag(getDb(), tagId, name));
export const removeTag = write((tagId: string) => deleteTag(getDb(), tagId));
export const updateTagPositions = write((tagIdOrder: string[]) => reorderTags(getDb(), tagIdOrder));

//# ======================================================
//# Notifications (testing aids on the Settings screen)
//# ======================================================
export const resetNotificationSchedule = write(() => resetNotifySchedule(getDb()));
export const clearAllNotificationHistory = write(() => clearNotificationHistory(getDb()));

//# ======================================================
//# Marking TMDB results that are already saved
//# ======================================================
export const tagShows = (showResults: TVSearchResultItem[]) => {
  const showIds = new Set(selectSavedShowIds(getDb()));
  return showResults.map((show) => ({
    ...show,
    isStoredLocally: showIds.has(show.id.toString()),
  }));
};

export const reTagPersonShows = (toTagShows: CastTVShows[]) => {
  const showIds = new Set(selectSavedShowIds(getDb()));
  return toTagShows.map((show) => ({
    ...show,
    isStoredLocally: showIds.has(show.tvShowId.toString()),
  }));
};

type SearchPages = InfiniteData<{
  page: number;
  totalResults: number;
  totalPages: number;
  results: TVSearchResultItem[];
}>;
//~ Update the cached search results after a show is added or removed
const reTagSearch = () => {
  const showIds = new Set(selectSavedShowIds(getDb()));
  queryClient.setQueryData(
    ['searchByTitle', search$.searchVal.peek() || 'discover'],
    (oldData: SearchPages | undefined) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        pages: oldData.pages.map((page) => ({
          ...page,
          results: page.results.map((result) => ({
            ...result,
            isStoredLocally: showIds.has(result.id.toString()),
          })),
        })),
      };
    }
  );
};

//# ======================================================
//# TMDB helpers
//# ======================================================
//~ Details used when adding a show.  Uses the cached query if the show was just viewed.
export const getShowDetails = async (showId: number) => {
  const queryKey = ['showdetails', showId, false];
  let data: TVShowDetails | undefined = queryClient.getQueryData(queryKey);
  if (!data) {
    const result = await tvGetShowDetails(showId, ['recommendations']);
    data = result.data;
  }
  return data;
};

const toShowDetailsInput = (data: TVShowDetails): ShowDetailsInput => ({
  id: data.id.toString(),
  name: data.name,
  imdbId: data.imdbId,
  tvdbId: data.tvdbId,
  posterUrl: data.posterURL,
  backdropUrl: data.backdropURL,
  avgEpisodeRunTime: data.avgEpisodeRunTime,
  showStatus: data.status,
  imdbEpisodesUrl: data.imdbEpisodesURL,
  firstAirDate: data.firstAirDate?.epoch,
  nextAirDate: data.nextAirDate?.epoch,
  genres: data.genres,
});
