import { and, asc, eq, isNotNull, isNull, sql, type SQL } from 'drizzle-orm';
import { getTableColumns } from 'drizzle-orm';

import { seasonSummaries, showGenres, shows, showTags, showWatchProviders } from './schema';
import type { Db, SeasonSummaryRow, ShowRow } from './types';

//~ -----------------------------------------------
//~ Filtered + sorted list of Saved Shows for the library screen.
//~ Filter meaning (unchanged from the Legend State version):
//~  - include tags / genres: show must have ALL of them
//~  - exclude tags / genres: show must have NONE of them
//~  - watch providers: show must have ANY of them
//~  - name search with ignoreOtherFilters: only the name is matched
//~ -----------------------------------------------
export type InclusionFilter = 'off' | 'include' | 'exclude';

export type ShowListSort = {
  sortField: string;
  sortDirection: 'asc' | 'desc';
  active: boolean;
  position: number;
};

export type ShowListCriteria = {
  showName?: string;
  ignoreOtherFilters?: boolean;
  includeTags?: string[];
  excludeTags?: string[];
  includeGenres?: string[];
  excludeGenres?: string[];
  includeWatchProviders?: number[];
  filterIsFavorited?: InclusionFilter;
  filterIsAllWatched?: InclusionFilter;
  sort?: ShowListSort[];
};

export type ShowListItem = ShowRow & {
  tagIds: string[];
  // Season Summary per season, season 0 (specials) excluded, ordered by season
  seasonSummaries: SeasonSummaryRow[];
};

//# ------------------------------------------------------
//# selectShowList
//# ------------------------------------------------------
export const selectShowList = (db: Db, criteria: ShowListCriteria): ShowListItem[] => {
  const rows = db
    .select({
      ...getTableColumns(shows),
      tagIdsJson: sql<string>`(select json_group_array(${showTags.tagId}) from ${showTags} where ${showTags.showId} = ${shows.id})`,
      seasonsJson: sql<string>`(select json_group_array(json_object('season', ${seasonSummaries.season}, 'totalEpisodes', ${seasonSummaries.totalEpisodes}, 'watched', ${seasonSummaries.watched}, 'downloaded', ${seasonSummaries.downloaded}, 'favorited', ${seasonSummaries.favorited})) from ${seasonSummaries} where ${seasonSummaries.showId} = ${shows.id} and ${seasonSummaries.season} > 0)`,
    })
    .from(shows)
    .where(buildWhere(criteria))
    .orderBy(...buildOrderBy(criteria.sort ?? []))
    .all();

  return rows.map(({ tagIdsJson, seasonsJson, ...show }) => ({
    ...show,
    tagIds: JSON.parse(tagIdsJson) as string[],
    seasonSummaries: (JSON.parse(seasonsJson) as SeasonSummaryRow[]).sort(
      (a, b) => a.season - b.season
    ),
  }));
};

//# ------------------------------------------------------
//# WHERE
//# ------------------------------------------------------
export const buildWhere = (criteria: ShowListCriteria): SQL | undefined => {
  const name = criteria.showName?.trim();
  const nameCondition = name
    ? sql`${shows.name} LIKE ${`%${escapeLike(name)}%`} ESCAPE '\\'`
    : undefined;

  if (name && criteria.ignoreOtherFilters) return nameCondition;

  const includeTags = unique(criteria.includeTags);
  const excludeTags = unique(criteria.excludeTags);
  const includeGenres = unique(criteria.includeGenres);
  const excludeGenres = unique(criteria.excludeGenres);
  const providers = unique(criteria.includeWatchProviders);

  const conditions: (SQL | undefined)[] = [nameCondition];

  if (includeTags.length) {
    conditions.push(
      sql`(select count(*) from ${showTags} where ${showTags.showId} = ${shows.id} and ${showTags.tagId} in ${includeTags}) = ${includeTags.length}`
    );
  }
  if (excludeTags.length) {
    conditions.push(
      sql`not exists (select 1 from ${showTags} where ${showTags.showId} = ${shows.id} and ${showTags.tagId} in ${excludeTags})`
    );
  }
  if (includeGenres.length) {
    conditions.push(
      sql`(select count(*) from ${showGenres} where ${showGenres.showId} = ${shows.id} and ${showGenres.genre} in ${includeGenres}) = ${includeGenres.length}`
    );
  }
  if (excludeGenres.length) {
    conditions.push(
      sql`not exists (select 1 from ${showGenres} where ${showGenres.showId} = ${shows.id} and ${showGenres.genre} in ${excludeGenres})`
    );
  }
  if (providers.length) {
    conditions.push(
      sql`exists (select 1 from ${showWatchProviders} where ${showWatchProviders.showId} = ${shows.id} and ${showWatchProviders.providerId} in ${providers})`
    );
  }

  if (criteria.filterIsFavorited === 'include') conditions.push(isNotNull(shows.favoritedAt));
  if (criteria.filterIsFavorited === 'exclude') conditions.push(isNull(shows.favoritedAt));
  if (criteria.filterIsAllWatched === 'include') conditions.push(eq(shows.allWatched, true));
  if (criteria.filterIsAllWatched === 'exclude') conditions.push(eq(shows.allWatched, false));

  return and(...conditions);
};

//# ------------------------------------------------------
//# ORDER BY - empty values always sort last, whatever the direction
//# ------------------------------------------------------
const SORT_COLUMNS: Record<string, SQL> = {
  dateAddedEpoch: sql`${shows.dateAdded}`,
  userRating: sql`${shows.userRating}`,
  name: sql`${shows.name} COLLATE NOCASE`,
  avgEpisodeRunTime: sql`${shows.avgEpisodeRunTime}`,
  sortNextDLDate: sql`${shows.nextDlAirDate}`,
};

export const buildOrderBy = (sort: ShowListSort[]): SQL[] => {
  const orderBy = [...sort]
    .filter((field) => field.active && SORT_COLUMNS[field.sortField])
    .sort((a, b) => a.position - b.position)
    .map(
      (field) =>
        sql`${SORT_COLUMNS[field.sortField]} ${sql.raw(field.sortDirection === 'desc' ? 'DESC' : 'ASC')} NULLS LAST`
    );
  // Stable order for ties
  return [...orderBy, asc(shows.id)];
};

//# -------------------------------------------------
//# Helpers
//# -------------------------------------------------
const unique = <T>(values: T[] | undefined) => Array.from(new Set(values ?? []));

const escapeLike = (value: string) => value.replace(/[\\%_]/g, (char) => `\\${char}`);
