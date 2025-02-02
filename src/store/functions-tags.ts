import { authManager } from '~/authentication/AuthProvider';
import uuid from 'react-native-uuid';
import { Observable } from '@legendapp/state';

//##########################
//## SETUP TYPES -------------
//##########################
export type Tag = {
  id: string;
  name: string;
  position: number;
};

export type AllTags = {
  tagList: Tag[];
};
export type TagFunctions = {
  addTag: (tagname: string) => void;
  removeTag: (tagId: string) => void;
  reset: () => void;
};

//##########################
//## SETUP FUNCTIONS -------------
//##########################
export const createTagFunctions = (
  tags$: Observable<
    {
      tagList: Tag[];
    } & TagFunctions
  >
): TagFunctions => ({
  addTag: (tagname) => {
    const tagList = tags$.tagList.peek() || [];
    const newTag = { id: uuid.v4(), name: tagname, position: tagList.length + 1 };
    tags$.tagList.set([...tagList, newTag]);
    authManager.userStorage?.setItem('tags', tags$.tagList.peek());
  },
  removeTag: (tagId) => {
    const tagList = tags$.tagList.peek();
    const newTags = tagList.filter((el) => el.id !== tagId);
    tags$.tagList.set(newTags);
    authManager.userStorage?.setItem('tags', tags$.tagList.peek());
  },
  reset: () => {
    tags$.tagList.set([]);
    authManager.userStorage?.setItem('tags', []);
  },
});
