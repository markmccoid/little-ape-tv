import { dbKeys } from './dbKeys';

import { exportDatabase, restoreDatabase, type DatabaseBackup } from '~/db/backup';
import { getDb } from '~/db/client';
import {
  exportFilterCriteria,
  importFilterCriteria,
  type SavedFilter,
} from '~/store/store-filterCriteria';
import { settings$, type Settings } from '~/store/store-settings';
import { queryClient } from '~/utils/queryClient';

//~ -----------------------------------------------
//~ v2 backup file: the SQLite show data plus settings and Saved Filters.
//~ v1 files (the old Legend State export) are not accepted.
//~ -----------------------------------------------
export const BACKUP_VERSION = 2;

// The background run log is a diagnostic for this device, so it is not backed up.
// notificationHistory is the pre-SQLite copy still sitting in the persisted settings
// (read by the legacy re-import until it is removed); history now lives in the database.
const EXCLUDED_SETTINGS = ['backgroundRunLog', 'notificationHistory'];
type BackupSettings = Omit<Settings, 'backgroundRunLog'>;

const pickBackupSettings = (settings: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(settings).filter(([key]) => !EXCLUDED_SETTINGS.includes(key))
  ) as BackupSettings;

export type BackupFile = {
  app: 'little-ape-tv';
  version: typeof BACKUP_VERSION;
  exportedAt: string;
  settings: BackupSettings;
  savedFilters: SavedFilter[];
  data: DatabaseBackup;
};

export const createBackup = (): BackupFile => {
  const settings = pickBackupSettings(settings$.peek());
  return {
    app: 'little-ape-tv',
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    settings,
    savedFilters: exportFilterCriteria().savedFilters,
    data: exportDatabase(getDb()),
  };
};

export const backupFileName = () =>
  `little-ape-tv-backup-${new Date().toISOString().slice(0, 10)}.json`;

//~ Replaces all show data, settings and Saved Filters with the backup's.
//~ The show data is restored first, in one transaction, so a bad file changes nothing.
export const restoreBackup = (file: unknown) => {
  const backup = file as Partial<BackupFile> | undefined;
  if (backup?.version !== BACKUP_VERSION || !backup.data) {
    throw new Error(
      backup?.version
        ? `Backup version ${backup.version} is not supported (expected ${BACKUP_VERSION}).`
        : 'This is not a v2 Little Ape TV backup.'
    );
  }
  const counts = restoreDatabase(getDb(), backup.data);
  if (backup.settings) {
    settings$.set({ ...settings$.peek(), ...pickBackupSettings(backup.settings) });
  }
  if (backup.savedFilters) importFilterCriteria({ savedFilters: backup.savedFilters });
  queryClient.invalidateQueries({ queryKey: dbKeys.all });
  return counts;
};
