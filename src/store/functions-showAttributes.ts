//!! -------------------------------------------------------
//!! LEGACY shape of the Legend State showAttributes (Episode State + Season Summary).
//!! Episode State now lives in SQLite (src/db/episodes.ts, src/db/seasonSummary.ts).
//!! Only kept for the old savedShows$ store; removed with it in phase 5.
//!! -------------------------------------------------------
interface EpisodeAttributes {
  w: boolean; // watched
  d: boolean; // downloaded
  dw: number; // dateWatched
  f: boolean; // favorited
}

export interface ShowAttributes {
  [showId: string]: {
    summary: { asw?: boolean } & Record<string, unknown>;
    seasons: {
      [seasonNumber: number]: { episodes: { [episodeNumber: number]: EpisodeAttributes } };
    };
  };
}
