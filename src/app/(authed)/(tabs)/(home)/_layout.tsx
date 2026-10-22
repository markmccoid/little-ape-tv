import { Link, Stack, useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { View, Text, Pressable } from 'react-native';
import { FilterIcon, SettingsIcon } from '~/components/common/Icons';
import FilterHeaderIcon from '~/components/shows/savedshows/FilterHeaderIcon';
import { useCustomTheme } from '~/utils/customColorTheme';

export default function HomeLayout() {
  const { colors } = useCustomTheme();
  const router = useRouter();
  return (
    <Stack
      screenOptions={{
        // iOS 26 draws screen content under a translucent bar. An opaque header
        // makes the stack inset the screen below the bar.
        headerTransparent: false,
        headerStyle: { backgroundColor: colors.background },
      }}>
      <Stack.Screen
        name="index"
        options={{
          headerShown: true,
          headerRight: () => <FilterHeaderIcon />,
          headerLeft: () => {
            return (
              <Pressable
                className="h-[40] w-[40] items-center justify-center"
                onPress={() => router.push('/settings')}>
                <SettingsIcon size={25} color={colors.primary} />
              </Pressable>
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
