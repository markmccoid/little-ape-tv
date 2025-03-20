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
import { useRouter } from 'expo-router';
const missingPosterURI = require('../../../../assets/missingPoster.png');

type Props = {
  show: SavedShow;
  imageWidth: number;
  imageHeight: number;
  index: number;
  scrollX: SharedValue<number>;
};
const ScrollerMain = ({ show, imageWidth, imageHeight, index, scrollX }: Props) => {
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
    <Animated.View style={[animStyle]}>
      <Pressable
        onLongPress={() =>
          router.push({
            pathname: `/seasonslistmodal`,
            params: { showid: parseInt(show.tmdbId) },
          })
        }
        onPress={() =>
          router.push({ pathname: `/[showid]`, params: { showid: parseInt(show.tmdbId) } })
        }
        className="rounded-lg border-hairline border-primary active:border-hairline">
        <View
          style={{
            width: imageWidth,
          }}
          className="overflow-hidden rounded-lg border-hairline">
          <Image
            source={show.posterURL || missingPosterURI}
            contentFit="cover"
            style={{ width: imageWidth, height: imageHeight }}
          />
        </View>
      </Pressable>
    </Animated.View>
  );
};

export default ScrollerMain;
