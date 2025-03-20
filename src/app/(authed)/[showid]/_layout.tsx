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
        name="detailimagemodal"
        options={{
          presentation: 'modal',
          title: 'Images',
          headerShown: true,
        }}
      />
      {/* NO LONGER USED - Use the seasonslistmodal at the root so we can access anywhere */}
      <Stack.Screen
        name="seasonslist"
        options={{
          presentation: 'modal',
          title: 'Seasons',
          headerShown: false,
        }}
      />
    </Stack>
  );
}
