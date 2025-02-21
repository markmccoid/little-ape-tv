import { Link, Stack, useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { View, Text, Pressable } from 'react-native';
import { SettingsIcon } from '~/components/common/Icons';
import { HeaderButton } from '~/components/HeaderButton';
import { useCustomTheme } from '~/utils/customColorTheme';

export default function HomeLayout() {
  const { colors } = useCustomTheme();
  const router = useRouter();

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: true,
          headerRight: () => (
            <Link href="./filtermodal" asChild>
              <HeaderButton />
            </Link>
          ),
          headerLeft: () => {
            return (
              <Link href="/settings" className="ml-3">
                <SettingsIcon size={25} />
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
