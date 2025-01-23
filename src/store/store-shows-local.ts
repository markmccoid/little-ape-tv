import { Observable, observable, ObservableSyncState, observe } from '@legendapp/state';
import { syncObservable } from '@legendapp/state/sync';
import { ObservablePersistMMKV } from '@legendapp/state/persist-plugins/mmkv';
import { authManager } from '~/authentication/AuthProvider';
import uuid from 'react-native-uuid';
import { MMKV } from 'react-native-mmkv';

let currStorage = authManager.userStorage;

export type Tag = {
  id: string;
  name: string;
  position: number;
};

type Shows = {
  id: string;
  tmdbId: number;
  title: string;
  // string of tag ids
  tags: string[];
};

type AllTags = {
  allTags: Tag[];
  addTag: (tagname: string) => void;
  removeTag: (tagId: string) => void;
  reset: () => void;
};

export const tags$ = observable<AllTags>({
  allTags: [],
  addTag: (tagname) => {
    const allTags = tags$.allTags.peek() || [];

    const newTag = { id: uuid.v4(), name: tagname, position: allTags.length + 1 };
    tags$.allTags.set([...allTags, newTag]);
    // currStorage?.setItem('tags', tags$.allTags.peek());

    // console.log('MMKV ID', currStorage?.getItem('mmkvid'));
  },
  removeTag: (tagId) => {
    const allTags = tags$.allTags.peek();
    const newTags = allTags.filter((el) => el.id !== tagId);
    tags$.allTags.set(newTags);
    // currStorage?.setItem('tags', newTags);
  },
  reset: () => {
    tags$.allTags.set([]);
    // currStorage?.setItem('tags', []);
  },
});

let unsubscribeAuth: (() => void) | undefined;
observe(() => {
  console.log(`Tags being observer-${authManager?.currentUser?.name}`, tags$.allTags.peek());
});

// Need to maintain a variable for the LAST currrent user id
// so that on a change we know we are switching to a different user
let currentUserId = authManager?.currentUser?.id || 'placeholder';
const initialize = () => {
  currStorage = authManager.userStorage;

  const allTags = currStorage?.getItem('tags');
  console.log('ALLTAGS', allTags, authManager.currentUser?.name);

  tags$.allTags.set(allTags);

  console.log('INIT onAuthChange store-shows', allTags);
};
initialize();
// Setup the subscription
unsubscribeAuth = authManager.subscribe(() => {
  // onAuthChange();
  initialize();
  // }
  console.log('SUB CALL onAuthChange store-shows');

  // if (authManager?.currentUser?.id) {
  //   onAuthChange();
  // } else {
  //   tags$.reset();
  // }
});

console.log('STORE_SHOW LOAD', authManager?.currentUser?.id);

const showState$ = observable({});
