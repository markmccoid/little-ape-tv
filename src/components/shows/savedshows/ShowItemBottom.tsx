import React, { useState, useEffect } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { useCustomTheme } from '~/utils/customColorTheme';
import { SymbolView } from 'expo-symbols';
import { savedShows$ } from '~/store/store-shows';
import { TVSearchResultItem } from '@markmccoid/tmdb_api';
import { SavedShow } from '~/store/functions-shows';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
type Props = {
  show: SavedShow;
};

const SearchItemButtonAnim = ({ show }: Props) => {
  const { colors } = useCustomTheme();
  const [isStoredLocally, setIsStoredLocally] = useState(show.isStoredLocally);
  const transition = useSharedValue(show.isStoredLocally ? 1 : 0); // 1 for true, 0 for false
  useEffect(() => {
    transition.value = withTiming(isStoredLocally ? 1 : 0, { duration: 500 });
  }, [isStoredLocally]);

  useEffect(() => {
    setIsStoredLocally(show?.isStoredLocally);
  }, [show]);

  const backgroundColor = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(transition.value, [0, 1], ['white', colors.includeGreen]),
    };
  });

  const plusButtonStyle = useAnimatedStyle(() => {
    return {
      opacity: 1 - transition.value,
      transform: [{ scale: 1 - transition.value }],
    };
  });

  const minusButtonStyle = useAnimatedStyle(() => {
    return {
      opacity: transition.value,
      transform: [{ scale: transition.value }],
    };
  });

  const handleRemovePress = () => {
    savedShows$.removeShow(show.tmdbId);
    setIsStoredLocally(false);
  };

  return (
    <Animated.View
      className="z-10 mx-3 my-[-15] h-[25] flex-row items-center justify-center rounded-lg border p-1"
      style={[backgroundColor, styles.container]}>
      <AnimatedPressable style={[styles.button, minusButtonStyle]} onPress={handleRemovePress}>
        <SymbolView name="minus.circle.fill" tintColor={colors.deleteRed} size={40} />
      </AnimatedPressable>
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
