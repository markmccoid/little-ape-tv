import React, { useState, useEffect } from 'react';
import { View, Pressable, StyleSheet, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { useCustomTheme } from '~/utils/customColorTheme';
import { savedShows$ } from '~/store/store-shows';
import SetFavoriteButton from '../details/tags/SetFavoriteButton';
import DeleteShowButton from './DeleteShowButton';
import { use$ } from '@legendapp/state/react';
import { useSavedSeasonSummary } from '~/store/functions-showAttributes';
import { settings$ } from '~/store/store-settings';
import { useSavedShow } from '~/store/store-shows';
import { getBGColor } from '~/utils/utils';
import { useRouter } from 'expo-router';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
type Props = {
  showId: string;
};

const ShowItemBottom = ({ showId }: Props) => {
  const { colors } = useCustomTheme();
  const router = useRouter();
  const { favorite } = useSavedShow(showId);
  const showInfo = useSavedShow(showId);
  const [runTimeBGColor, runTimeTextColor] = getBGColor(showInfo.avgEpisodeRunTime) || ['', ''];

  return (
    <Animated.View
      className="relative z-10 mx-3 my-[-15] h-[25] flex-row items-center justify-center rounded-lg border p-1"
      style={{ backgroundColor: colors.includeGreen }}>
      <Animated.View style={[{ position: 'absolute', left: 0, top: -5 }]}>
        <SetFavoriteButton showId={showId} isFavorited={!!favorite} />
      </Animated.View>

      {showInfo.avgEpisodeRunTime && (
        <View
          className="absolute rounded-full border-hairline p-2"
          style={{ backgroundColor: runTimeBGColor }}>
          <Pressable
            onPress={() =>
              router.push({
                pathname: `/seasonslistmodal`,
                params: { showid: parseInt(showId) },
              })
            }>
            <Text className="font-semibold" style={{ color: runTimeTextColor }}>
              {showInfo.avgEpisodeRunTime} Min
            </Text>
          </Pressable>
        </View>
      )}

      <Animated.View style={[{ position: 'absolute', right: 0, top: -5 }]}>
        <DeleteShowButton showId={showId} />
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    // Add any specific styles for the container here
    // overflow: 'hidden',
    position: 'relative',
  },
  button: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent', // Make sure background is transparent
  },
});

export default React.memo(ShowItemBottom);
