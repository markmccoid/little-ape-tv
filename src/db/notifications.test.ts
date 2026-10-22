import { describe, expect, it } from '@jest/globals';

import {
  isDueForNotifyCheck,
  selectShowsDueForProviderCheck,
  markProvidersChecked,
  type NotifyCandidate,
} from './notifications';
import { insertShow } from './shows';
import { createTestDb } from './testing/createTestDb';

const DAY = 86400;
const NOW = 1_700_000_000;
const show = (overrides: Partial<NotifyCandidate> = {}): NotifyCandidate => ({
  id: '1',
  name: 'Andor',
  showStatus: 'Returning Series',
  nextAirDate: null,
  nextNotifyOffset: null,
  dateLastNotifyChecked: null,
  lastNotifySeasonEpisode: null,
  ...overrides,
});

describe('isDueForNotifyCheck', () => {
  it('skips ended, canceled and unknown-status shows', () => {
    expect(isDueForNotifyCheck(show({ showStatus: 'Ended' }), NOW)).toBe(false);
    expect(isDueForNotifyCheck(show({ showStatus: 'Canceled' }), NOW)).toBe(false);
    expect(isDueForNotifyCheck(show({ showStatus: null }), NOW)).toBe(false);
  });

  it('checks never-checked shows straight away', () => {
    expect(isDueForNotifyCheck(show(), NOW)).toBe(true);
  });

  it('waits the offset in days (default 1) after the last check', () => {
    expect(isDueForNotifyCheck(show({ dateLastNotifyChecked: NOW - DAY }), NOW)).toBe(true);
    expect(isDueForNotifyCheck(show({ dateLastNotifyChecked: NOW - DAY + 1 }), NOW)).toBe(false);
    const weekly = { dateLastNotifyChecked: NOW - 6 * DAY, nextNotifyOffset: 7 };
    expect(isDueForNotifyCheck(show(weekly), NOW)).toBe(false);
    expect(
      isDueForNotifyCheck(show({ ...weekly, dateLastNotifyChecked: NOW - 7 * DAY }), NOW)
    ).toBe(true);
  });
});

describe('selectShowsDueForProviderCheck', () => {
  it('returns shows never checked or last checked 10+ days ago', () => {
    const db = createTestDb().db;
    insertShow(db, { id: 'never', name: 'A' });
    insertShow(db, { id: 'old', name: 'B' });
    insertShow(db, { id: 'recent', name: 'C' });
    markProvidersChecked(db, 'old', NOW - 10 * DAY);
    markProvidersChecked(db, 'recent', NOW - 9 * DAY);
    expect(selectShowsDueForProviderCheck(db, NOW).sort()).toEqual(['never', 'old']);
  });
});
