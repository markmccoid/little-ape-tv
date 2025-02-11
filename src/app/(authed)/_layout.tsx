import { Slot, Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function AuthedLayout() {
  const router = useRouter();
  // useEffect(() => {
  //   router.push('/signin');
  // }, []);

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="settings"
        options={{ headerShown: false, presentation: 'fullScreenModal' }}
      />
      <Stack.Screen
        name="[showid]"
        options={{ headerShown: false }}
        getId={({ params }) => params?.showid}
      />
      <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
