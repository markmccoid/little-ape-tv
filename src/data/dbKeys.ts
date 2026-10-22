import type { ShowListCriteria } from '~/db/showList';

//~ React Query keys for SQLite-backed data.  Writes invalidate dbKeys.all.
export const dbKeys = {
  all: ['db'] as const,
  showList: (criteria: ShowListCriteria) => ['db', 'showList', criteria] as const,
  show: (showId: string) => ['db', 'show', showId] as const,
  seasonSummaries: (showId: string) => ['db', 'seasonSummaries', showId] as const,
  episodeStates: (showId: string) => ['db', 'episodeStates', showId] as const,
  savedShowPosters: () => ['db', 'savedShowPosters'] as const,
  genres: () => ['db', 'genres'] as const,
  tags: () => ['db', 'tags'] as const,
  notificationHistory: () => ['db', 'notificationHistory'] as const,
};
