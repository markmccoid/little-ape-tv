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
const missingPosterURI = require('../../../../assets/missingPoster.png');

type Props = {
  show: SavedShow;
  imageWidth: number;
  imageHeight: number;
  index: number;
  scrollX: SharedValue<number>;
};
const ScrollerSecond = ({ show, imageWidth, imageHeight, index, scrollX }: Props) => {
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
        </View>
      </Animated.View>
    </View>
  );
};

export default ScrollerSecond;
