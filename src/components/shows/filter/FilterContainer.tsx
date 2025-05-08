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
import { useCustomTheme } from '~/utils/customColorTheme';

const FilterContainer = () => {
  const router = useRouter();
  const { colors } = useCustomTheme();
  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 50 }}>
      <Stack.Screen
        options={{
          headerLeft: () => (
            <Pressable onPress={() => router.back()} hitSlop={5}>
              <SymbolView name="x.square.fill" tintColor={colors.primary} size={30} />
            </Pressable>
          ),
          headerRight: () => (
            <Pressable onPress={() => filterCriteria$.actionClearAllCriteria()} hitSlop={5}>
              <SymbolView name="eraser.fill" size={35} />
              {/* <EraserIcon size={30} /> */}
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
