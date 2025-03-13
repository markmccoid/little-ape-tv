import { View, Text } from 'react-native';
import React, { useCallback } from 'react';
import { use$ } from '@legendapp/state/react';
import { filterCriteria$, SortField } from '~/store/store-filterCriteria';
import type { SortableGridRenderItem } from 'react-native-sortables';
import Sortable from 'react-native-sortables';
import SortItem from './SortItem';

const SortManager = () => {
  const sortSettings = use$(filterCriteria$.sortSettings);
  // console.log(sortSettings);
  const renderItem = useCallback<SortableGridRenderItem<SortField>>(
    ({ item }) => <SortItem item={item} />,
    []
  );

  return (
    <View>
      <Text className="mx-3 text-lg font-semibold text-text">Define Sort</Text>
      <Sortable.Grid
        columns={1}
        data={sortSettings} // Pass your data here
        renderItem={renderItem}
        rowGap={1}
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
