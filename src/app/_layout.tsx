import '~/global.css';

import { Slot, Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { Appearance, View, useColorScheme } from 'react-native';
import { AuthProvider, useAuth } from '~/authentication/AuthProvider';
import * as SplashScreen from 'expo-splash-screen';
import { initTMDB } from '@markmccoid/tmdb_api';
import { QueryClientProvider } from '@tanstack/react-query';
import { CustomLightTheme, CustomDarkTheme } from '../utils/customColorTheme';
// import { useColorScheme } from 'nativewind';
import { ThemeProvider } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Asul_400Regular, Asul_700Bold } from '@expo-google-fonts/asul';
import { useFonts } from '@expo-google-fonts/asul';
import { setupEvents } from '~/utils/events';
import { queryClient } from '~/utils/queryClient';
import { useSyncQueries } from 'tanstack-query-dev-tools-expo-plugin';
import { selectEligibleShows, registerBackgroundTask } from '~/utils/backgroundTasks';
import { use$ } from '@legendapp/state/react';
import { settings$ } from '~/store/store-settings';
import * as Notifications from 'expo-notifications';
import { askNotificationPermissions } from '~/utils/permissions';
import useNotificationObserver from '~/utils/notificationObserver';

const InitialLayout = () => {
  const router = useRouter();
  const { currentUser, initialized } = useAuth();
  const segments = useSegments();
  const [fontsLoaded, error] = useFonts({ Asul_700Bold });
  //! Notification Observer.  Added because notification links were not
  //! getting through via expo-router defaults.
  useNotificationObserver();

  useSyncQueries({ queryClient });
  //~~ ------------------------------------------------------
  //~ Initialize TMDB API
  //~ handle any app initialization
  //~~ ------------------------------------------------------
  useEffect(() => {
    const mainInit = async () => {
      const tmdbKey = process.env.EXPO_PUBLIC_TMDB_API_KEY;
      if (!tmdbKey) throw new Error('TMDB API Key not defined');
      await initTMDB(tmdbKey);
      setupEvents(queryClient);
      await askNotificationPermissions();

      await registerBackgroundTask();
    };

    mainInit();
  }, []);

  //~~ ------------------------------------------------------
  //~ Routing Effect -- This will run on every route change
  //~ making sure we only allow authorized users to get to authed routes
  //~~ ------------------------------------------------------
  // useEffect(() => {
  //   if (!initialized || !fontsLoaded) return;
  //   // Check to see if the route path is in Authed group
  //   const inAuthedGroup = segments[0] === '(authed)';
  //   // If not logged in (no currentUser) and trying to route to an Authed route
  //   // send back to signin page
  //   if (!currentUser && inAuthedGroup) {
  //     router.replace('/signin');
  //     return;
  //   }
  //   // If logged in, but not routing to an Authed page
  //   // Send to root authed group "/"
  //   if (currentUser && !inAuthedGroup) {
  //     router.replace('/(authed)/(tabs)/(home)');
  //     return;
  //   }
  //   // All other routes will fall through to the <Slot />
  // }, [currentUser, initialized, segments, fontsLoaded]);

  //~~ ------------------------------------------------------
  //~~ Hide splashscreen when loaded
  //~~ ------------------------------------------------------
  useEffect(() => {
    if (initialized && fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [initialized, fontsLoaded]);

  return (
    <View style={{ flex: 1 }}>
      <Slot />
    </View>
  );
};

export default function RootLayout() {
  // const { colorScheme } = useColorScheme();
  const colorScheme = useColorScheme();
  const defaultTheme = use$(settings$.defaultTheme);

  const finalTheme = defaultTheme === 'auto' ? colorScheme : defaultTheme;

  useEffect(() => {
    Appearance.setColorScheme(finalTheme);
  }, [finalTheme]);
  //! Uncomment to use the react query dev tools
  // useReactQueryDevTools(queryClient);
  // Appearance.setColorScheme('light');

  return (
    <GestureHandlerRootView>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ThemeProvider value={finalTheme === 'dark' ? CustomDarkTheme : CustomLightTheme}>
            <InitialLayout />
          </ThemeProvider>
        </AuthProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
