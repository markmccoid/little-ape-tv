import { View, Text } from 'react-native';
import React, { useCallback } from 'react';
import { use$ } from '@legendapp/state/react';
import { filterCriteria$, SortField } from '~/store/store-filterCriteria';
import type { SortableGridRenderItem } from 'react-native-sortables';
import Sortable from 'react-native-sortables';

const SortManager = () => {
  const sortSettings = use$(filterCriteria$.sortSettings);
  // console.log(sortSettings);
  const renderItem = useCallback<SortableGridRenderItem<SortField>>(
    ({ item }) => (
      <View className="flex-row border bg-white p-1">
        <Text>{item.title}</Text>
        <Text>{item.active}</Text>
        <Text>{item.sortDirection}</Text>
        <Text>{item.sortField}</Text>
      </View>
    ),
    []
  );

  return (
    <View>
      <Sortable.Grid
        columns={1}
        data={sortSettings} // Pass your data here
        renderItem={renderItem}
        rowGap={10}
        columnGap={10}
        onDragEnd={(parms) => filterCriteria$.reorderSortSettings(parms.indexToKey)}
        enableActiveItemSnap={false}
        activeItemScale={0.95}
        // showDropIndicator
        // itemEntering={BounceInRight}
        hapticsEnabled={true}
      />
    </View>
  );
};

export default SortManager;
