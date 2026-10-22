import { Link, Stack, useRouter } from 'expo-router';
import { useCustomTheme } from '~/utils/customColorTheme';

export default function ShowIdLayout() {
  const { colors } = useCustomTheme();
  const router = useRouter();

  return (
    <Stack
      screenOptions={{
        headerTransparent: false,
        headerStyle: { backgroundColor: colors.background },
      }}>
      <Stack.Screen
        name="index"
        options={{
          headerShown: true,
          title: '',
        }}
        // getId={({ params }) => params.personid}
      />
    </Stack>
  );
}
