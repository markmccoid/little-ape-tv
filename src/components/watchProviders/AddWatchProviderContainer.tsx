import { View, Text, FlatList, Pressable, Dimensions, TextInput } from 'react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useMergedWatchProviders, useTMDBConfig } from '~/data/query.search';
import { Image } from 'expo-image';
import {
  settings$,
  toggleWatchProviderAttribs,
  WatchProviderAttributes,
} from '~/store/store-settings';
import { debounce, orderBy } from 'lodash';
import Animated, { FadeIn, FadeOutLeft, LinearTransition } from 'react-native-reanimated';
import Input from '~/components/ui/input';
import { MotiView } from 'moti';
import { SymbolView } from 'expo-symbols';

const { width, height } = Dimensions.get('window');

const AddWatchProviderContainer = () => {
  const [searchValue, setSearchValue] = useState('');
  const [filterState, setFilterState] = useState<'all' | 'enabled' | 'disabled'>('all');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const providersInit = useMergedWatchProviders(debouncedSearch, filterState);
  const providers = orderBy(providersInit, ['isSearchOnly', ['isHidden']], ['desc', 'asc']);

  // Debounce the search input
  const debouncedSetSearch = useRef(
    debounce((text) => {
      setDebouncedSearch(text);
    }, 300)
  ).current;

  // Update debounced value when the user types
  const handleChangeText = (text: string) => {
    setSearchValue(text);
    debouncedSetSearch(text);
  };

  // Clean up debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSetSearch.cancel();
    };
  }, [debouncedSetSearch]);

  const renderItem = ({ item }: { item: WatchProviderAttributes }) => {
    // Skip hidden or search-only providers if neededr
    // if (item.isHidden || item.isSearchOnly) return null;

    return (
      <Animated.View
        exiting={FadeOutLeft}
        entering={FadeIn}
        className="mb-2 mr-[10] flex-col items-center rounded-md border-hairline bg-white p-[10]"
        style={{
          width: (width - 30) / 2,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 2,
          backgroundColor: item.isHidden ? '#ccc' : item.isSearchOnly ? 'white' : '#ccff9955',
        }}>
        <View className="mb-2 flex-row">
          <Pressable
            onPress={() => toggleWatchProviderAttribs(item)}
            className="border-1 rounded-md bg-button px-2 py-1">
            <Text>{item.isSearchOnly === true ? 'Add Provider' : 'Remove Provider'}</Text>
          </Pressable>
          {/* <Pressable
              onPress={() => updateIsSearchOnly(item.providerId)}
              className="border-1 rounded-md bg-button px-2 py-1">
              <Text>{item.isHidden === true ? '' : 'Remove Provider'}</Text>
            </Pressable> */}
        </View>
        <View className="overflow-hidden rounded-lg border-hairline">
          <Image source={item.logoPath} contentFit="contain" style={{ width: 55, height: 55 }} />
        </View>
        <View className="">
          <Text className="text-center font-Roboto-500 text-xl">{item.provider}</Text>
        </View>
      </Animated.View>
    );
  };
  return (
    <View className="">
      <View className="flex-row items-center border-b-hairline">
        <View className="items-cneter my-2 w-1/2 px-2">
          <TextInput
            className="rounded-md border-hairline bg-white p-2"
            placeholder="Search for Provider"
            value={searchValue}
            onChangeText={handleChangeText}
          />
          {searchValue !== '' && (
            <Pressable
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2"
              onPress={() => handleChangeText('')}>
              <MotiView
                from={{ opacity: 0 }}
                animate={{ opacity: searchValue ? 1 : 0 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'timing', duration: 500 }}>
                <SymbolView
                  name="x.circle.fill"
                  type="palette"
                  colors={['white', 'gray']}
                  size={17}
                />
              </MotiView>
            </Pressable>
          )}
        </View>
        <View className="mr-2 flex-grow flex-row justify-between">
          <Pressable
            className={`${filterState === 'all' && 'border-b'} p-1`}
            onPress={() => setFilterState('all')}>
            <Text>All</Text>
          </Pressable>
          <Pressable
            className={`${filterState === 'enabled' && 'border-b'} p-1`}
            onPress={() => setFilterState('enabled')}>
            <Text>Enabled</Text>
          </Pressable>
          <Pressable
            className={`${filterState === 'disabled' && 'border-b'} p-1`}
            onPress={() => setFilterState('disabled')}>
            <Text>Disabled</Text>
          </Pressable>
        </View>
      </View>

      <Animated.FlatList
        data={providers} // Sort by displayPriority
        renderItem={renderItem}
        keyExtractor={(item) => item.providerId.toString()}
        contentContainerStyle={{ padding: 10 }}
        numColumns={2}
        itemLayoutAnimation={LinearTransition}
        keyboardDismissMode="on-drag"
      />
    </View>
  );
};

export default AddWatchProviderContainer;
