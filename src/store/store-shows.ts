import {
  Observable,
  observable,
  ObservableParam,
  ObservableSyncState,
  observe,
  syncState,
} from '@legendapp/state';
import { syncObservable } from '@legendapp/state/sync';
import { ObservablePersistMMKV } from '@legendapp/state/persist-plugins/mmkv';
import { authManager } from '~/authentication/AuthProvider';
import uuid from 'react-native-uuid';
import { MMKV } from 'react-native-mmkv';
import { setupPersistedObservable } from './persistUtil';

let currStorage = authManager.userStorage;

// export type Tag = {
//   id: string;
//   name: string;
//   position: number;
// };

// type Shows = {
//   id: string;
//   tmdbId: number;
//   title: string;
//   // string of tag ids
//   tags: string[];
// };

// const tagFunctions: Omit<AllTags, 'allTags' | 'name'> = {
//   addTag: (tagname) => {
//     const allTags = tags$.allTags.peek() || [];
//     const newTag = { id: uuid.v4(), name: tagname, position: allTags.length + 1 };
//     tags$.allTags.set([...allTags, newTag]);
//     currStorage?.setItem('tags', tags$.allTags.peek());
//   },
//   removeTag: (tagId) => {
//     const allTags = tags$.allTags.peek();
//     const newTags = allTags.filter((el) => el.id !== tagId);
//     tags$.allTags.set(newTags);
//     currStorage?.setItem('tags', newTags);
//   },
//   reset: () => {
//     tags$.allTags.set([]);
//     currStorage?.setItem('tags', []);
//   },
// };

// const initialize = () => {
//   tags$ = observable<AllTags>({
//     name: 'Mark',
//     allTags: [],
//     ...tagFunctions,
//   });
//   const customMMKVConfig = new ObservablePersistMMKV({ id: `${authManager?.currentUser?.id}` });
//   syncObservable(tags$.allTags, {
//     persist: {
//       plugin: customMMKVConfig,
//       name: 'alltags',
//       options: {},
//     },
//   });
//   syncObservable(tags$.name, {
//     persist: {
//       plugin: customMMKVConfig,
//       name: 'tagname',
//       options: {},
//     },
//   });
//   observe(() => {
//     console.log(`OBSERVED TAGS-${authManager?.currentUser?.name}`, tags$.allTags.peek());
//   });
// };

//! Thoughts to tighten up the code:

// type AllTags = {
//   name: string;
//   allTags: Tag[];
// };

// type AllTagsFunctions = {
//   addTag: (tagname: string) => void;
//   removeTag: (tagId: string) => void;
//   reset: () => void;
// };

// export let tags$: Observable<AllTags>;
// export let tagFunctions: AllTagsFunctions;
// const initialize2 = () => {
//   tags$ = setupPersistedObservable<AllTags>(
//     { name: 'Mark', allTags: [] },
//     { id: authManager?.currentUser?.id, name: 'alltags' }
//   );
//   tagFunctions = createTagFunctions(tags$);
// };

// initialize2();
// authManager.subscribe(() => {
//   initialize2();
// });
