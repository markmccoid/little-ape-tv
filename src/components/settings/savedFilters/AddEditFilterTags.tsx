import { View, Text } from 'react-native';
import React from 'react';

import TagCloudEnhanced, {
  TagItem as TagItemEnhanced,
} from '@/components/common/TagCloud/TagCloudEnhanced';
import { Tag } from '~/store/functions-tags';
import { use$ } from '@legendapp/state/react';
import { tags$ } from '~/store/store-shows';
import { TagStateArrays } from './useTagManagement';

export type TagState = {
  id: string;
  name: string;
  state: 'off' | 'include' | 'exclude';
};

// Sets up the state of the tags.  If editing a filter, it will merge the tags with the filter's tags
// otherwise it will just set the tags to "off"
const mergeTags = (tags: Tag[], initTags: TagStateArrays | undefined): TagState[] => {
  return tags.map((tag) => {
    let state: 'include' | 'exclude' | 'off' = 'off';
    if (!initTags) {
      return {
        id: tag.id,
        name: tag.name,
        state: state,
      };
    }
    if (initTags.includedTags.includes(tag.id)) {
      state = 'include';
    } else if (initTags.excludedTags.includes(tag.id)) {
      state = 'exclude';
    }
    return {
      id: tag.id,
      name: tag.name,
      state: state,
    };
  });
};

type Props = {
  tagFunctions: {
    addIncludedTag: (tag: string) => void;
    removeIncludedTag: (tag: string) => void;
    addExcludedTag: (tag: string) => void;
    removeExcludedTag: (tag: string) => void;
  };
  tagStateArrays?: TagStateArrays;
};
//# Tag Select for a Saved Filter
const SavedFilterTags = ({ tagFunctions, tagStateArrays }: Props) => {
  // Get list of all tags
  const tagList = use$(tags$.tagList);
  // If editing then initialize with passed tagStateArrays
  // const [mergedTags, setMergedTags] = React.useState<TagState[]>(
  //   mergeTags(tagList, tagStateArrays)
  // );
  const mergedTags = mergeTags(tagList, tagStateArrays);

  // // Update the tagState when the initTags change
  // React.useEffect(() => {
  //   //updated merged
  //   console.log('updateing merged tags/useEffect');
  //   setMergedTags(mergeTags(tagList, tagStateArrays));
  // }, [tagStateArrays]);

  const handleToggleTag = (tagId: string, newTagState: 'include' | 'exclude' | 'off') => {
    if (newTagState === 'include') tagFunctions.addIncludedTag(tagId);
    if (newTagState === 'exclude') tagFunctions.addExcludedTag(tagId);
    if (newTagState === 'off') {
      tagFunctions.removeIncludedTag(tagId);
      tagFunctions.removeExcludedTag(tagId);
    }
  };

  return (
    <View>
      <TagCloudEnhanced>
        {mergedTags.map((tag) => (
          <TagItemEnhanced
            key={tag.id}
            tagId={tag.id}
            tagName={tag.name}
            size="s"
            state={tag.state}
            onLongPress={handleToggleTag}
            onToggleTag={handleToggleTag}
            type="threestate"
          />
        ))}
      </TagCloudEnhanced>
    </View>
  );
};

export default SavedFilterTags;
