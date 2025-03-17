import { View, Text } from 'react-native';
import React, { useCallback } from 'react';
import { use$ } from '@legendapp/state/react';
import { filterCriteria$, SortField } from '~/store/store-filterCriteria';
import type { SortableGridRenderItem } from 'react-native-sortables';
import Sortable from 'react-native-sortables';
import SortItem, { SortItemProps } from './SortItem';
import { reverse, sortBy } from 'lodash';

type Props = {
  currentSortSettings: SortField[];
  reorderSorts: (index: string[]) => void;
  updateActiveFlag: SortItemProps['updateActiveFlag'];
  updateSortDirection: SortItemProps['updateSortDirection'];
};
const SortManager = ({
  currentSortSettings,
  reorderSorts,
  updateActiveFlag,
  updateSortDirection,
}: Props) => {
  const sortSettings = sortBy(currentSortSettings, ['position']);
  // console.log(sortSettings);
  const renderItem = useCallback<SortableGridRenderItem<SortField>>(({ item, index }) => {
    return (
      <Sortable.Handle disabled={!item.active}>
        <SortItem
          key={item.id}
          item={item}
          updateActiveFlag={updateActiveFlag}
          updateSortDirection={updateSortDirection}
        />
      </Sortable.Handle>
    );
  }, []);

  return (
    <View>
      <Sortable.Grid
        columns={1}
        data={sortSettings} // Pass your data here
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        rowGap={1}
        columnGap={10}
        onDragEnd={(parms) => {
          reorderSorts(parms.indexToKey);
        }}
        enableActiveItemSnap={false}
        activeItemScale={0.95}
        // showDropIndicator
        // itemEntering={BounceInRight}
        hapticsEnabled={true}
        strategy={'insert'}
        customHandle
      />
    </View>
  );
};

export default SortManager;
