import { MMKV } from 'react-native-mmkv';

import type { Db } from '../types';
import { importLegacyDataOnce, reimportLegacyData, type LegacyData } from './importLegacyData';

//!! -------------------------------------------------------
//!! ONE-TIME move of the Legend State / MMKV show data into SQLite.
//!! Throwaway: delete this folder once it has run on every device.
//!! The MMKV keys are left in place as a fallback.
//!! -------------------------------------------------------

//~ Legend's ObservablePersistMMKV stores each observable as JSON under its `name`,
//~ in the MMKV instance whose id is the user id (see store-shows.ts / store-settings.ts)
const readLegacyMMKV = (userId: string): LegacyData => {
  const storage = new MMKV({ id: userId });
  const read = (key: string) => {
    const value = storage.getString(key);
    return value ? JSON.parse(value) : undefined;
  };

  return {
    savedShows: read('savedshows'),
    tags: read('tags'),
    notificationHistory: read('settings')?.notificationHistory,
  };
};

export const migrateFromMMKV = (db: Db, userId: string) => {
  const counts = importLegacyDataOnce(db, () => readLegacyMMKV(userId));
  if (counts) console.log('[db] Imported legacy MMKV data', counts);
};

//~ Replace the SQLite show data with whatever is in the old store now
export const reimportFromMMKV = (db: Db, userId: string) => {
  const counts = reimportLegacyData(db, () => readLegacyMMKV(userId));
  console.log('[db] Re-imported legacy MMKV data', counts);
  return counts;
};
