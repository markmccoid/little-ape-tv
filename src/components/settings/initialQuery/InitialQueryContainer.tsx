import { View, Text, ScrollView } from 'react-native';
import React from 'react';
import ShadowBackground from '~/components/common/ShadowBackground';
import FirstAirDate from './FirstAirDate';
import { queryClient } from '~/utils/queryClient';
import InitQueryGenres from './InitQueryGenres';

const InitialQueryContainer = () => {
  const invalidateSearchQuery = () => {
    queryClient.invalidateQueries({ queryKey: ['searchByTitle', 'discover'] });
  };
  return (
    <View className="flex-1">
      <View className="mx-2 mt-2 bg-slate-200 p-2">
        <ShadowBackground />
        <Text>
          Choose the initial filters for your TV show search, such as genre, rating, or streaming
          service. These settings will apply when you first open the search screen, showing you a
          tailored list of shows before you enter a specific title.
        </Text>
      </View>

      <ScrollView className="mx-2 mt-2 flex-1">
        {/* Genres, Providers, first Air Date */}
        <FirstAirDate invalidateQuery={invalidateSearchQuery} />
        <InitQueryGenres invalidateQuery={invalidateSearchQuery} />
      </ScrollView>
    </View>
  );
};

export default InitialQueryContainer;
