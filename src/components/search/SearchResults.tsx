import { View, FlatList, type ListRenderItem } from 'react-native';
import React from 'react';
import { useTitleSearch, type TaggedSearchResult } from '~/data/query.search';
import { use$ } from '@legendapp/state/react';
import { search$ } from '~/store/store-search';
import SearchItem from './SearchItem';
import { settings$ } from '~/store/store-settings';

const keyExtractor = (item: TaggedSearchResult) => item.id.toString();

const SearchResults = () => {
  const searchVal = use$(search$.searchVal);
  const numColumns = use$(settings$.searchNumColumns);
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useTitleSearch(searchVal);

  const renderSearchItem: ListRenderItem<TaggedSearchResult> = ({ item }) => {
    return <SearchItem searchItem={item} numColumns={numColumns} />;
  };

  const loadNextPage = () => {
    if (!hasNextPage || isFetchingNextPage) return;
    fetchNextPage();
  };

  return (
    <View className="flex-1">
      <FlatList
        data={data}
        keyExtractor={keyExtractor}
        contentContainerClassName="px-[10] pb-[100] pt-2"
        columnWrapperClassName="flex-row justify-between"
        renderItem={renderSearchItem}
        numColumns={numColumns}
        key={`${numColumns}:${searchVal}`}
        onEndReachedThreshold={0.7}
        onEndReached={loadNextPage}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
};

export default SearchResults;
