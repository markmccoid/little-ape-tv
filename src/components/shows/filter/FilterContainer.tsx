import { View, Text } from 'react-native';
import React from 'react';
import TagFilter from './TagFilter';
import GenreFilter from './GenreFilter';

const FilterContainer = () => {
  return (
    <View>
      <TagFilter />
      <GenreFilter />
    </View>
  );
};

export default FilterContainer;
