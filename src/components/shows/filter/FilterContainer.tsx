import { View, Text, ScrollView, Pressable } from 'react-native';
import React from 'react';
import TagFilter from './TagFilter';
import GenreFilter from './GenreFilter';
import SegmentedControls from './SegmentedControls';
import SortManager from '../../sortmanager/SortManager';
import FilterSortManager from './FilterSortManager';
import WatchProviderFilter from './WatchProviderFilter';
import { Stack, useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { EraserIcon } from '~/components/common/Icons';
import { filterCriteria$ } from '~/store/store-filterCriteria';

const FilterContainer = () => {
  const router = useRouter();
  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 50 }}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Pressable onPress={() => router.back()} hitSlop={2}>
              <SymbolView name="x.square" size={35} />
            </Pressable>
          ),
          headerLeft: () => (
            <Pressable onPress={() => filterCriteria$.actionClearAllCriteria()} hitSlop={2}>
              {/* <SymbolView name="eraser" size={35} /> */}
              <EraserIcon size={35} />
            </Pressable>
          ),
        }}
      />
      <SegmentedControls />
      <TagFilter />
      <GenreFilter />
      <FilterSortManager />
      <WatchProviderFilter />
    </ScrollView>
  );
};

export default FilterContainer;
