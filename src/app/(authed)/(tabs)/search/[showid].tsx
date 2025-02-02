import { View, Text } from 'react-native';
import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import ShowDetailContainer from '~/components/shows/details/ShowDetailContainer';

const SearchShowDetailRoute = () => {
  const { showId } = useLocalSearchParams();

  return (
    <View>
      <Text>ShowID = {showId}</Text>
      <ShowDetailContainer showId={parseInt(showId)} />
    </View>
  );
};

export default SearchShowDetailRoute;
