import React, { useState, useEffect } from 'react';
import { Text, View, Pressable, StyleSheet, Linking, Alert } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { useCustomTheme } from '~/utils/customColorTheme';
import { SymbolView } from 'expo-symbols';
import { savedShows$ } from '~/store/store-shows';
import { CastTVShows, rawTVGetExternalIds } from '@markmccoid/tmdb_api';
import { IMDBIcon } from '~/components/common/Icons';

const navigateToIMDB = async (showId: number) => {
  try {
    const externalIds = await rawTVGetExternalIds(showId);
    const imdbId = externalIds.data.imdb_id;
    if (!imdbId) throw new Error('Null imdb id');
    Linking.openURL(`imdb:///title/${imdbId}`).catch((err) => {
      Linking.openURL(`https://www.imdb.com/title/${imdbId}/`);
    });
  } catch (err) {
    Alert.alert('Error', 'Unable to find Link for IMDB');
  }
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
type Props = {
  showItem: CastTVShows & { isStoredLocally: boolean };
};

const PersonAddRemoveShow = ({ showItem }: Props) => {
  const { colors } = useCustomTheme();
  const [isStoredLocally, setIsStoredLocally] = useState(showItem.isStoredLocally);
  const transition = useSharedValue(showItem.isStoredLocally ? 1 : 0); // 1 for true, 0 for false
  useEffect(() => {
    transition.value = withTiming(isStoredLocally ? 1 : 0, { duration: 500 });
  }, [isStoredLocally]);

  useEffect(() => {
    setIsStoredLocally(showItem?.isStoredLocally);
  }, [showItem]);

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

  const handleAddPress = () => {
    savedShows$.addShow(showItem.tvShowId.toString());
    setIsStoredLocally(true);
  };

  const handleRemovePress = () => {
    savedShows$.removeShow(showItem.tvShowId.toString());
    setIsStoredLocally(false);
  };

  return (
    <Animated.View
      // className="z-10 mx-3 my-[-15] h-[25] flex-row items-center justify-center rounded-lg border p-1"
      className="absolute bottom-0 my-[-15] h-[25] w-full flex-row items-center justify-center rounded-lg border"
      style={[backgroundColor]}>
      <AnimatedPressable style={[styles.button, plusButtonStyle]} onPress={handleAddPress}>
        <SymbolView name="plus.circle.fill" tintColor={colors.includeGreen} size={40} />
      </AnimatedPressable>

      <AnimatedPressable style={[styles.button, minusButtonStyle]} onPress={handleRemovePress}>
        <SymbolView name="minus.circle.fill" tintColor={colors.deleteRed} size={40} />
      </AnimatedPressable>
      <View className="absolute right-0 rounded-r-lg border-hairline bg-buttondarker px-3 py-1">
        <Text className="font-semibold text-buttondarkertext">{showItem.episodeCount}</Text>
      </View>
      <Pressable
        onPress={() => navigateToIMDB(showItem.tvShowId)}
        className=" absolute left-0 h-[22] items-center justify-center rounded-l-md border-r border-r-yellow-600 bg-yellow-400 px-1"
        // style={{ borderRightWidth: 1 }}>
      >
        {/* <IMDBIcon size={25} /> */}
        <Text className="text-sm">IMDb</Text>
      </Pressable>
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

export default React.memo(PersonAddRemoveShow);
