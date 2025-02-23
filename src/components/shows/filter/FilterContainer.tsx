import { View, Text, ScrollView } from 'react-native';
import React from 'react';
import TagFilter from './TagFilter';
import GenreFilter from './GenreFilter';
import SegmentedControls from './SegmentedControls';

const FilterContainer = () => {
  return (
    <ScrollView>
      <SegmentedControls />
      <TagFilter />
      <GenreFilter />
    </ScrollView>
  );
};

export default FilterContainer;
