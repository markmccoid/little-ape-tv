import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View, Dimensions } from 'react-native';
import { Stack } from 'expo-router';
import { useAuth } from '~/authentication/AuthProvider';
import { savedShows$ } from '~/store/store-shows';
import { useShows } from '~/data/query.shows';
import Animated from 'react-native-reanimated';
import { Image } from 'expo-image';

const { width, height } = Dimensions.get('window');
const MARGIN = 10;
const IMG_WIDTH = (width - MARGIN * 3) / 2;
const IMG_HEIGHT = IMG_WIDTH * 1.5;
const ShowsContainer = () => {
  const shows = useShows();
  return (
    <>
      <Stack.Screen options={{ title: 'Shows' }} />
      <View className="flex-1">
        <FlatList
          data={shows}
          className="mx-[10]"
          // contentContainerClassName="flex-row justify-center flex-wrap border"
          keyExtractor={(item) => item.tmdbId}
          renderItem={({ item }) => (
            <View className="mr-[10]">
              <Image source={item.posterURL} style={{ width: IMG_WIDTH, height: IMG_HEIGHT }} />
              <Text>{item.name}</Text>

              <Pressable
                onPress={() => savedShows$.removeShow(item.tmdbId)}
                className="rounded-md border p-1">
                <Text>Delete</Text>
              </Pressable>
            </View>
          )}
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
