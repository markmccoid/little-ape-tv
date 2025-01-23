import { Observable } from '@legendapp/state';
import { authManager } from '~/authentication/AuthProvider';
import uuid from 'react-native-uuid';
import { setupPersistedObservable } from './persistUtil';

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

export let tags$: Observable<AllTags & AllTagsFunctions>;
// export let tagFunctions: AllTagsFunctions;
const initializeTags = () => {
  tags$ = setupPersistedObservable<AllTags & AllTagsFunctions>(
    { allTags: [], ...tagFunctions },
    { id: authManager?.currentUser?.id, name: 'alltags' }
  );
  // tagFunctions = createTagFunctions(tags$);
};

initializeTags();
authManager.subscribe(() => {
  initializeTags();
});
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
