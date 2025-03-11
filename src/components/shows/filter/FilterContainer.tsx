import { View, Text, ScrollView } from 'react-native';
import React from 'react';
import TagFilter from './TagFilter';
import GenreFilter from './GenreFilter';
import SegmentedControls from './SegmentedControls';
import SortManager from './SortManager';

const FilterContainer = () => {
  return (
    <ScrollView>
      <SegmentedControls />
      <TagFilter />
      <GenreFilter />
      <SortManager />
    </ScrollView>
  );
};

export default FilterContainer;
