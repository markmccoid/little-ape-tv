import { View, Text, Pressable } from 'react-native';
import React, { useEffect } from 'react';
import {
  fcUpdateTagsGenres,
  filterCriteria$,
  getFilterTags,
  useFilterTags,
} from '~/store/store-filterCriteria';
import TagCloudEnhanced, { TagItem } from '~/components/common/TagCloud/TagCloudEnhanced';
import { EraserIcon } from '~/components/common/Icons';
import { use$ } from '@legendapp/state/react';

const TagFilter = () => {
  const tagList = useFilterTags();

  return (
    <View className="mx-2 my-2 rounded-xl border-hairline border-border bg-card px-2 py-1">
      <View className=" flex-row justify-between">
        <Text className="text-xl font-semibold">Tag Filter</Text>
        <Pressable onPress={filterCriteria$.actionClearTags} className="px-2">
          <EraserIcon />
        </Pressable>
      </View>
      <TagCloudEnhanced>
        {tagList.map((tag) => (
          <TagItem
            size="sm"
            tagId={tag.id}
            tagName={tag.name}
            onToggleTag={(tagId, newState) => fcUpdateTagsGenres(tagId, newState, 'tags')}
            state={tag.state}
            onLongPress={(tagId, newState) => fcUpdateTagsGenres(tagId, newState, 'tags')}
            type="threestate"
            key={tag.id}
          />
        ))}
      </TagCloudEnhanced>
    </View>
  );
};

export default TagFilter;
