import { View, Text } from 'react-native';
import React from 'react';
import SortManager from '~/components/sortmanager/SortManager';
import { defaultSort, reorderSorts, SortField } from '~/store/store-filterCriteria';
import { useSavedFilterSort } from './useSavedFilterSort';

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
  // sortFields = sortFields || defaultSort;
  const reOrder = (sortedIds: string[]) => {
    console.log(
      'Reorder',
      sortFields?.map((el) => el.id),
      sortedIds
    );
    reorderSorts(sortedIds, sortFields);
  };

  return (
    <View>
      <SortManager
        currentSortSettings={sortFields}
        reorderSorts={savedSortReorder}
        updateActiveFlag={updateActiveFlag}
        updateSortDirection={updateSortDirection}
      />
    </View>
  );
};

export default AddEditSort;
