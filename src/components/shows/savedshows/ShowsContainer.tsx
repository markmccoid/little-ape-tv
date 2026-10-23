import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View, Dimensions } from 'react-native';
import {
  Link,
  Stack,
  useNavigation,
  useRouter,
  type NativeStackNavigationOptions,
} from 'expo-router';
import { useBottomTabBarHeight } from 'expo-router/js-tabs';
import { useFilteredShows } from '~/data/query.savedShows';
import Animated, {
  runOnJS,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolate,
  SharedValue,
  LinearTransition,
} from 'react-native-reanimated';
import { AnimatedLegendList } from '@legendapp/list/reanimated';
import type { ShowListItem } from '~/db/showList';
import ShowItem from './ShowItem';
import ShowNameSearch from './ShowSearch';
import { use$ } from '@legendapp/state/react';
import { filterCriteria$ } from '~/store/store-filterCriteria';
import { SymbolView } from 'expo-symbols';
import { FilterIcon } from '~/components/common/Icons';
import { useCustomTheme } from '~/utils/customColorTheme';
import { search$ } from '~/store/store-search';
import ShowItemBottom from './ShowItemBottom';
const { width, height } = Dimensions.get('window');
const MARGIN = 10;
const IMG_WIDTH = (width - MARGIN * 3) / 2;
const IMG_HEIGHT = IMG_WIDTH * 1.5;
// How far the list moves down to make room for the open name search.
const SEARCH_SHIFT = 43;

// Component to handle animated ShowItem
const AnimatedShowItem = ({
  show,
  showId,
  index,
  scrollY,
}: {
  show: ShowListItem;
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
      style={[animatedItemStyle, { marginHorizontal: 0, height: IMG_HEIGHT + 26 }]}
      className="overflow-hidden rounded-lg">
      <View style={{ width: IMG_WIDTH, height: IMG_HEIGHT + 26 }}>
        <ShowItem show={show} showId={showId} />
      </View>
      <View style={{ position: 'absolute', bottom: 15, left: 0, width: '100%' }}>
        <ShowItemBottom show={show} />
      </View>
    </Animated.View>
  );
};

const ShowsContainer = () => {
  const tabBarHeight = useBottomTabBarHeight();
  const shows = useFilteredShows();
  const router = useRouter();
  const navigation = useNavigation();
  const { colors } = useCustomTheme();

  const titleSearchValue = use$(filterCriteria$.nameFilter.showName);
  const [searchOpen, setSearchOpen] = useState(false);
  const scrollY = useSharedValue(0);
  const searchY = useSharedValue(-50);
  const listShift = useSharedValue(0);

  useLayoutEffect(() => {
    const options: NativeStackNavigationOptions = {
      title: `Shows (${shows.length})`,
    };
    navigation.setOptions(options);
  }, [shows]);

  // The open flag and "search is empty" live in shared values so the scroll worklet reads current
  // values on the UI thread instead of React state captured at its last render.
  const searchOpenSV = useSharedValue(false);
  const titleSearchEmpty = useSharedValue(titleSearchValue?.length === 0);
  useEffect(() => {
    titleSearchEmpty.value = titleSearchValue?.length === 0;
  }, [titleSearchValue]);

  // True while searchY is following the finger during a pull that hasn't opened the search yet.
  const searchTracking = useSharedValue(false);

  // The list itself never moves during a pull: shifting it under an active pan shrinks the
  // overscroll and fights the gesture. Only the absolutely positioned search bar follows the
  // finger; the list slides down once, when the search opens.
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      const offsetY = event.contentOffset.y;
      scrollY.value = offsetY;

      if (offsetY < -18) {
        if (!searchOpenSV.value) {
          searchOpenSV.value = true;
          searchTracking.value = false;
          searchY.value = withTiming(3, { duration: 220 });
          listShift.value = withTiming(SEARCH_SHIFT, { duration: 220 });
          runOnJS(setSearchOpen)(true);
        }
        return;
      }

      if (offsetY > 10 && titleSearchEmpty.value && searchOpenSV.value) {
        searchOpenSV.value = false;
        searchY.value = withTiming(-50, { duration: 200 });
        listShift.value = withTiming(0, { duration: 200 });
        runOnJS(setSearchOpen)(false);
        return;
      }

      if (!searchOpenSV.value) {
        if (offsetY < 0) {
          searchTracking.value = true;
          searchY.value = Math.min(3, -50 - offsetY);
        } else if (searchTracking.value) {
          searchTracking.value = false;
          searchY.value = -50;
        }
      }
    },
  });

  const handleSetVisible = (opening: boolean) => {
    setSearchOpen(opening);
    searchOpenSV.value = opening;
    searchTracking.value = false;
    searchY.value = withTiming(opening ? 3 : -50, { duration: 220 });
    listShift.value = withTiming(opening ? SEARCH_SHIFT : 0, { duration: 220 });
  };

  const hStyle = useAnimatedStyle(() => {
    return { transform: [{ translateY: searchY.value }] };
  });

  // translateY rather than paddingTop: no layout pass (or Legend List onLayout) per frame.
  const listStyle = useAnimatedStyle(() => {
    return { transform: [{ translateY: listShift.value }] };
  });

  const renderShow = useCallback(
    ({ item, index }: { item: ShowListItem; index: number }) => {
      return <AnimatedShowItem show={item} showId={item.id} index={index} scrollY={scrollY} />;
    },
    [scrollY]
  );

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

      {/* Legend List keys each card (not each row) by show id, so removing a show only
          unmounts that card instead of remounting every row after it. */}
      {/* The animated shift lives on a wrapper: Legend List reads `style` in JS to position
          items, so it can't take a Reanimated style. */}
      <Animated.View style={[listStyle, { flex: 1, zIndex: 10 }]}>
        <AnimatedLegendList
          data={shows}
          style={{ paddingHorizontal: MARGIN }}
          columnWrapperStyle={{ columnGap: MARGIN }}
          keyExtractor={(item) => item.id}
          renderItem={renderShow}
          numColumns={2}
          estimatedItemSize={IMG_HEIGHT + 26}
          recycleItems={false}
          onScroll={scrollHandler}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="on-drag"
          itemLayoutAnimation={LinearTransition.duration(280)}
          // The wrapper's translateY pushes the list's bottom off-screen while the search is open,
          // so add the same amount here to keep the last row reachable.
          contentContainerStyle={{
            paddingBottom: tabBarHeight + 20 + (searchOpen ? SEARCH_SHIFT : 0),
          }}
        />
      </Animated.View>
    </View>
  );
};

export default ShowsContainer;
