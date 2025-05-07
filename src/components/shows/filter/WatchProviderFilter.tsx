import { View, Text, Pressable, ScrollView } from 'react-native';
import React from 'react';
import { Image } from 'expo-image';
import { settings$ } from '~/store/store-settings';
import { filterCriteria$ } from '~/store/store-filterCriteria';
import { use$ } from '@legendapp/state/react';
import { SymbolView } from 'expo-symbols';
import WatchProviderFilterContainer from '~/components/watchProviders/WatchProviderFilterContainer';
import { EraserIcon } from '~/components/common/Icons';

const WatchProviderFilter = () => {
  const currentFilter = use$(filterCriteria$.baseFilters.includeWatchProviders);

  return (
    <View className="mx-2 mb-2 rounded-xl border-hairline border-border bg-card px-2 py-1">
      <View className=" flex-row justify-between">
        <Text className="text-xl font-semibold">Stream Provider Filter</Text>
        <Pressable onPress={filterCriteria$.clearStreamProviderFilter} className="px-2">
          <EraserIcon />
        </Pressable>
      </View>
      <ScrollView style={{ maxHeight: 300 }}>
        <WatchProviderFilterContainer
          activeProviderIds={currentFilter || []}
          toggleProvider={filterCriteria$.toggleStreamProviderFilter}
        />
      </ScrollView>
    </View>
  );
};

export default WatchProviderFilter;
