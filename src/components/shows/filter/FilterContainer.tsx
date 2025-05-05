import { View, Text, ScrollView } from 'react-native';
import React from 'react';
import TagFilter from './TagFilter';
import GenreFilter from './GenreFilter';
import SegmentedControls from './SegmentedControls';
import SortManager from '../../sortmanager/SortManager';
import FilterSortManager from './FilterSortManager';
import WatchProviderFilter from './WatchProviderFilter';

const FilterContainer = () => {
  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 50 }}>
      <SegmentedControls />
      <TagFilter />
      <GenreFilter />
      <FilterSortManager />
      <WatchProviderFilter />
    </ScrollView>
  );
};

export default FilterContainer;
