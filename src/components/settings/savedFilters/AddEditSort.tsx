import { View, Text } from 'react-native';
import React from 'react';
import SortManager from '~/components/sortmanager/SortManager';
import { reorderSorts, SortField } from '~/store/store-filterCriteria';

type Props = {
  sortFields?: SortField[];
  updateSortDirection;
  updateActiveFlag;
  savedSortReorder;
};
const AddEditSort = ({
  sortFields,
  updateActiveFlag,
  updateSortDirection,
  savedSortReorder,
}: Props) => {
  return (
    <View>
      <SortManager
        currentSortSettings={sortFields || []}
        reorderSorts={savedSortReorder}
        updateActiveFlag={updateActiveFlag}
        updateSortDirection={updateSortDirection}
      />
    </View>
  );
};

export default AddEditSort;
