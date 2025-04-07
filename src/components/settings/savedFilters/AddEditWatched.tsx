import { View, Text } from 'react-native';
import React from 'react';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { getInclusionIndex, getInclusionValue, InclusionState } from '~/store/store-filterCriteria';

type Props = {
  isWatched: InclusionState;
  setWatched: (inclusionState: InclusionState) => void;
};
const AddEditWatched = ({ isWatched = 'off', setWatched }: Props) => {
  return (
    <View>
      <SegmentedControl
        className="w-[100]"
        values={['Ignore', 'Watched', 'Exclude Watched']}
        selectedIndex={getInclusionIndex(isWatched)}
        onChange={(event) => {
          const state = event.nativeEvent.selectedSegmentIndex;
          setWatched(getInclusionValue(state as 0 | 1 | 2));
          // console.log('FAV?', filterCriteria$.baseFilters.filterisWatched.get());
        }}
      />
    </View>
  );
};

export default AddEditWatched;
