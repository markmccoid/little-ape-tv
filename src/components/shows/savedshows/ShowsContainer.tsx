import React, { useCallback, useDeferredValue, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View, Dimensions } from 'react-native';
import { Link, Stack, useFocusEffect } from 'expo-router';
import { useAuth } from '~/authentication/AuthProvider';
import { savedShows$ } from '~/store/store-shows';
import { useShows } from '~/data/query.shows';
import Animated, {
  runOnJS,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { SavedShow } from '~/store/functions-shows';
import ShowItem from './ShowItem';
import ShowNameSearch from './ShowSearch';
import { use$ } from '@legendapp/state/react';
import { filterCriteria$ } from '~/store/store-filterCriteria';

const ShowsContainer = () => {
  const showsInit = useShows();
  // Defers the render of the shows.  Seems to let things like the filter screen update more smoothly
  const shows = useDeferredValue(showsInit); // Defers updates
  const titleSearchValue = use$(filterCriteria$.nameFilter.showName);
  const flatListRef = React.useRef<FlatList>(null);
  //!!
  const [searchOpen, setSearchOpen] = useState(false);
  const scrollY = useSharedValue(0);
  const animHeight = useSharedValue(0);
  const searchY = useSharedValue(-40);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
      animHeight.value = event.contentOffset.y * -1;

      if (event.contentOffset.y < -30) {
        runOnJS(setSearchOpen)(true);
        // searchY.value = withTiming(3);
        // return;
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
    return {
      transform: [{ translateY: searchY.value }],
    };
  });
  const listStyle = useAnimatedStyle(() => {
    // console.log("Flatlist PAdding", searchY.value);
    return {
      paddingTop: searchY.value + 50,
    };
  });

  //!!
  const renderShow = useCallback(({ item }: { item: SavedShow }) => {
    return <ShowItem show={item} />;
  }, []);

  return (
    <>
      <Stack.Screen options={{ title: 'Shows' }} />
      <View className="flex-1">
        <Animated.View style={[hStyle]} className="absolute z-20 w-full">
          <ShowNameSearch
            isVisible={searchOpen}
            searchY={searchY}
            handleSetVisible={handleSetVisible}
          />
        </Animated.View>
        <Animated.FlatList
          data={shows}
          ref={flatListRef}
          className="px-[10] pt-[10]"
          columnWrapperClassName="flex-row justify-between flex-1"
          // contentContainerClassName="flex-row justify-center flex-wrap border"
          keyExtractor={(item) => item.tmdbId}
          renderItem={renderShow}
          numColumns={2}
          style={[listStyle, { zIndex: 10 }]}
          onScroll={scrollHandler}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="on-drag"
        />
      </View>
    </>
  );
};

export default ShowsContainer;
