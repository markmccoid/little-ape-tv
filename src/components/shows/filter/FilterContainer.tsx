import { View, Text, ScrollView } from 'react-native';
import React from 'react';
import TagFilter from './TagFilter';
import GenreFilter from './GenreFilter';
import SegmentedControls from './SegmentedControls';
import SortManager from '../../sortmanager/SortManager';
import FilterSortManager from './FilterSortManager';

const FilterContainer = () => {
  return (
    <ScrollView>
      <SegmentedControls />
      <TagFilter />
      <GenreFilter />
      <FilterSortManager />
    </ScrollView>
  );
};

export default FilterContainer;
