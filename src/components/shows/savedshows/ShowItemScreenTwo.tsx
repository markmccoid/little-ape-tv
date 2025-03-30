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
// import { SavedShow, useSavedShow } from '~/store/functions-shows';
import { useSavedShow } from '~/store/store-shows';
import dayjs from 'dayjs';
import { useSavedSeasonSummary } from '~/store/functions-showAttributes';
import { useRouter } from 'expo-router';
import ShowItemBottom from './ShowItemBottom';
import { use$ } from '@legendapp/state/react';
import { savedShows$ } from '~/store/store-shows';
const missingPosterURI = require('../../../../assets/missingPoster.png');

type Props = {
  showId: string;
  imageWidth: number;
  imageHeight: number;
  index: number;
  scrollX: SharedValue<number>;
};
const ShowItemScreenTwo = ({ showId, imageWidth, imageHeight, index, scrollX }: Props) => {
  const seasonsSummary = useSavedSeasonSummary(showId);
  const { favorite, posterURL, name, dateAddedEpoch } = useSavedShow(showId);
  // console.log('secondScreen NextDLEpisodeDate', nextDLEpisodeDate);
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
    <View style={{ width: imageWidth, height: imageHeight }}>
      {/* <View className="absolute top-[-10] z-10">
          <SetFavoriteButton showId={show.tmdbId} isFavorited={!!show.favorite} />
        </View> */}
      <Animated.View
        style={[animStyle, { width: imageWidth, height: imageHeight, position: 'relative' }]}
        className="overflow-hidden rounded-lg border-hairline border-primary bg-white">
        <Image
          className="absolute"
          source={posterURL || missingPosterURI}
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
            {name}
          </Text>
          <Text className="text-center text-lg font-semibold">
            {dayjs.unix(dateAddedEpoch).format('MM/DD/YYYY')}
          </Text>
          <Text>Season {seasonsSummary?.['1']?.watched}</Text>
          <Text>Show Favorited?: {favorite}</Text>
          <Pressable
            onPress={() =>
              router.push({
                pathname: `/seasonslistmodal`,
                params: { showid: parseInt(showId) },
              })
            }>
            <Text>See Seasons</Text>
          </Pressable>
        </View>
      </Animated.View>
      <ShowItemBottom showId={showId} />
    </View>
  );
};

export default React.memo(ShowItemScreenTwo);
