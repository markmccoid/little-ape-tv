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
import { SymbolView } from 'expo-symbols';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
type Props = {
  showId: string;
};

const ShowItemTop = ({ showId }: Props) => {
  const { colors } = useCustomTheme();
  // const { isStoredLocally, favorite } = useSavedShow(showId);

  const savedAttributesSummary = useSavedSeasonSummary(showId);
  const dlStatus = savedAttributesSummary?.nextDownloadEpisode?.status;
  const allWatched = savedAttributesSummary?.allSeasonsWatched;

  if (dlStatus === 'n') return null;
  return (
    <View className="relative z-10 w-full flex-row justify-between">
      <Animated.View
        className="mx-3 my-[-15] h-[25] flex-row items-center justify-start rounded-lg border-hairline px-1"
        style={{
          backgroundColor: dlStatus === 'a' ? '#ffffffcc' : '#ffffffcc',
        }}>
        <View>
          {dlStatus === 'a' ? (
            <SymbolView name="checkmark.seal.fill" size={25} tintColor={colors.primary} />
          ) : (
            <Text className="font-semibold">
              {savedAttributesSummary?.nextDownloadEpisode?.airDate}
            </Text>
          )}
        </View>

        {/* <Animated.View style={[{ position: 'absolute', right: 0, top: -5 }]}>
          <DeleteShowButton showId={showId} />
          </Animated.View> */}
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
