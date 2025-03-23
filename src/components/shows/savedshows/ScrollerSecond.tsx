import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Image } from 'expo-image';
import Animated, {
  Extrapolation,
  FadeIn,
  FadeOut,
  interpolate,
  SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { SavedShow } from '~/store/functions-shows';
import dayjs from 'dayjs';
import { useSavedSeasonSummary } from '~/store/functions-showAttributes';
import { useRouter } from 'expo-router';
const missingPosterURI = require('../../../../assets/missingPoster.png');

type Props = {
  show: SavedShow;
  imageWidth: number;
  imageHeight: number;
  index: number;
  scrollX: SharedValue<number>;
};
const ScrollerSecond = ({ show, imageWidth, imageHeight, index, scrollX }: Props) => {
  const seasonsSummary = useSavedSeasonSummary(show.tmdbId);
  const router = useRouter();

  const animStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: interpolate(
            scrollX.value,
            [index - 1, index, index + 1],
            [0.5, 1, 0.7],
            Extrapolation.CLAMP
          ),
        },
      ],
    };
  });

  return (
    <View>
      {/* <View className="absolute top-[-10] z-10">
        <SetFavoriteButton showId={show.tmdbId} isFavorited={!!show.favorite} />
      </View> */}
      <Animated.View
        style={[animStyle, { width: imageWidth, height: imageHeight, position: 'relative' }]}
        className="overflow-hidden rounded-lg border-hairline border-primary bg-white">
        <Image
          className="absolute"
          source={show.posterURL || missingPosterURI}
          contentFit="cover"
          style={{
            width: imageWidth,
            height: imageHeight,
            opacity: 0.1,
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: -1,
          }}
        />

        <View className="relative z-30 mx-[9] my-[5]">
          <Text
            className="text-center text-lg font-semibold"
            lineBreakMode="tail"
            numberOfLines={2}>
            {show.name}
          </Text>
          <Text className="text-center text-lg font-semibold">
            {dayjs.unix(show.dateAddedEpoch).format('MM/DD/YYYY')}
          </Text>
          <Text>Season {seasonsSummary?.['1']?.watched}</Text>
          <Pressable
            onPress={() =>
              router.push({
                pathname: `/seasonslistmodal`,
                params: { showid: parseInt(show.tmdbId) },
              })
            }>
            <Text>See Seasons</Text>
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
};

export default React.memo(ScrollerSecond);
