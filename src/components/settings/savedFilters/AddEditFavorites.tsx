import { View, Text } from 'react-native';
import React from 'react';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { getInclusionIndex, getInclusionValue, InclusionState } from '~/store/store-filterCriteria';

type Props = {
  isFavorited: InclusionState;
  setFavorite: (inclusionState: InclusionState) => void;
};
const AddEditFavorites = ({ isFavorited = 'off', setFavorite }: Props) => {
  return (
    <View>
      <SegmentedControl
        className="w-[100]"
        values={['Ignore', 'Favorites', 'Exclude Favs']}
        selectedIndex={getInclusionIndex(isFavorited)}
        onChange={(event) => {
          const state = event.nativeEvent.selectedSegmentIndex;
          setFavorite(getInclusionValue(state as 0 | 1 | 2));
          // console.log('FAV?', filterCriteria$.baseFilters.filterIsFavorited.get());
        }}
      />
    </View>
  );
};

export default AddEditFavorites;
