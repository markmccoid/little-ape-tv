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
import { useCustomTheme } from '~/utils/customColorTheme';

const SearchContainer = () => {
  const { top } = useSafeAreaInsets();
  const { colors } = useCustomTheme();
  return (
    <View className="flex-1">
      <View style={{ paddingTop: top, backgroundColor: colors.card }}>
        <SearchInput />
      </View>

      <SearchResults />
    </View>
  );
};

export default SearchContainer;
