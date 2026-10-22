import { and, eq, inArray, sql } from 'drizzle-orm';

import { nowEpoch } from './dates';
import { episodeStates } from './schema';
import type { Db } from './types';

//~ -----------------------------------------------
//~ Episode State - SPARSE: a row only exists while at least one flag is set.
//~ -----------------------------------------------
export type EpisodeFlag = 'watched' | 'downloaded' | 'favorited';
export type EpisodeStateRow = typeof episodeStates.$inferSelect;
export type EpisodeFlags = Pick<EpisodeStateRow, 'watched' | 'downloaded' | 'favorited'>;
// Keyed by episodeKey(season, episode)
export type EpisodeStateMap = Record<string, EpisodeFlags>;

export const episodeKey = (season: number, episode: number) => `${season}:${episode}`;

export const selectEpisodeStates = (db: Db, showId: string): EpisodeStateRow[] =>
  db.select().from(episodeStates).where(eq(episodeStates.showId, showId)).all();

export const selectEpisodeStateMap = (db: Db, showId: string): EpisodeStateMap =>
  Object.fromEntries(
    selectEpisodeStates(db, showId).map(({ season, episode, watched, downloaded, favorited }) => [
      episodeKey(season, episode),
      { watched, downloaded, favorited },
    ])
  );

//~ Set one flag on/off for a list of episodes in a season.
//~ Turning watched on stamps watchedAt (kept if the episode was already watched).
export const setEpisodeFlags = (
  db: Db,
  showId: string,
  season: number,
  episodes: number[],
  flag: EpisodeFlag,
  value: boolean
) => {
  const episodeNumbers = Array.from(new Set(episodes));
  if (episodeNumbers.length === 0) return;
  const now = nowEpoch();

  db.transaction((tx) => {
    if (value) {
      tx.insert(episodeStates)
        .values(
          episodeNumbers.map((episode) => ({
            showId,
            season,
            episode,
            [flag]: true,
            watchedAt: flag === 'watched' ? now : null,
          }))
        )
        .onConflictDoUpdate({
          target: [episodeStates.showId, episodeStates.season, episodeStates.episode],
          set:
            flag === 'watched'
              ? {
                  watched: true,
                  watchedAt: sql`CASE WHEN ${episodeStates.watched} THEN ${episodeStates.watchedAt} ELSE ${now} END`,
                }
              : { [flag]: true },
        })
        .run();
      return;
    }

    const inSeason = and(
      eq(episodeStates.showId, showId),
      eq(episodeStates.season, season),
      inArray(episodeStates.episode, episodeNumbers)
    );
    tx.update(episodeStates)
      .set(flag === 'watched' ? { watched: false, watchedAt: null } : { [flag]: false })
      .where(inSeason)
      .run();
    // Keep the table sparse
    tx.delete(episodeStates)
      .where(
        and(
          inSeason,
          eq(episodeStates.watched, false),
          eq(episodeStates.downloaded, false),
          eq(episodeStates.favorited, false)
        )
      )
      .run();
  });
};
