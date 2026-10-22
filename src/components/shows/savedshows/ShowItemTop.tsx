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
import { epochToAirDate } from '~/db/dates';
import type { ShowListItem } from '~/db/showList';
import { settings$ } from '~/store/store-settings';
import { SymbolView } from 'expo-symbols';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
type Props = {
  show: ShowListItem;
};

const ShowItemTop = ({ show }: Props) => {
  const { colors } = useCustomTheme();
  const dlStatus = show.nextDlStatus;
  const allWatched = show.allWatched;

  // if (dlStatus === 'n') return null;
  return (
    <View className="relative z-10 w-full flex-row justify-between">
      <Animated.View
        className="mx-3 my-[-15] h-[25] flex-row items-center justify-start rounded-lg border-hairline px-1"
        style={{
          backgroundColor: dlStatus === 'a' ? '#ffffffcc' : '#ffffffcc',
          opacity: dlStatus === 'n' ? 0 : 1, //If nothing downloaded keep view as placeholder, but make invisible
        }}>
        <View>
          {dlStatus === 'a' ? (
            <SymbolView name="checkmark.seal.fill" size={25} tintColor={colors.primary} />
          ) : (
            <Text className="font-semibold">{epochToAirDate(show.nextDlAirDate)}</Text>
          )}
        </View>
      </Animated.View>
      {allWatched && (
        <View
          className=" my-[-15] h-[25] flex-row items-center justify-start rounded-lg border-hairline px-1"
          style={{
            backgroundColor: '#ffffffcc',
          }}>
          <SymbolView name="eye.circle.fill" tintColor={colors.primary} />
        </View>
      )}
    </View>
  );
};

export default React.memo(ShowItemTop);
