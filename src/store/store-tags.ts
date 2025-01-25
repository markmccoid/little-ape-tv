import { authManager } from '~/authentication/AuthProvider';
import uuid from 'react-native-uuid';
import { createAndPersistObservable } from './createPersistedStore';

//##########################
//## SETUP TYPES -------------
//##########################
export type Tag = {
  id: string;
  name: string;
  position: number;
};

type AllTags = {
  allTags: Tag[];
};
type AllTagsFunctions = {
  addTag: (tagname: string) => void;
  removeTag: (tagId: string) => void;
  reset: () => void;
};

//##########################
//## SETUP FUNCTIONS -------------
//##########################
const tagFunctions: AllTagsFunctions = {
  addTag: (tagname) => {
    const allTags = tags$.allTags.peek() || [];
    const newTag = { id: uuid.v4(), name: tagname, position: allTags.length + 1 };
    tags$.allTags.set([...allTags, newTag]);
  },
  removeTag: (tagId) => {
    const allTags = tags$.allTags.peek();
    const newTags = allTags.filter((el) => el.id !== tagId);
    tags$.allTags.set(newTags);
  },
  reset: () => {
    tags$.allTags.set([]);
  },
};

//##########################
//## SETUP OBSERVABLE -------------
//##########################
//~ Start by setting the initial state.  This will be the actual keys that are persisted
//. which is all but the functions
const initialState = { allTags: [], ...tagFunctions };
// Setup Options -> id = the mmkv id, here the current user's id
//                  name = the key name to store the data under
const options = { id: authManager?.currentUser?.id, name: 'alltags' };
// Create the observable
export let tags$ = createAndPersistObservable<AllTags & AllTagsFunctions>(
  { ...initialState },
  options
);
// Auth change
authManager.subscribe(() => {
  // Recreate and persist a new observable when auth changes
  tags$ = createAndPersistObservable<AllTags & AllTagsFunctions>({ ...initialState }, options);
});
