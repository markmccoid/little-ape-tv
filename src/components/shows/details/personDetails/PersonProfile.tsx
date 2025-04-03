import { View, Text, ScrollView, StyleSheet } from 'react-native';
import React from 'react';
import { getPersonDetails_typedef } from '@markmccoid/tmdb_api';
import ShowImage from '~/components/common/ShowImage';
import { Image } from 'expo-image';
import Animated, {
  Extrapolation,
  interpolate,
  SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { getNoImageFound } from '~/utils/utils';

type Props = {
  personInfo: getPersonDetails_typedef['data'];
  scrollY: SharedValue<number>;
  headerHeight: number;
};
const AnimatedImage = Animated.createAnimatedComponent(Image);
const PersonProfile = ({ personInfo, scrollY, headerHeight }: Props) => {
  const profileURL = personInfo?.profileImage ?? getNoImageFound();
  const animatedProfileStyle = useAnimatedStyle(() => {
    // Simple approach: Scale down immediately if scrolled even 1 pixel
    // const scale = scrollY.value > 0 ? 0.5 : 1;

    // Smoother approach: Interpolate scale between scroll 0 and e.g., 50
    const scale = interpolate(
      scrollY.value,
      [0, 200], // Input range: Scroll Y pixels
      [1, 0.5], // Output range: Scale value
      Extrapolation.CLAMP // Prevent scale going below 0.5 or above 1
    );
    const width = interpolate(scrollY.value, [0, headerHeight + 5], [125, 0], Extrapolation.CLAMP);
    const height = interpolate(
      scrollY.value,
      [0, headerHeight + 5],
      [125 * 1.7, 0],
      Extrapolation.CLAMP
    );
    return {
      // transform: [{ scale: scale }],
      width,
      height,
      // Optional: If you want it to scale towards the top instead of center:
      // transformOrigin: 'top', // Note: transformOrigin might need specific setup or may behave differently across platforms
    };
  });
  return (
    <View className="mx-1 flex-row" style={{}}>
      <Animated.View
        style={[
          animatedProfileStyle,
          {
            borderRadius: 10,
            borderWidth: StyleSheet.hairlineWidth,
            overflow: 'hidden',
          },
        ]}>
        <AnimatedImage
          source={profileURL}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
        />
      </Animated.View>

      <ScrollView>
        <Text className="flex-1 px-1">{personInfo.biography}</Text>
      </ScrollView>
    </View>
  );
};

export default PersonProfile;
