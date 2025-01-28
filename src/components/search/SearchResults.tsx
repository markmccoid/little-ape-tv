import { View, Text, Pressable } from 'react-native';
import React from 'react';
import { useTitleSearch } from '~/data/query.search';
import { use$ } from '@legendapp/state/react';
import { search$ } from '~/store/store-search';
import SearchItem from './SearchItem';

const SearchResults = () => {
  const searchVal = use$(search$.searchVal);
  console.log('searchVal', searchVal);
  const { data, isLoading, fetchNextPage, hasNextPage } = useTitleSearch(searchVal);
  return (
    <View className="flex-1">
      <View>
        <Pressable onPress={() => fetchNextPage()} disabled={!hasNextPage}>
          <Text>Load More</Text>
        </Pressable>
      </View>
      <Text>SearchItem</Text>
      <View>{data && data.map((show) => <SearchItem key={show.id} searchItem={show} />)}</View>
    </View>
  );
};

export default SearchResults;
