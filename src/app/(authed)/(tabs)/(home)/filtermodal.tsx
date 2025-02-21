import { View, Text, Pressable } from 'react-native';
import React from 'react';

import { use$ } from '@legendapp/state/react';
import TagCloudEnhanced, { TagItem } from '~/components/common/TagCloud/TagCloudEnhanced';
import GenreCloudEnhanced, { GenreItem } from '~/components/common/TagCloud/GenreCloudEnhanced';
import { fcUpdateGenres, fcUpdateTags, getFilterTags } from '~/store/store-filterCriteria';
import { genres$ } from '~/store/store-genres';

const FilterModal = () => {
  const tagList = getFilterTags();
  const genreList = use$(genres$.genreList);
  console.log('GENRE', genreList || []);
  return (
    <View>
      <Text>FilterModal</Text>
      <TagCloudEnhanced>
        {tagList.map((tag) => (
          <TagItem
            size="sm"
            tagId={tag.id}
            tagName={tag.name}
            onToggleTag={(tagId, newState) => fcUpdateTags(tagId, newState)}
            state={tag.state}
            onLongPress={(tagId, newState) => fcUpdateTags(tagId, newState)}
            type="threestate"
            key={tag.id}
          />
        ))}
      </TagCloudEnhanced>
      <View />
      <GenreCloudEnhanced>
        {genreList.map((genre) => (
          <GenreItem
            size="sm"
            tagId={genre}
            tagName={genre}
            onToggleTag={(genre, newState) => fcUpdateGenres(genre, newState)}
            state={'off'}
            onLongPress={(genre, newState) => fcUpdateGenres(genre, newState)}
            // type="threestate"
            key={genre}
          />
        ))}
      </GenreCloudEnhanced>
    </View>
  );
};

export default FilterModal;
