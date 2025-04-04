import React from 'react';
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
import { useRouter } from 'expo-router';
import { savedShows$, useSavedShow } from '~/store/store-shows';
import { use$ } from '@legendapp/state/react';
import { useSavedSeasonSummary } from '~/store/functions-showAttributes';
const missingPosterURI = require('../../../../assets/missingPoster.png');

type Props = {
  showId: string;
  imageWidth: number;
  imageHeight: number;
  index: number;
  scrollX: SharedValue<number>;
};
const ScrollerMain = ({ showId, imageWidth, imageHeight, index, scrollX }: Props) => {
  const router = useRouter();
  const { posterURL, avgEpisodeRunTime } = useSavedShow(showId);
  const { nextDownloadEpisode } = useSavedSeasonSummary(showId);

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
    <Animated.View style={[animStyle]}>
      <Pressable
        onLongPress={() =>
          router.push({
            pathname: `/seasonslistmodal`,
            params: { showid: parseInt(showId) },
          })
        }
        onPress={() => router.push({ pathname: `/[showid]`, params: { showid: parseInt(showId) } })}
        className="rounded-lg border-hairline border-primary active:border-hairline">
        <View
          style={{
            width: imageWidth,
          }}
          className="overflow-hidden rounded-lg border-hairline">
          <Image
            source={posterURL || missingPosterURI}
            contentFit="cover"
            style={{ width: imageWidth, height: imageHeight }}
          />
        </View>
      </Pressable>
      {/* Make pressable to expand to show details? */}
      <View className="absolute bottom-[-15] w-full flex-row justify-between rounded-b-lg border-hairline bg-green-800 p-1">
        {avgEpisodeRunTime && <Text className="text-white">{avgEpisodeRunTime} Mins</Text>}
        {nextDownloadEpisode?.status !== 'a' && (
          <Text className="text-white">{nextDownloadEpisode?.airDate}</Text>
        )}
      </View>
    </Animated.View>
  );
};

export default React.memo(ScrollerMain);
