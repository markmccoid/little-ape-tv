import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
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
import ScreenTwoSeasonData from './ScreenTwoSeasonData';
const missingPosterURI = require('../../../../../assets/missingPoster.png');

type Props = {
  showId: string;
  imageWidth: number;
  imageHeight: number;
  index: number;
  scrollX: SharedValue<number>;
};
const ShowItemScreenTwo = ({ showId, imageWidth, imageHeight, index, scrollX }: Props) => {
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
    // <View style={{ width: imageWidth, height: imageHeight + 26, borderWidth: 1 }}>
    <Animated.View
      style={[animStyle, { width: imageWidth, height: imageHeight + 26 }]}
      className="flex-row items-center overflow-hidden">
      <View
        className="relative z-30 overflow-hidden rounded-lg border-hairline border-primary"
        style={{ height: imageHeight, width: imageWidth }}>
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
        {/* Inner View */}
        <View className="mx-1">
          <Text
            className="text-center text-lg font-semibold"
            lineBreakMode="tail"
            numberOfLines={2}>
            {name}
          </Text>
          <ScrollView>
            <View className="flex-row gap-1">
              <Text>Date Added:</Text>
              <Text className="">{dayjs.unix(dateAddedEpoch).format('MM/DD/YYYY')}</Text>
            </View>
            <ScreenTwoSeasonData showId={showId} />
            <View className="flex-row">
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: `/seasonslistmodal`,
                    params: { showid: parseInt(showId) },
                  })
                }
                className="rounded-md border-hairline bg-primary px-2 py-1">
                <Text className="color-primarytext">See Seasons</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Animated.View>
  );
};

export default React.memo(ShowItemScreenTwo);
