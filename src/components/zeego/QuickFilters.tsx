import * as DropdownMenu from 'zeego/dropdown-menu';
import { TouchableOpacity, Text, View, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useCustomTheme } from '~/utils/customColorTheme';
import { SymbolView } from 'expo-symbols';
import { use$ } from '@legendapp/state/react';
import { filterCriteria$ } from '~/store/store-filterCriteria';
import { reverse } from 'lodash';
import { useNavigation, usePathname, useRouter, useSegments } from 'expo-router';

export function QuickFilters() {
  const { colors } = useCustomTheme();
  const router = useRouter();
  const navigation = useNavigation();
  const segments = useSegments() as string[];

  const savedFiltersTemp = use$(filterCriteria$.savedFilters);
  const savedFilters = reverse([...savedFiltersTemp.filter((el) => el.favorite)]);

  const applyFilter = (filterId: string) => {
    // ONLY replace route if NOT on home path
    // this moves us to the right place if searching, etc
    if (!segments.includes('(home)')) {
      router.replace('/(authed)/(tabs)/(home)');
    }
    filterCriteria$.applySavedFilter(filterId);
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}>
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
