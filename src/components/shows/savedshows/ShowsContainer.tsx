import React, { useCallback, useDeferredValue, useLayoutEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View, Dimensions } from 'react-native';
import { Link, Stack, useNavigation, useRouter } from 'expo-router';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useFilteredShows } from '~/data/query.shows';
import Animated, {
  runOnJS,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolate,
  SharedValue,
} from 'react-native-reanimated';
import { SavedShow } from '~/store/functions-shows';
import ShowItem from './ShowItem';
import ShowNameSearch from './ShowSearch';
import { use$ } from '@legendapp/state/react';
import { filterCriteria$ } from '~/store/store-filterCriteria';
import { SymbolView } from 'expo-symbols';
import { FilterIcon } from '~/components/common/Icons';
import { useCustomTheme } from '~/utils/customColorTheme';
import { search$ } from '~/store/store-search';
import ShowItemBottom from './ShowItemBottom';
import { NativeStackNavigationOptions } from '@react-navigation/native-stack';

const { width, height } = Dimensions.get('window');
const MARGIN = 10;
const IMG_WIDTH = (width - MARGIN * 3) / 2;
const IMG_HEIGHT = IMG_WIDTH * 1.5;

// Component to handle animated ShowItem
const AnimatedShowItem = ({
  show,
  showId,
  index,
  scrollY,
}: {
  show: SavedShow;
  showId: string;
  index: number;
  scrollY: SharedValue<number>;
}) => {
  // Calculate the row number for the item (two items per row)
  const rowNumber = Math.floor(index / 2);
  const isOdd = !!(index % 2);

  // Calculate the item's top position based on its row
  const itemPositionY = rowNumber * (IMG_HEIGHT + 26);

  // Create animated style for fading and scaling
  const animatedItemStyle = useAnimatedStyle(() => {
    // Calculate the relative position of the item to the top of the viewport
    const itemTop = itemPositionY - scrollY.value;
    // console.log('index0top', index, itemTop, itemPositionY, scrollY.value, IMG_HEIGHT);
    // Interpolate opacity: 1 when item is fully visible, 0 when it's at the top
    const opacity = interpolate(
      itemTop,
      [-(IMG_HEIGHT + 26), -155], // Fade out when item
      [0, 1],
      'clamp'
    );

    // Interpolate scale: 0.7 when at top, 1 when fully visible
    const scale = interpolate(
      itemTop,
      [-(IMG_HEIGHT + 26), -125], // Scale down when item
      [0.85, 1],
      'clamp'
    );
    const transformX = interpolate(
      itemTop,
      [-(IMG_HEIGHT + 26), -125], // Scale down when item
      [isOdd ? -20 : 20, 0],
      'clamp'
    );
    const translateY = interpolate(
      itemTop,
      [-(IMG_HEIGHT + 26), -125], // Scale down when item
      [30, 0],
      'clamp'
    );
    // console.log('OPAC', index, itemPositionY, itemTop, opacity, scale);

    return {
      opacity,
      transform: [{ scale }, { translateX: transformX }, { translateY }],
    };
  });

  return (
    <Animated.View
      style={[animatedItemStyle, { marginHorizontal: MARGIN / 2, height: IMG_HEIGHT + 26 }]}
      className="overflow-hidden rounded-lg">
      <View style={{ width: IMG_WIDTH, height: IMG_HEIGHT + 26 }}>
        <ShowItem show={show} showId={showId} />
      </View>
      <View style={{ position: 'absolute', bottom: 15, left: 0, width: '100%' }}>
        <ShowItemBottom showId={showId} />
      </View>
    </Animated.View>
  );
};

const ShowsContainer = () => {
  const tabBarHeight = useBottomTabBarHeight();
  const showsInit = useFilteredShows();
  const router = useRouter();
  const navigation = useNavigation();
  const { colors } = useCustomTheme();

  const shows = useDeferredValue(showsInit);
  const titleSearchValue = use$(filterCriteria$.nameFilter.showName);
  const flatListRef = React.useRef<FlatList>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const scrollY = useSharedValue(0);
  const animHeight = useSharedValue(0);
  const searchY = useSharedValue(-40);

  useLayoutEffect(() => {
    const options: NativeStackNavigationOptions = {
      title: `Shows (${showsInit.length})`,
    };
    navigation.setOptions(options);
  }, [showsInit]);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
      animHeight.value = event.contentOffset.y * -1;

      if (event.contentOffset.y < -30) {
        runOnJS(setSearchOpen)(true);
      } else if (event.contentOffset.y > 25 && titleSearchValue?.length === 0) {
        runOnJS(setSearchOpen)(false);
        searchY.value = withTiming(-50);
        return;
      }

      searchY.value = searchOpen ? withTiming(3) : -50 + animHeight.value;
    },
  });

  const handleSetVisible = (opening: boolean) => {
    setSearchOpen(opening);
    if (!opening) {
      searchY.value = withTiming(-50);
    } else {
      searchY.value = withTiming(0);
    }
  };

  const hStyle = useAnimatedStyle(() => {
    return { transform: [{ translateY: searchY.value }] };
  });

  const listStyle = useAnimatedStyle(() => {
    return {
      paddingTop: searchY.value + 40,
    };
  });

  const renderShow = useCallback(
    ({ item, index }: { item: SavedShow; index: number }) => {
      return <AnimatedShowItem show={item} showId={item.tmdbId} index={index} scrollY={scrollY} />;
    },
    [scrollY]
  );

  const getItemLayout = (_: any, index: number) => {
    const rowNumber = Math.floor(index);
    return {
      length: IMG_HEIGHT + 26,
      offset: rowNumber * (IMG_HEIGHT + 26), // Offset based on row
      // length: IMG_HEIGHT + 26,
      // offset: rowNumber * (IMG_HEIGHT + 26), // Offset based on row
      index,
    };
  };

  return (
    <View style={{ flex: 1 }}>
      <Animated.View style={[hStyle, { zIndex: 20, width: '100%' }]}>
        <ShowNameSearch
          isVisible={searchOpen}
          searchY={searchY}
          handleSetVisible={handleSetVisible}
        />
      </Animated.View>

      {shows.length === 0 && (
        <View className="flex-1 items-center justify-center">
          <Pressable
            onPress={() => {
              if ('search' === 'search') {
                router.push('/(authed)/(tabs)/(search)');
                search$.searchVal.set(titleSearchValue);
                return;
              }
              router.push('/(auth)/(drawer)/(tabs)/home/filtermodal');
            }}
            className="items-center justify-center">
            <Text className="mb-2 text-xl font-semibold text-text">No Shows Found</Text>
            <View className="flex-row items-center rounded-lg border border-border bg-card px-2 py-1">
              <View className="flex-row items-center p-2">
                <SymbolView name="popcorn" size={50} tintColor={colors.primary} />
                <Text className="ml-3 text-xl font-semibold">Search?</Text>
              </View>
            </View>
          </Pressable>
        </View>
      )}

      <Animated.FlatList
        data={shows}
        ref={flatListRef}
        style={[listStyle, { zIndex: 10, paddingHorizontal: MARGIN }]}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        keyExtractor={(item) => item.tmdbId}
        renderItem={renderShow}
        numColumns={2}
        onScroll={scrollHandler}
        getItemLayout={getItemLayout}
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="on-drag"
        contentContainerStyle={{ paddingBottom: tabBarHeight + 20 }}
      />
    </View>
  );
};

export default ShowsContainer;
