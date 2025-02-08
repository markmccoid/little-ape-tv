import { View, Text } from 'react-native';
import React, { useLayoutEffect } from 'react';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import ShowDetailContainer from '~/components/shows/details/ShowDetailContainer';
import { savedShows$ } from '~/store/store-shows';
import { NativeStackNavigationOptions } from '@react-navigation/native-stack';

const ShowIdHome = () => {
  const { showId } = useLocalSearchParams();
  const navigation = useNavigation();
  const show = savedShows$.shows[showId as string].get();
  console.log('SHOW', show);

  return (
    <View>
      <Text>ShowIdHome - {show.name}</Text>
      <ShowDetailContainer showId={showId} />
    </View>
  );
};

export default ShowIdHome;
