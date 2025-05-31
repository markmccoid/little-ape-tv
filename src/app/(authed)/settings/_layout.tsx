import Constants from 'expo-constants';
import { Stack, useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { View, Text, Pressable } from 'react-native';
import { useCustomTheme } from '~/utils/customColorTheme';

export default function SettingsLayout() {
  const { colors } = useCustomTheme();
  const router = useRouter();
  const appVersion = Constants.expoConfig?.version;
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerLargeTitle: true,
          headerLargeTitleShadowVisible: true,
          // headerTransparent: true,
          // headerShown: true,
          headerLeft: () => (
            <Pressable onPress={() => router.back()}>
              <SymbolView name="house.fill" size={30} tintColor={colors.text} />
            </Pressable>
          ),
          headerRight: () => {
            return (
              <Pressable onPress={() => router.back()}>
                <Text className="text-lg font-semibold">v{appVersion}</Text>
              </Pressable>
            );
          },
        }}
      />
      <Stack.Screen name="tagsetup" options={{ headerShown: true, title: 'Tag Setup' }} />
      <Stack.Screen
        name="watchprovidersetup"
        options={{ headerShown: true, title: 'Watch Providers' }}
      />
      <Stack.Screen
        name="addwatchprovider"
        options={{ headerShown: true, title: 'Add Watch Provider', presentation: 'modal' }}
      />
      <Stack.Screen
        name="initialQueryRoute"
        options={{ headerShown: true, title: 'Customize Initial Search' }}
      />
      <Stack.Screen
        name="savedfiltersmaint"
        options={{ headerShown: true, title: 'Saved Filters' }}
      />
      <Stack.Screen
        name="addeditfiltermodal"
        options={{ headerShown: true, title: 'Change Me', presentation: 'fullScreenModal' }}
      />
      <Stack.Screen
        name="exportdata"
        options={{ headerShown: true, presentation: 'modal', title: 'Export/Import Data' }}
      />
      <Stack.Screen
        name="schedulednotifications"
        options={{ headerShown: true, presentation: 'modal', title: 'Scheduled Notifications' }}
      />
    </Stack>
  );
}
