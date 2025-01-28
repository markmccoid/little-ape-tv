import { View, Text, TextInput } from 'react-native';
import React, { useCallback } from 'react';
import { use$ } from '@legendapp/state/react';
import { search$ } from '~/store/store-search';
import { debounce } from 'lodash';

const SearchInput = () => {
  const [searchValue, setSearchValue] = React.useState('');
  const searchVal = use$(search$.searchVal);

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
  return (
    <View className="mx-2 mb-[8] mt-[2]  flex-row items-center justify-between">
      <TextInput
        className="flex-grow rounded-lg border-hairline bg-white p-2"
        // className="bg-muted text-muted-foreground w-full rounded-2xl px-3 py-2"
        value={searchValue}
        onChangeText={(text) => handleSearchChange(text)}
        placeholder="Search..."
        autoCapitalize="words"
        autoCorrect={false}
      />
      <View className="flex-row items-center justify-end">
        <View>
          <Text>Side Button</Text>
        </View>
        <View>
          <Text>Side Button</Text>
        </View>
      </View>
    </View>
  );
};

export default SearchInput;
