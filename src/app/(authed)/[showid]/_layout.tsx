import { Link, Stack, useRouter } from 'expo-router';
import { useCustomTheme } from '~/utils/customColorTheme';

export default function ShowIdLayout() {
  const { colors } = useCustomTheme();
  const router = useRouter();

  return (
    <Stack
      screenOptions={{
        // iOS 26 draws screen content under a translucent bar. An opaque header
        // makes the stack inset the show detail below the bar.
        headerTransparent: false,
        headerStyle: { backgroundColor: colors.background },
      }}>
      <Stack.Screen
        name="index"
        options={{
          headerShown: true,
        }}
        // getId={({ params }) => params.showid}
      />
      <Stack.Screen
        name="[personid]"
        options={{
          headerShown: false,
          // headerTransparent: true,
        }}
        // getId={({ params }) => params.showid}
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
