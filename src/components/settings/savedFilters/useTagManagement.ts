import { useReducer } from 'react';

// Define the state type
export interface TagStateArrays {
  includedTags: string[];
  excludedTags: string[];
}

// Define the action types
type Action =
  | { type: 'addInc'; payload: string }
  | { type: 'removeInc'; payload: string }
  | { type: 'addExc'; payload: string }
  | { type: 'removeExc'; payload: string };

// Define the reducer function
const tagReducer = (state: TagStateArrays, action: Action): TagStateArrays => {
  switch (action.type) {
    case 'addInc': {
      const tagToAdd = action.payload;

      // If already in includedTags, do nothing
      if (state.includedTags.includes(tagToAdd)) {
        return state;
      }

      // If in excludedTags, remove it first
      const newExcludedTags = state.excludedTags.filter((tag) => tag !== tagToAdd);

      // Add to includedTags
      return {
        ...state,
        includedTags: [...state.includedTags, tagToAdd],
        excludedTags: newExcludedTags,
      };
    }
    case 'removeInc': {
      const tagToRemove = action.payload;
      return {
        ...state,
        includedTags: state.includedTags.filter((tag) => tag !== tagToRemove),
      };
    }
    case 'addExc': {
      const tagToAdd = action.payload;

      // If already in excludedTags, do nothing
      if (state.excludedTags.includes(tagToAdd)) {
        return state;
      }

      // If in includedTags, remove it first
      const newIncludedTags = state.includedTags.filter((tag) => tag !== tagToAdd);

      // Add to excludedTags
      return {
        ...state,
        excludedTags: [...state.excludedTags, tagToAdd],
        includedTags: newIncludedTags,
      };
    }
    case 'removeExc': {
      const tagToRemove = action.payload;
      return {
        ...state,
        excludedTags: state.excludedTags.filter((tag) => tag !== tagToRemove),
      };
    }
    default:
      return state; // crucial: always return state in the default case.
  }
};

// Custom hook to use the reducer
export const useTagManagement = ({ includedTags, excludedTags }: Partial<TagStateArrays>) => {
  const initialState: TagStateArrays = {
    includedTags: includedTags || [],
    excludedTags: excludedTags || [],
  };

  const [state, dispatch] = useReducer(tagReducer, initialState);
  const addIncludedTag = (tag: string) => {
    // console.log('State Array', state);
    dispatch({ type: 'addInc', payload: tag });
  };

  const removeIncludedTag = (tag: string) => {
    dispatch({ type: 'removeInc', payload: tag });
  };

  const addExcludedTag = (tag: string) => {
    dispatch({ type: 'addExc', payload: tag });
  };

  const removeExcludedTag = (tag: string) => {
    dispatch({ type: 'removeExc', payload: tag });
  };

  return {
    state,
    addIncludedTag,
    removeIncludedTag,
    addExcludedTag,
    removeExcludedTag,
  };
};
