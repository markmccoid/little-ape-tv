import { View, Text, Pressable, FlatList, Dimensions } from 'react-native';
import React from 'react';
import { useTitleSearch } from '~/data/query.search';
import { use$ } from '@legendapp/state/react';
import { search$ } from '~/store/store-search';
import SearchItem from './SearchItem';
const SearchResults = () => {
  const { width, height } = Dimensions.get('window');

  // searchVal in the show title we are searching for
  const searchVal = use$(search$.searchVal);
  const { data, isLoading, fetchNextPage, hasNextPage } = useTitleSearch(searchVal);

  return (
    <View className="flex-1">
      <FlatList
        data={data}
        className="pt-2"
        keyExtractor={(item) => item.id.toString() + item.isStoredLocally}
        contentContainerClassName="px-[10]"
        columnWrapperClassName="flex-row justify-between flex-1"
        renderItem={({ item }) => <SearchItem searchItem={item} />}
        numColumns={2}
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
