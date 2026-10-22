import React, { useState, useEffect } from 'react';
import { View, Pressable, StyleSheet, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { useCustomTheme } from '~/utils/customColorTheme';
import SetFavoriteButton from '../details/tags/SetFavoriteButton';
import DeleteShowButton from './DeleteShowButton';
import { use$ } from '@legendapp/state/react';
import type { ShowListItem } from '~/db/showList';
import { settings$ } from '~/store/store-settings';
import { getBGColor } from '~/utils/utils';
import { useRouter } from 'expo-router';

type Props = {
  show: ShowListItem;
};

const ShowItemBottom = ({ show }: Props) => {
  const showId = show.id;
  const { colors } = useCustomTheme();
  const router = useRouter();
  const favorite = show.favoritedAt;
  const avgEpisodeRunTime = show.avgEpisodeRunTime ?? 0;
  const [runTimeBGColor, runTimeTextColor] = getBGColor(avgEpisodeRunTime) || ['', ''];

  const hasAvgTime = avgEpisodeRunTime > 0;
  return (
    <Animated.View
      className="relative z-10 mx-3 my-[-15] h-[25] flex-row items-center justify-center rounded-lg border p-1"
      style={{ backgroundColor: colors.includeGreen }}>
      <Animated.View style={[{ position: 'absolute', left: 0, top: -5 }]}>
        <SetFavoriteButton showId={showId} isFavorited={!!favorite} />
      </Animated.View>

      <View
        className="absolute rounded-full border-hairline p-2"
        style={{ backgroundColor: runTimeBGColor }}>
        <Pressable
          onPress={() =>
            router.push({
              pathname: `/seasonslistmodal`,
              params: { showid: parseInt(showId) },
            })
          }
          hitSlop={{ top: 10, bottom: 10, left: 5, right: 5 }}>
          <Text className="font-semibold" style={{ color: runTimeTextColor }}>
            {`${hasAvgTime ? avgEpisodeRunTime : ' ?? '}`} Min
          </Text>
        </Pressable>
      </View>

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
