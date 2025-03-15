import { View, Text } from 'react-native';
import React from 'react';
import { use$ } from '@legendapp/state/react';
import { filterCriteria$ } from '~/store/store-filterCriteria';
import SortManager from '~/components/sortmanager/SortManager';
import type { SortItemProps } from '~/components/sortmanager/SortItem';

const FilterSortManager = () => {
  const sortSettings = use$(filterCriteria$.sortSettings);
  const reorderFunction = filterCriteria$.reorderSortSettings;
  const updateActiveFlag: SortItemProps['updateActiveFlag'] = (item, newValue) => {
    filterCriteria$.updateSortSettings({ ...item, active: newValue });
  };
  const updateSortDirection: SortItemProps['updateSortDirection'] = (item, prevValue) => {
    const newSortDirection = item.sortDirection === 'asc' ? 'desc' : 'asc';
    filterCriteria$.updateSortSettings({ ...item, sortDirection: newSortDirection });
  };

  return (
    <View>
      <SortManager
        currentSortSettings={sortSettings}
        reorderSorts={reorderFunction}
        updateActiveFlag={updateActiveFlag}
        updateSortDirection={updateSortDirection}
      />
    </View>
  );
};

export default FilterSortManager;
