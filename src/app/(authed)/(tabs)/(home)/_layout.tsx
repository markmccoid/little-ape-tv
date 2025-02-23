import { Link, Stack, useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { View, Text, Pressable } from 'react-native';
import { FilterIcon, SettingsIcon } from '~/components/common/Icons';
import { HeaderButton } from '~/components/HeaderButton';
import FilterHeaderIcon from '~/components/shows/savedshows/FilterHeaderIcon';
import { useCustomTheme } from '~/utils/customColorTheme';

export default function HomeLayout() {
  const { colors } = useCustomTheme();

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: true,
          headerRight: () => <FilterHeaderIcon />,
          headerLeft: () => {
            return (
              <Link href="/settings" className="ml-3">
                <SettingsIcon size={25} color={colors.primary} />
              </Link>
            );
          },
        }}
      />
      <Stack.Screen
        name="filtermodal"
        options={{
          headerShown: true,
          title: 'Filter Shows',
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}
