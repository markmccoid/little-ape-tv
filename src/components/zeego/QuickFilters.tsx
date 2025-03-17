import * as DropdownMenu from 'zeego/dropdown-menu';
import { TouchableOpacity, Text, View, Pressable } from 'react-native';

import { useCustomTheme } from '~/utils/customColorTheme';
import { CloseIcon } from '../common/Icons';
import { SymbolView } from 'expo-symbols';
import { use$ } from '@legendapp/state/react';
import { filterCriteria$ } from '~/store/store-filterCriteria';

export function QuickFilters() {
  const { colors } = useCustomTheme();
  const savedFilters = use$(filterCriteria$.savedFilters);
  console.log(savedFilters.map((el) => el.name));

  const applyFilter = (filterId: string) => {
    filterCriteria$.applySavedFilter(filterId);
  };

  const changeFieldSort = (fieldIn: any) => {
    console.log('change fields', fieldIn);
  };
  const changeSortDirection = (directionIn: any) => {
    console.log('chang srot dir', directionIn);
  };
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <Pressable>
          <SymbolView name="line.3.horizontal.circle.fill" tintColor={colors.primary} size={30} />
        </Pressable>
      </DropdownMenu.Trigger>

      <DropdownMenu.Content>
        {savedFilters?.map((filter) => (
          <DropdownMenu.Item key={filter.id} onSelect={() => applyFilter(filter.id)}>
            <DropdownMenu.ItemTitle>{filter.name}</DropdownMenu.ItemTitle>
          </DropdownMenu.Item>
        ))}

        <DropdownMenu.Item key="label" style={{}} disabled={true}>
          <DropdownMenu.ItemTitle>Saved Filters</DropdownMenu.ItemTitle>
          <DropdownMenu.ItemSubtitle>- Apply a Filter</DropdownMenu.ItemSubtitle>
          <DropdownMenu.ItemIcon
            ios={{
              name: 'line.3.horizontal.decrease',
              pointSize: 18,
              weight: 'semibold',
              scale: 'large',
            }}></DropdownMenu.ItemIcon>
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}

const MenuItem = () => {
  return (
    <View style={{ padding: 10, backgroundColor: 'white' }}>
      <Text>Menu Item</Text>
    </View>
  );
};
