import { isShowSaved, saveSeasonSummary } from './actions.savedShows';
import { dbKeys } from './dbKeys';

import { getDb } from '~/db/client';
import {
  episodeKey,
  selectEpisodeStateMap,
  setEpisodeFlags,
  type EpisodeFlag,
} from '~/db/episodes';
import { calculateSeasonSummary, type SummarySeason } from '~/db/seasonSummary';
import { selectSeasonSummaries, selectShow, type ShowSummaryInput } from '~/db/shows';
import { confirmAlert } from '~/utils/alert';
import { eventDispatcher, EventName } from '~/utils/EventDispatcher';
import { queryClient } from '~/utils/queryClient';

//~ -----------------------------------------------
//~ Episode State writes.  The SQLite write is synchronous, so the episode cache is
//~ replaced straight away from the database (no optimistic guess needed).  Only the
//~ episodeStates query is touched here; the Season Summary - and with it the library
//~ list - is saved separately (debounced from SeasonEpisodeList, see persistSeasonSummary).
//~ -----------------------------------------------
const refreshEpisodeStates = (showId: string) => {
  queryClient.setQueryData(dbKeys.episodeStates(showId), selectEpisodeStateMap(getDb(), showId));
};

const isFlagSet = (showId: string, season: number, episode: number, flag: EpisodeFlag) =>
  !!selectEpisodeStateMap(getDb(), showId)[episodeKey(season, episode)]?.[flag];

const setFlags = (
  showId: string,
  season: number,
  episodes: number[],
  flag: EpisodeFlag,
  value: boolean
) => {
  setEpisodeFlags(getDb(), showId, season, episodes, flag, value);
  refreshEpisodeStates(showId);
};

const toggleFlag = (showId: string, season: number, episode: number, flag: EpisodeFlag) => {
  setFlags(showId, season, [episode], flag, !isFlagSet(showId, season, episode, flag));
};

//# ======================================================
//# Single episodes
//# ======================================================
export const toggleEpisodeDownloaded = (showId: string, season: number, episode: number) =>
  toggleFlag(showId, season, episode, 'downloaded');

export const toggleEpisodeFavorited = (showId: string, season: number, episode: number) =>
  toggleFlag(showId, season, episode, 'favorited');

//~ Marking an episode watched offers to mark the earlier episodes in the season too
export const toggleEpisodeWatched = (showId: string, season: number, episode: number) => {
  if (isFlagSet(showId, season, episode, 'watched')) {
    setFlags(showId, season, [episode], 'watched', false);
    return;
  }
  setFlags(showId, season, [episode], 'watched', true);

  if (episode <= 1 || isFlagSet(showId, season, episode - 1, 'watched')) return;
  confirmAlert(
    'Mark Previous',
    'Set Previous Episodes to Watched',
    () => {
      const previous = Array.from({ length: episode - 1 }, (_, i) => i + 1);
      setFlags(showId, season, previous, 'watched', true);
    },
    () => {}
  );
};

//# ======================================================
//# Whole seasons - episodes 1..numOfEpisodes
//# ======================================================
const episodeRange = (numOfEpisodes: number) =>
  Array.from({ length: numOfEpisodes }, (_, i) => i + 1);

export const setSeasonToWatched = (showId: string, season: number, numOfEpisodes: number) =>
  setFlags(showId, season, episodeRange(numOfEpisodes), 'watched', true);

export const removeSeasonFromWatched = (showId: string, season: number, numOfEpisodes: number) =>
  setFlags(showId, season, episodeRange(numOfEpisodes), 'watched', false);

export const setSeasonToDownloaded = (showId: string, season: number, numOfEpisodes: number) =>
  setFlags(showId, season, episodeRange(numOfEpisodes), 'downloaded', true);

export const removeSeasonFromDownloaded = (showId: string, season: number, numOfEpisodes: number) =>
  setFlags(showId, season, episodeRange(numOfEpisodes), 'downloaded', false);

//# ======================================================
//# Season Summary
//# ======================================================
//~ Save a Season Summary for a Saved Show.  Skips the write (and the query refresh)
//~ when nothing changed, so opening a show's episodes doesn't re-run the library list.
export const persistSeasonSummary = (
  showId: string,
  summary: ShowSummaryInput,
  seasonNumbers: number[]
) => {
  const db = getDb();
  const show = selectShow(db, showId);
  if (!show) return;

  if (!isSameSummary(show, selectSeasonSummaries(db, showId), summary)) {
    saveSeasonSummary(showId, summary);
  }
  if (!show.avgEpisodeRunTime) {
    eventDispatcher.emit(EventName.UpdateAvgEpisodeRuntime, showId, seasonNumbers);
  }
};

//~ Recalculate from the stored Episode States (used after adding a show)
export const refreshSeasonSummary = (showId: string, seasons: SummarySeason[]) => {
  if (!isShowSaved(showId)) return;
  const summary = calculateSeasonSummary(seasons, selectEpisodeStateMap(getDb(), showId));
  persistSeasonSummary(
    showId,
    summary,
    seasons.map((season) => season.seasonNumber)
  );
};

const isSameSummary = (
  show: NonNullable<ReturnType<typeof selectShow>>,
  storedSeasons: ShowSummaryInput['seasons'],
  summary: ShowSummaryInput
) => {
  const { seasons, ...showFields } = summary;
  const showMatches = (Object.keys(showFields) as (keyof typeof showFields)[]).every(
    (key) => show[key] === showFields[key]
  );
  const bySeason = (rows: ShowSummaryInput['seasons']) =>
    JSON.stringify([...rows].sort((a, b) => a.season - b.season));
  return showMatches && bySeason(storedSeasons) === bySeason(seasons);
};
