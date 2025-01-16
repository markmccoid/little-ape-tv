import '~/global.css';

import { Slot, Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: 'signin',
};

export default function RootLayout() {
  const router = useRouter();
  // useEffect(() => {
  //   router.push('/signin');
  // }, []);

  return <Slot />;
}
