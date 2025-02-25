import { View, Text, TextInput, Pressable } from 'react-native';
import React, { useCallback, useEffect } from 'react';
import { use$ } from '@legendapp/state/react';
import { search$ } from '~/store/store-search';
import { debounce } from 'lodash';
import Input from '~/components/ui/input';
import { SymbolView } from 'expo-symbols';
import { useCustomTheme } from '~/utils/customColorTheme';
import { HomeIcon } from '../common/Icons';
import { useRouter } from 'expo-router';
import { settings$ } from '~/store/store-settings';

const SearchInput = () => {
  const [searchValue, setSearchValue] = React.useState('');
  const searchVal = use$(search$.searchVal);
  const numColumns = use$(settings$.searchNumColumns);

  const { colors } = useCustomTheme();
  const router = useRouter();
  // Debounce the setSearchValue function
  const debouncedSetSearchValue = useCallback(
    debounce((text) => {
      search$.searchVal.set(text);
    }, 500),
    []
  );

  // If searchVal should change externally, this will still update input box
  useEffect(() => {
    setSearchValue(searchVal);
  }, [searchVal]);

  // Apply debounce on text change
  const handleSearchChange = (text: string) => {
    setSearchValue(text); // Keep local value in sync
    debouncedSetSearchValue(text);
  };
  return (
    <View className="mx-2 mb-[8] mt-[2]  flex-row items-center justify-between">
      <Pressable onPress={() => router.replace('/(authed)/(tabs)/(home)')} className="pr-2">
        <SymbolView name="house.fill" tintColor={colors.text} size={30} />
      </Pressable>
      <Input
        className="flex-grow rounded-lg border-hairline bg-background p-2 text-text"
        value={searchValue}
        onChange={(text) => handleSearchChange(text)}
        placeholder="Search..."
        setIsFocused={() => true}
      />

      <View className="flex-row items-center justify-end pl-1">
        <View className="mx-1 rounded-lg border bg-button p-1">
          <SymbolView name="movieclapper" tintColor={colors.buttontext} size={25} />
        </View>
        <Pressable
          onPress={() => settings$.searchNumColumns.set((prev) => (prev === 2 ? 3 : 2))}
          className="mx-1 rounded-lg border bg-button p-1">
          <SymbolView name="movieclapper" tintColor={colors.buttontext} size={25} />
        </Pressable>
      </View>
    </View>
  );
};

export default SearchInput;
