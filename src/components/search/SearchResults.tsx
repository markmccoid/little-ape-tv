import { View, Text, Pressable, FlatList, Dimensions } from 'react-native';
import React from 'react';
import { useTitleSearch } from '~/data/query.search';
import { use$ } from '@legendapp/state/react';
import { search$ } from '~/store/store-search';
import SearchItem from './SearchItem';
import Animated, { FadeInRight, FadeOut } from 'react-native-reanimated';
import useImageSize from '~/utils/useImageSize';
import { settings$ } from '~/store/store-settings';

//-- Used in SearchResult and in getItemLayout --
// Bottom Margin
const BOTTOM_MARGIN = 25;
// extra height for the bottom "button" to select/unselect movie
const EXTRA_HEIGHT = 0;

const SearchResults = () => {
  const { width, height } = Dimensions.get('window');

  // searchVal in the show title we are searching for
  const searchVal = use$(search$.searchVal);
  const numColumns = use$(settings$.searchNumColumns);
  const { imageHeight, imageWidth } = useImageSize(numColumns);
  const { data, isLoading, fetchNextPage, hasNextPage } = useTitleSearch(searchVal);

  const getItemLayout = (_, index: number) => ({
    length: imageHeight + BOTTOM_MARGIN + EXTRA_HEIGHT, // Item height plus in SearchResult there is A bottom margin and extra height added to imageHeight
    offset: (imageHeight + BOTTOM_MARGIN + EXTRA_HEIGHT) * index, // Offset for the current index
    index,
  });

  return (
    <View className="flex-1">
      <FlatList
        data={data}
        className="pt-2"
        getItemLayout={getItemLayout}
        keyExtractor={(item) => item.id.toString()}
        // keyExtractor={(item) => item.id.toString() + item.isStoredLocally}
        contentContainerClassName="px-[10]"
        columnWrapperClassName="flex-row justify-between flex-1"
        renderItem={({ item }) => {
          return (
            <Animated.View entering={FadeInRight} exiting={FadeOut}>
              <SearchItem searchItem={item} numColumns={numColumns} />
            </Animated.View>
          );
        }}
        numColumns={numColumns}
        key={numColumns}
        onEndReachedThreshold={0.7}
        onEndReached={({ distanceFromEnd }) => {
          fetchNextPage();
        }}
        keyboardDismissMode="on-drag" // Dismiss keyboard when scrolling starts
        keyboardShouldPersistTaps="handled" // Prevent keyboard from persisting when tapping on items
      />
      {/* <View>{data && data.map((show) => <SearchItem key={show.id} searchItem={show} />)}</View> */}
    </View>
  );
};

export default SearchResults;
