import { View, Text, Dimensions, Pressable } from 'react-native';
import React from 'react';
import { Image } from 'expo-image';
import { SavedShow } from '~/store/functions-shows';
import { Link } from 'expo-router';
import { savedShows$ } from '~/store/store-shows';
import Animated, { FadeIn, FadeOutLeft } from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');
const MARGIN = 10;
const IMG_WIDTH = (width - MARGIN * 3) / 2;
const IMG_HEIGHT = IMG_WIDTH * 1.5;

type Props = {
  show: SavedShow;
};
const ShowItem = ({ show }: Props) => {
  return (
    <Animated.View className="mr-[10]" exiting={FadeOutLeft} entering={FadeIn}>
      <Image source={show.posterURL} style={{ width: IMG_WIDTH, height: IMG_HEIGHT }} />
      <Text className="dark:text-white">{show.name}</Text>
      <Link
        href={{
          pathname: '/[showid]',
          params: { showid: show.tmdbId },
        }}>
        <Text className="dark:text-white">DETAIL</Text>
      </Link>
      <Pressable
        onPress={() => savedShows$.removeShow(show.tmdbId)}
        className="rounded-md border p-1">
        <Text className="dark:text-white">Delete</Text>
      </Pressable>
    </Animated.View>
  );
};

export default ShowItem;
