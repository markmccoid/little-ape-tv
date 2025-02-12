import React, { useCallback } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View, Dimensions } from 'react-native';
import { Link, Stack } from 'expo-router';
import { useAuth } from '~/authentication/AuthProvider';
import { savedShows$ } from '~/store/store-shows';
import { useShows } from '~/data/query.shows';
import Animated from 'react-native-reanimated';
import { SavedShow } from '~/store/functions-shows';
import ShowItem from './ShowItem';

const ShowsContainer = () => {
  const shows = useShows();

  const renderShow = useCallback(({ item }: { item: SavedShow }) => {
    return <ShowItem show={item} />;
  }, []);

  return (
    <>
      <Stack.Screen options={{ title: 'Shows' }} />
      <View className="flex-1">
        <Animated.FlatList
          data={shows}
          className="mx-[10]"
          // contentContainerClassName="flex-row justify-center flex-wrap border"
          keyExtractor={(item) => item.tmdbId}
          renderItem={renderShow}
          numColumns={2}
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
});
export default ShowsContainer;
