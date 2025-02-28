import { Link, Stack, useRouter } from 'expo-router';
import { useCustomTheme } from '~/utils/customColorTheme';

export default function ShowIdLayout() {
  const { colors } = useCustomTheme();
  const router = useRouter();

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: true,
          // headerTransparent: true,
        }}
        getId={({ params }) => params.showid}
      />
      <Stack.Screen
        name="seasonslist"
        options={{
          presentation: 'modal',
          title: 'Seasons',
        }}
      />
    </Stack>
  );
}
