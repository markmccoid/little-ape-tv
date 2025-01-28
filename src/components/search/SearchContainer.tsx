import { View, Text, TextInput, Pressable } from 'react-native';
import React, { useCallback, useState } from 'react';
import { useTitleSearch } from '~/data/query.search';
import debounce from 'lodash/debounce';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { use$ } from '@legendapp/state/react';
import { search$ } from '~/store/store-search';
import SearchItem from './SearchItem';
import SearchInput from './SearchInput';
import SearchResults from './SearchResults';

const SearchContainer = () => {
  const { top } = useSafeAreaInsets();
  // const [searchValue, setSearchValue] = React.useState('');
  // const searchVal = use$(search$.searchVal);

  // // Debounce the setSearchValue function
  // const debouncedSetSearchValue = useCallback(
  //   debounce((text) => {
  //     search$.searchVal.set(text);
  //   }, 500),
  //   []
  // );

  // Apply debounce on text change
  // const handleSearchChange = (text: string) => {
  //   setSearchValue(text);
  //   debouncedSetSearchValue(text);
  // };

  // console.log('data', data);
  return (
    <View className="flex-1">
      <View style={{ paddingTop: top, backgroundColor: '#6a9c4f' }}>
        <SearchInput />
      </View>

      <SearchResults />
    </View>
  );
};

export default SearchContainer;
