import { View, Text } from 'react-native';
import React from 'react';
import { use$ } from '@legendapp/state/react';
import { filterCriteria$, useSortSettings } from '~/store/store-filterCriteria';
import SortManager from '~/components/sortmanager/SortManager';
import type { SortItemProps } from '~/components/sortmanager/SortItem';
import TransparentBackground from '~/components/common/TransparentBackground';
import { priorityMergeArrays } from '~/utils/utils';

const FilterSortManager = () => {
  // const sortSettings = use$(filterCriteria$.sortSettings);
  const sortSettings = useSortSettings();
  const reorderFunction = filterCriteria$.reorderSortSettings;
  const updateActiveFlag: SortItemProps['updateActiveFlag'] = (item, newValue) => {
    filterCriteria$.updateSortSettings({ ...item, active: newValue });
  };
  const updateSortDirection: SortItemProps['updateSortDirection'] = (item, prevValue) => {
    const newSortDirection = item.sortDirection === 'asc' ? 'desc' : 'asc';
    filterCriteria$.updateSortSettings({ ...item, sortDirection: newSortDirection });
  };

  return (
    <View className="m-2 p-1 pb-2">
      <TransparentBackground />
      <Text className="px-2 pb-2 text-xl font-semibold text-text">Sort Settings</Text>
      <SortManager
        currentSortSettings={sortSettings}
        // currentSortSettings={priorityMergeArrays(sortSettings || [], defaultSort)}
        reorderSorts={reorderFunction}
        updateActiveFlag={updateActiveFlag}
        updateSortDirection={updateSortDirection}
      />
    </View>
  );
};

export default FilterSortManager;
