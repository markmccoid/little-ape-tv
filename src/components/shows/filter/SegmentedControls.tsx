import { View, Text } from 'react-native';
import React from 'react';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import {
  filterCriteria$,
  getInclusionIndex,
  getInclusionValue,
} from '~/store/store-filterCriteria';
import { use$ } from '@legendapp/state/react';

const SegmentedControls = () => {
  const filterIsFavorited = use$(filterCriteria$.baseFilters.filterIsFavorited);
  const filterIsAllWatched = use$(filterCriteria$.baseFilters.filterIsAllWatched);

  return (
    <View>
      <SegmentedControl
        className="w-[100]"
        values={['Ignore', 'Favorites', 'Exclude Favs']}
        selectedIndex={getInclusionIndex(filterIsFavorited)}
        onChange={(event) => {
          const state = event.nativeEvent.selectedSegmentIndex;
          filterCriteria$.baseFilters.filterIsFavorited.set(getInclusionValue(state as 0 | 1 | 2));
        }}
      />
      <SegmentedControl
        className="w-[100]"
        values={['Ignore', 'Watched', 'Exclude Watched']}
        selectedIndex={getInclusionIndex(filterIsAllWatched)}
        onChange={(event) => {
          const state = event.nativeEvent.selectedSegmentIndex;
          filterCriteria$.baseFilters.filterIsAllWatched.set(getInclusionValue(state as 0 | 1 | 2));
        }}
      />
    </View>
  );
};

export default SegmentedControls;
