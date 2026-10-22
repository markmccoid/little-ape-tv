import { View, Text, ScrollView } from 'react-native';
import React from 'react';
import { TVShowRecommendations } from '@markmccoid/tmdb_api';
import SearchItem from '~/components/search/SearchItem';
import { getDb } from '~/db/client';
import { selectSavedShowIds } from '~/db/shows';
import useImageSize from '~/utils/useImageSize';

type Props = {
  recommendations: TVShowRecommendations[] | undefined;
};
const tagRecommendations = (recommended: TVShowRecommendations[]) => {
  const savedShows = new Set(selectSavedShowIds(getDb()));
  return recommended.map((el) => {
    if (savedShows.has(el.id.toString())) {
      return {
        ...el,
        isStoredLocally: true,
      };
    }
    return {
      ...el,
      isStoredLocally: false,
    };
  });
};

//~ DetailRecommendations Component
const DetailRecommendations = ({ recommendations }: Props) => {
  const { imageHeight } = useImageSize(3);
  if (!recommendations) return <View style={{ height: imageHeight, marginBottom: 25 }} />;

  recommendations = tagRecommendations(recommendations);
  // console.log('In Recommendations');
  return (
    <View>
      <ScrollView horizontal contentContainerClassName="flex-row gap-2" className="p-2">
        {recommendations.map((el) => {
          return <SearchItem key={el.id} searchItem={el} numColumns={3} />;
        })}
      </ScrollView>
    </View>
  );
};

export default DetailRecommendations;
