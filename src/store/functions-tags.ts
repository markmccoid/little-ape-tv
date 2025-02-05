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
  updateTagPositions: (tagIdOrder?: string[]) => void;
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
    tags$.updateTagPositions();
  },
  updateTagPositions: (tagIdOrder) => {
    const tags = tags$.tagList.peek();
    let updatedTags: Tag[] = [];
    if (tagIdOrder) {
      updatedTags = tagIdOrder
        .map((id, index) => {
          const tag = tags.find((tag) => tag.id === id);
          if (tag) {
            return { ...tag, position: index + 1 }; // Update position (starting from 1)
          } else {
            console.warn(`Tag with ID ${id} not found in the original tags array.`);
            return null; // Or handle the missing tag as appropriate for your application
          }
        })
        .filter((tag) => tag !== null); // Remove any nulls caused by missing IDs
    } else {
      //if no tagIdOrder array, just update the positions
      updatedTags = tags.map((tag, index) => {
        return { ...tag, position: index + 1 };
      });
    }
    tags$.tagList.set(updatedTags);
    authManager.userStorage?.setItem('tags', tags$.tagList.peek());
  },
  reset: () => {
    tags$.tagList.set([]);
    authManager.userStorage?.setItem('tags', []);
  },
});
