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
  editTag: (tagId: string, newTagname: string) => void;
  removeTag: (tagId: string) => void;
  updateTagPositions: (tagIdOrder?: string[]) => void;
  matchTagIds: (
    tagIds: string[] | undefined
  ) => { id: string; name: string; state: 'include' | 'off' }[] | [];
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
  editTag: (tagId, newTagName) => {
    // const tagList = tags$.tagList.peek() || [];
    // let tagToEdit = tagList.find((tag) => tag.id === tagId);
    let index = 0;
    for (let tag of tags$.tagList.get()) {
      if (tag.id === tagId) {
        tags$.tagList[index].set({ ...tag, name: newTagName });
        break;
      }
      index++;
    }
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
  matchTagIds: (tagIds = []) => {
    // Take in a list of tags that are stored on a show
    // Return all of the tags with a new key called "state"
    // to tell if the tag is included or off for this show.
    const allTags = tags$.tagList.get() ?? [];
    return allTags
      .map((tag): { id: string; name: string; state: 'include' | 'off' } => {
        const item = tagIds.find((item) => item === tag.id);
        if (!item) return { id: tag.id, name: tag.name, state: 'off' };
        return { id: tag.id, name: tag.name, state: 'include' };
      })
      .filter((el) => el);
  },
  reset: () => {
    tags$.tagList.set([]);
    authManager.userStorage?.setItem('tags', []);
  },
});
