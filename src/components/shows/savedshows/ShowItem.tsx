import { View, Text, Dimensions, Pressable } from 'react-native';
import React from 'react';
import { Image } from 'expo-image';
import { SavedShow } from '~/store/functions-shows';
import { Link, router } from 'expo-router';
import { savedShows$ } from '~/store/store-shows';
import Animated, { FadeIn, FadeOutLeft } from 'react-native-reanimated';
import SearchItemButtonAnim from '~/components/search/SearchItemButtonAnim';
import ShowItemBottom from './ShowItemBottom';
const missingPosterURI = require('../../../../assets/missingPoster.png');

const { width, height } = Dimensions.get('window');
const MARGIN = 10;
const IMG_WIDTH = (width - MARGIN * 3) / 2;
const IMG_HEIGHT = IMG_WIDTH * 1.5;

type Props = {
  show: SavedShow;
};
const ShowItem = ({ show }: Props) => {
  return (
    <Animated.View className="mb-[25]" exiting={FadeOutLeft} entering={FadeIn}>
      {/* <Link href={{ pathname: `/[showid]`, params: { showid: searchItem.id }, key={searchItem.id} }}> */}
      <Pressable
        onPress={() => router.push({ pathname: `/[showid]`, params: { showid: show.tmdbId } })}
        className="rounded-lg border-green-600 active:border-hairline">
        <View
          style={{
            width: IMG_WIDTH,
          }}
          className="overflow-hidden rounded-lg border-hairline">
          <Image
            source={show.posterURL || missingPosterURI}
            contentFit="cover"
            style={{ width: IMG_WIDTH, height: IMG_HEIGHT }}
          />
        </View>
      </Pressable>
      {/* Future Home of dynamic Info screen.  Maybe button (circle) in corner of image when long press
          reveals more info screen */}
      <ShowItemBottom show={show} />
    </Animated.View>
  );
};

export default ShowItem;
