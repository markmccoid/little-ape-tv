import { View, Text, Pressable } from 'react-native';
import React from 'react';
import { fcUpdateTagsGenres, filterCriteria$, useFilterGenres } from '~/store/store-filterCriteria';
import GenreCloudEnhanced, { GenreItem } from '~/components/common/TagCloud/GenreCloudEnhanced';
import { EraserIcon } from '~/components/common/Icons';

const GenreFilter = () => {
  const genreList = useFilterGenres();

  return (
    <View className="mx-2 rounded-xl border-hairline border-border bg-card px-2 py-1">
      <View className=" flex-row justify-between">
        <Text className="text-xl font-semibold">Genre Filter</Text>
        <Pressable onPress={filterCriteria$.actionClearGenres} className="px-2">
          <EraserIcon />
        </Pressable>
      </View>
      <GenreCloudEnhanced>
        {genreList.map((genre) => (
          <GenreItem
            size="sm"
            tagId={genre.genre}
            tagName={genre.genre}
            onToggleTag={(genre, newState) => fcUpdateTagsGenres(genre, newState, 'genres')}
            state={genre.state}
            onLongPress={(genre, newState) => fcUpdateTagsGenres(genre, newState, 'genres')}
            // type="threestate"
            key={genre.genre}
          />
        ))}
      </GenreCloudEnhanced>
    </View>
  );
};

export default GenreFilter;
