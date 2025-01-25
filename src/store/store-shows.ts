import { authManager } from '~/authentication/AuthProvider';
import uuid from 'react-native-uuid';
import { createAndPersistObservable } from './createPersistedStore';

export type Show = {
  showId: string;
  name: string;
  tags?: string[];
};

type Shows = { shows: Show[] };
type ShowFunctions = {
  addShow: (showId: string, name: string, tags: string[]) => void;
  removeShow: (showId: string) => void;
  reset: () => void;
};

const showFunctions: ShowFunctions = {
  addShow: (showId, name, tags) => {
    const shows = shows$.shows.peek() || [];
    const newShow = { showId, name, tags };
    shows$.shows.set([...shows, newShow]);
  },
  removeShow: (showId) => {
    const shows = shows$.shows.peek();
    const newShows = shows.filter((el) => el.showId !== showId);
    shows$.shows.set(newShows);
  },
  reset: () => {
    shows$.shows.set([]);
  },
};

const initialState = {
  shows: [],
  ...showFunctions,
};
const options = { id: authManager?.currentUser?.id, name: 'shows' };
export let shows$ = createAndPersistObservable<Shows & ShowFunctions>({ ...initialState }, options);

authManager.subscribe(() => {
  // Recreate and persist a new observable when auth changes
  shows$ = createAndPersistObservable<Shows & ShowFunctions>({ ...initialState }, options);
});
