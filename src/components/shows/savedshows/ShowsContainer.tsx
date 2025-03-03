import React, { useCallback, useDeferredValue } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View, Dimensions } from 'react-native';
import { Link, Stack } from 'expo-router';
import { useAuth } from '~/authentication/AuthProvider';
import { savedShows$ } from '~/store/store-shows';
import { useShows } from '~/data/query.shows';
import Animated from 'react-native-reanimated';
import { SavedShow } from '~/store/functions-shows';
import ShowItem from './ShowItem';

const ShowsContainer = () => {
  const showsInit = useShows();
  // Defers the render of the shows.  Seems to let things like the filter screen update more smoothly
  const shows = useDeferredValue(showsInit); // Defers updates

  const renderShow = useCallback(({ item }: { item: SavedShow }) => {
    return <ShowItem show={item} />;
  }, []);

  return (
    <>
      <Stack.Screen options={{ title: 'Shows' }} />
      <View className="flex-1">
        <Animated.FlatList
          data={shows}
          className="px-[10] pt-[10]"
          columnWrapperClassName="flex-row justify-between flex-1"
          // contentContainerClassName="flex-row justify-center flex-wrap border"
          keyExtractor={(item) => item.tmdbId}
          renderItem={renderShow}
          numColumns={2}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </>
  );
};

export default ShowsContainer;
