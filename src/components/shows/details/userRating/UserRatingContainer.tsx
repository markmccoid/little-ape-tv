import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Pressable, Alert } from 'react-native';
import { MotiText, MotiView } from 'moti';
import {
  GestureHandlerRootView,
  LongPressGestureHandler,
  State,
} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import { savedShows$ } from '~/store/store-shows';
import { use$ } from '@legendapp/state/react';

const NUMBER_OF_ITEMS = 11;
const EXPAND_DISTANCE = 34; // Adjust as needed
const ANIMATION_DURATION = 500; // milliseconds
const FADE_DURATION = 700;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
type Props = {
  showId: string;
};
const ExpandingTextList = ({ showId }: Props) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const animation = useSharedValue(0);
  const fadeAnimation = useSharedValue(1); // 1 for visible, 0 for hidden
  const currUserRating = use$(savedShows$.shows[showId].userRating) || 0;
  console.log(currUserRating);

  const handleLongPress = (event) => {
    if (event.nativeEvent.state === State.ACTIVE) {
      if (isExpanded) {
        fadeAnimation.value = withSpring(0, { duration: FADE_DURATION });
        animation.value = withSpring(0, { duration: ANIMATION_DURATION });
        setIsExpanded(false);
        return;
      }
      animation.value = withSpring(1, { duration: ANIMATION_DURATION });
      fadeAnimation.value = withSpring(1, { duration: FADE_DURATION });
      setIsExpanded(true);
    }
  };

  const handleTextClick = (newRating: number) => {
    savedShows$.updateShowUserRating(showId, newRating);
    fadeAnimation.value = withSpring(0, { duration: FADE_DURATION });
    animation.value = withSpring(0, { duration: ANIMATION_DURATION });
    setIsExpanded(false);
    // requestAnimationFrame(() => savedShows$.updateShowUserRating(showId, newRating));
  };

  const getItemAnimationStyle = (index) => {
    return useAnimatedStyle(() => {
      const translateX = animation.value * EXPAND_DISTANCE * (index + 1);

      return {
        transform: [{ translateX }, { scale: interpolate(animation.value, [0, 1], [0.5, 1.3]) }],
        opacity: fadeAnimation.value,
      };
    });
  };

  return (
    <View className="relative flex-1 flex-row items-center justify-start">
      {/* Trigger Item (Long Press) */}
      <LongPressGestureHandler
        minDurationMs={200} // Adjust long press duration if needed
        onHandlerStateChange={handleLongPress}>
        <MotiView
          from={{ opacity: isExpanded ? 1 : 0.7, scale: isExpanded ? 1 : 0.9 }}
          animate={{ opacity: isExpanded ? 0.7 : 1, scale: isExpanded ? 0.9 : 1 }}
          className="absolute z-30 rounded-lg border-hairline bg-buttondarker px-3 py-1">
          <MotiText
            from={{ opacity: isExpanded ? 1 : 0.5, scale: isExpanded ? 1 : 0.8 }}
            animate={{ opacity: isExpanded ? 0.5 : 1, scale: isExpanded ? 0.8 : 1 }}
            className="text-xl font-bold text-buttondarkertext">
            {currUserRating}
          </MotiText>
        </MotiView>
      </LongPressGestureHandler>
      <View className="z-10 flex-row items-center justify-start">
        {/* Expanding Text Items */}
        {new Array(NUMBER_OF_ITEMS).fill(undefined).map((_, index) => (
          <Animated.View
            key={index}
            style={[
              getItemAnimationStyle(index),
              {
                position: 'absolute',
                zIndex: 10,
                left: -30,
                bottom: 20,
              }, // Important for layering
            ]}>
            <AnimatedPressable onPress={() => handleTextClick(index)}>
              <View className="h-[25] w-[22] flex-row items-center justify-center rounded-lg border-hairline bg-white">
                <Text className="text-base font-semibold">{index}</Text>
              </View>
            </AnimatedPressable>
          </Animated.View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  triggerItem: {
    zIndex: 20,
    height: 25,
    width: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: 'white',
  },
  triggerText: {
    fontSize: 14,
    fontWeight: 'semibold',
  },
});

export default ExpandingTextList;
