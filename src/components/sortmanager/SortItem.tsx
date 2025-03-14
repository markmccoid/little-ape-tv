import { View, Text, Switch, Pressable } from 'react-native';
import React from 'react';
import { filterCriteria$, SortField } from '~/store/store-filterCriteria';
import { isEnabled } from 'react-native/Libraries/Performance/Systrace';
import { SymbolView } from 'expo-symbols';
import { MotiText, MotiView } from 'moti';

export type SortItemProps = {
  item: SortField;
  updateActiveFlag: (sortField: SortField, newValue: boolean) => void;
  updateSortDirection: (sortField: SortField, prevValue: 'asc' | 'desc') => void;
};

const SortItem = ({ item, updateActiveFlag, updateSortDirection }: SortItemProps) => {
  // console.log('In SortItem', `${item.sortField}-${item.reorderDate}`);

  // const toggleSortDirection = () => {
  //   const newSortDirection = item.sortDirection === 'asc' ? 'desc' : 'asc';
  //   filterCriteria$.updateSortSettings({ ...item, sortDirection: newSortDirection });
  // };

  return (
    <View className="mx-2 flex-row items-center justify-between ">
      <View
        className="bg- mr-2 flex-1 flex-row items-center rounded-lg border bg-card py-2"
        style={{ opacity: item.active ? 1 : 0.5 }}>
        <View className="w-[150] px-2">
          <Text className="font-bold text-text">{item.title}</Text>
        </View>
        <Pressable
          onPress={() => updateSortDirection(item, item.sortDirection)}
          disabled={!item.active}
          className="flex-row items-center">
          <MotiView
            animate={{ rotate: item.sortDirection === 'asc' ? '-75deg' : '75deg' }}
            className="w-[25] flex-shrink flex-row justify-start ">
            <SymbolView name="arrow.right" />
          </MotiView>
          <MotiText
            key={item.sortDirection} // Force remount on prop change
            from={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0.5 }}
            transition={{ type: 'timing', duration: 500 }} // Adjust duration as needed
            exitTransition={{ type: 'timing', duration: 500 }} // Adjust duration as needed
            className="text-text">
            {item.sortDirection}
          </MotiText>
        </Pressable>
      </View>
      <View className="rounded-lg border-hairline bg-white">
        <Switch
          style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
          trackColor={{ false: '#767577', true: '#34C759' }}
          thumbColor={item.active ? '#FFFFFF' : '#F2F2F2'}
          ios_backgroundColor="#767577"
          // trackColor={{ false: '#D3D4D8', true: '#5CD85E' }}
          // thumbColor={'#fff'}
          // ios_backgroundColor={'#D3D4D8'}
          onValueChange={(value) => updateActiveFlag(item, value)}
          value={item.active}
        />
      </View>
    </View>
  );
};

export default SortItem;
