import { sql } from 'drizzle-orm';
import { index, integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';

//~ -----------------------------------------------
//~ All dates are Unix epoch SECONDS (see formatEpoch in ~/utils/utils)
//~ Show ids are the TMDB id stored as text, matching the showId strings used in the app
//~ -----------------------------------------------

//# ------------------------------------------------------
//# shows - one row per Saved Show
//# The summary_* style columns (allWatched -> nextDlStatus) are a cache of the
//# Season Summary.  They need TMDB episode counts so they are recalculated when
//# season data is fetched, not derived in SQL.
//# ------------------------------------------------------
export const shows = sqliteTable(
  'shows',
  {
    id: text('id').primaryKey(),
    imdbId: text('imdb_id'),
    tvdbId: integer('tvdb_id'),
    name: text('name').notNull(),
    posterUrl: text('poster_url'),
    backdropUrl: text('backdrop_url'),
    showStatus: text('show_status'),
    avgEpisodeRunTime: integer('avg_episode_run_time'),
    firstAirDate: integer('first_air_date'),
    nextAirDate: integer('next_air_date'),
    imdbEpisodesUrl: text('imdb_episodes_url'),
    // User specific
    userRating: integer('user_rating').notNull().default(0),
    favoritedAt: integer('favorited_at'),
    trackAndNotify: integer('track_and_notify', { mode: 'boolean' }).notNull().default(true),
    dateAdded: integer('date_added').notNull(),
    dateLastUpdated: integer('date_last_updated').notNull(),
    // Background notification bookkeeping
    dateLastNotified: integer('date_last_notified'),
    dateLastNotifyChecked: integer('date_last_notify_checked'),
    lastNotifySeasonEpisode: text('last_notify_season_episode'),
    nextNotifyOffset: integer('next_notify_offset'),
    // When the show_watch_providers rows were last refreshed
    streamingUpdatedAt: integer('streaming_updated_at'),
    // Season Summary cache (whole show)
    allWatched: integer('all_watched', { mode: 'boolean' }).notNull().default(false),
    totalEpisodes: integer('total_episodes').notNull().default(0),
    totalWatched: integer('total_watched').notNull().default(0),
    lastWatchedSeason: integer('last_watched_season').notNull().default(0),
    // Next Download Episode
    nextDlSeason: integer('next_dl_season'),
    nextDlEpisode: integer('next_dl_episode'),
    nextDlAirDate: integer('next_dl_air_date'),
    // s = some downloaded, a = all downloaded, n = none downloaded
    nextDlStatus: text('next_dl_status', { enum: ['s', 'a', 'n'] })
      .notNull()
      .default('n'),
  },
  (t) => [
    index('shows_name_idx').on(sql`${t.name} COLLATE NOCASE`),
    index('shows_date_added_idx').on(t.dateAdded),
    index('shows_user_rating_idx').on(t.userRating),
    index('shows_next_dl_air_date_idx').on(t.nextDlAirDate),
  ]
);

//# ------------------------------------------------------
//# season_summaries - Season Summary cache per season
//# ------------------------------------------------------
export const seasonSummaries = sqliteTable(
  'season_summaries',
  {
    showId: text('show_id')
      .notNull()
      .references(() => shows.id, { onDelete: 'cascade' }),
    season: integer('season').notNull(),
    totalEpisodes: integer('total_episodes').notNull().default(0),
    watched: integer('watched').notNull().default(0),
    downloaded: integer('downloaded').notNull().default(0),
    favorited: integer('favorited').notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.showId, t.season] })]
);

//# ------------------------------------------------------
//# episode_states - SPARSE. A row only exists while at least one flag is set.
//# ------------------------------------------------------
export const episodeStates = sqliteTable(
  'episode_states',
  {
    showId: text('show_id')
      .notNull()
      .references(() => shows.id, { onDelete: 'cascade' }),
    season: integer('season').notNull(),
    episode: integer('episode').notNull(),
    watched: integer('watched', { mode: 'boolean' }).notNull().default(false),
    downloaded: integer('downloaded', { mode: 'boolean' }).notNull().default(false),
    favorited: integer('favorited', { mode: 'boolean' }).notNull().default(false),
    watchedAt: integer('watched_at'),
  },
  (t) => [primaryKey({ columns: [t.showId, t.season, t.episode] })]
);

//# ------------------------------------------------------
//# tags + show_tags
//# ------------------------------------------------------
export const tags = sqliteTable('tags', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  position: integer('position').notNull(),
});

export const showTags = sqliteTable(
  'show_tags',
  {
    showId: text('show_id')
      .notNull()
      .references(() => shows.id, { onDelete: 'cascade' }),
    tagId: text('tag_id')
      .notNull()
      .references(() => tags.id, { onDelete: 'cascade' }),
  },
  (t) => [primaryKey({ columns: [t.showId, t.tagId] }), index('show_tags_tag_idx').on(t.tagId)]
);

//# ------------------------------------------------------
//# show_genres - Genres come from TMDB.  The genre list for filters is SELECT DISTINCT genre
//# ------------------------------------------------------
export const showGenres = sqliteTable(
  'show_genres',
  {
    showId: text('show_id')
      .notNull()
      .references(() => shows.id, { onDelete: 'cascade' }),
    genre: text('genre').notNull(),
  },
  (t) => [primaryKey({ columns: [t.showId, t.genre] }), index('show_genres_genre_idx').on(t.genre)]
);

//# ------------------------------------------------------
//# show_watch_providers - Watch Providers a show is available on
//# ------------------------------------------------------
export const showWatchProviders = sqliteTable(
  'show_watch_providers',
  {
    showId: text('show_id')
      .notNull()
      .references(() => shows.id, { onDelete: 'cascade' }),
    providerId: integer('provider_id').notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.showId, t.providerId] }),
    index('show_watch_providers_provider_idx').on(t.providerId),
  ]
);

//# ------------------------------------------------------
//# notification_history - the LAST notification sent for each show
//# ------------------------------------------------------
export const notificationHistory = sqliteTable('notification_history', {
  showId: text('show_id')
    .primaryKey()
    .references(() => shows.id, { onDelete: 'cascade' }),
  season: integer('season').notNull(),
  episode: integer('episode').notNull(),
  dateSent: integer('date_sent'),
  dateChecked: integer('date_checked'),
  dateLastNotify: integer('date_last_notify'),
  text: text('text').notNull(),
  otherInfo: text('other_info'),
});

//# ------------------------------------------------------
//# app_meta - key/value bookkeeping for the database itself (e.g. legacy import marker)
//# ------------------------------------------------------
export const appMeta = sqliteTable('app_meta', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
});
