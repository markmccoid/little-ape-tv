import { View, Text, TextInput, Pressable } from 'react-native';
import React, { useCallback, useState } from 'react';
import { useTitleSearch } from '~/data/query.search';
import debounce from 'lodash/debounce';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { use$ } from '@legendapp/state/react';
import { search$ } from '~/store/store-search';

const SearchContainer = () => {
  const { top } = useSafeAreaInsets();
  const [searchValue, setSearchValue] = React.useState('');
  const searchVal = use$(search$.searchVal);
  const [debouncedSearchValue, setDebouncedSearchValue] = useState('');

  // Debounce the setSearchValue function
  const debouncedSetSearchValue = useCallback(
    debounce((text) => {
      search$.searchVal.set(text);
    }, 500),
    []
  );

  // Apply debounce on text change
  const handleSearchChange = (text: string) => {
    setSearchValue(text);

    debouncedSetSearchValue(text);
  };
  const { data, isLoading, fetchNextPage, hasNextPage } = useTitleSearch(debouncedSearchValue);
  // console.log('data', data);
  return (
    <View className="flex-1" style={{ paddingTop: top }}>
      <View className="mx-2 mt-[10] flex-row items-center justify-center">
        <View className="flex-1">
          <Pressable onPress={() => fetchNextPage()} disabled={!hasNextPage}>
            <Text>Load More</Text>
          </Pressable>
        </View>
        <TextInput
          className="w-8/12 rounded-lg border-hairline bg-white p-2"
          value={searchValue}
          onChangeText={(text) => handleSearchChange(text)}
          placeholder="Search..."
        />
        <View className="flex-1 flex-row items-center justify-end">
          <Pressable onPress={() => fetchNextPage()} disabled={!hasNextPage}>
            <Text>Load More</Text>
          </Pressable>
        </View>
      </View>
      <Text>{searchVal}</Text>
      <View>{data && data.map((show) => <Text key={show.id}>{show.name}</Text>)}</View>
    </View>
  );
};

export default SearchContainer;
