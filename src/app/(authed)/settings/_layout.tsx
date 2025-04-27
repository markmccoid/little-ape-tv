import { Stack, useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { View, Text, Pressable } from 'react-native';
import { useCustomTheme } from '~/utils/customColorTheme';

export default function SettingsLayout() {
  const { colors } = useCustomTheme();
  const router = useRouter();

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerLargeTitle: true,
          headerLargeTitleShadowVisible: true,
          // headerTransparent: true,
          // headerShown: true,
          headerRight: () => (
            <Pressable onPress={() => router.back()}>
              <SymbolView name="house.fill" size={30} tintColor={colors.text} />
            </Pressable>
          ),
        }}
      />
      <Stack.Screen name="tagsetup" options={{ headerShown: true, title: 'Tag Setup' }} />
      <Stack.Screen
        name="savedfiltersmaint"
        options={{ headerShown: true, title: 'Saved Filters' }}
      />
      <Stack.Screen
        name="addeditfiltermodal"
        options={{ headerShown: true, title: 'Change Me', presentation: 'fullScreenModal' }}
      />
      <Stack.Screen
        name="schedulednotifications"
        options={{ headerShown: true, presentation: 'modal' }}
      />
    </Stack>
  );
}
