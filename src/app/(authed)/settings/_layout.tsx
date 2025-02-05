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
          headerShown: true,
          headerLeft: () => (
            <Pressable onPress={() => router.back()}>
              <SymbolView name="house.fill" size={30} tintColor={colors.text} />
            </Pressable>
          ),
        }}
      />
      <Stack.Screen name="tagsetup" options={{ headerShown: true, title: 'Tag Setup' }} />
    </Stack>
  );
}
