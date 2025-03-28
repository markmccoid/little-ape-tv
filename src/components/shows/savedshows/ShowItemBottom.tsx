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

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
type Props = {
  showId: string;
};

const SearchItemButtonAnim = ({ showId }: Props) => {
  const { colors } = useCustomTheme();
  const { isStoredLocally, favorite } = useSavedShow(showId);

  const transition = useSharedValue(isStoredLocally ? 1 : 0); // 1 for true, 0 for false
  const savedAttributesSummary = useSavedSeasonSummary(showId);
  const showNextDL = use$(settings$.downloadOptions.showNextDownloadInfo);

  useEffect(() => {
    transition.value = withTiming(isStoredLocally ? 1 : 0, { duration: 500 });
  }, [isStoredLocally]);

  const backgroundColor = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(transition.value, [0, 1], ['white', colors.includeGreen]),
    };
  });

  return (
    <Animated.View
      className="z-10 mx-3 my-[-15] h-[25] flex-row items-center justify-center rounded-lg border p-1"
      style={[backgroundColor, styles.container]}>
      <Animated.View style={[{ position: 'absolute', left: 0, top: -5 }]}>
        <SetFavoriteButton showId={showId} isFavorited={!!favorite} />
      </Animated.View>

      {showNextDL && (
        <View>
          <Text>
            {savedAttributesSummary?.nextDownloadEpisode?.status === 'a'
              ? 'DONE'
              : savedAttributesSummary?.nextDownloadEpisode?.airDate}
          </Text>
        </View>
      )}

      <Animated.View style={[{ position: 'absolute', right: 0, top: -5 }]}>
        <DeleteShowButton showId={showId} />
      </Animated.View>

      {/* <AnimatedPressable style={[styles.button, minusButtonStyle]} onPress={handleRemovePress}>
        <SymbolView name="minus.circle.fill" tintColor={colors.deleteRed} size={40} />
      </AnimatedPressable> */}
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

export default React.memo(SearchItemButtonAnim);
