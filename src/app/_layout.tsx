import '~/global.css';

import { Slot } from 'expo-router';
import { useEffect, useState } from 'react';
import { Appearance, Text, View } from 'react-native';
import { AuthProvider, useAuth } from '~/authentication/AuthProvider';
import * as SplashScreen from 'expo-splash-screen';
import { initTMDB } from '@markmccoid/tmdb_api';
import { QueryClientProvider } from '@tanstack/react-query';
import { CustomLightTheme, CustomDarkTheme } from '../utils/customColorTheme';
import { useColorScheme } from 'nativewind';
import { ThemeProvider } from "expo-router/react-navigation";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Asul_400Regular, Asul_700Bold } from '@expo-google-fonts/asul';
import { Roboto_400Regular, Roboto_500Medium } from '@expo-google-fonts/roboto';
import { useFonts } from '@expo-google-fonts/asul';
import { setupEvents } from '~/utils/events';
import { queryClient, setupAppStateRefresh } from '~/utils/queryClient';
import { useSyncQueries } from 'tanstack-query-dev-tools-expo-plugin';
import { checkForShowUpdatesAndNotify, registerBackgroundTask } from '~/utils/backgroundTasks';
import { use$ } from '@legendapp/state/react';
import { initializeWatchProviders, settings$ } from '~/store/store-settings';
import { askNotificationPermissions } from '~/utils/permissions';
import useNotificationObserver from '~/utils/notificationObserver';
import { databaseReady } from '~/db/client';

//~~ ------------------------------------------------------
//~ Waits for the user's SQLite database to be migrated (and the one-time
//~ legacy MMKV import to finish) before any screen renders
//~~ ------------------------------------------------------
const useDatabaseReady = (userId: string | undefined) => {
  const [state, setState] = useState<{ ready: boolean; error?: Error }>({ ready: false });

  useEffect(() => {
    if (!userId) return;
    setState({ ready: false });
    databaseReady()
      .then(() => setState({ ready: true }))
      .catch((error) => {
        console.error('[db] Failed to prepare database', error);
        setState({ ready: false, error });
      });
  }, [userId]);

  return state;
};

const InitialLayout = () => {
  const { currentUser, initialized } = useAuth();
  const database = useDatabaseReady(currentUser?.id);
  const [fontsLoaded, error] = useFonts({ Asul_700Bold, Roboto_500Medium, Roboto_400Regular });
  //! Notification Observer.  Added because notification links were not
  //! getting through via expo-router defaults.
  useNotificationObserver();

  // Tanstack Query Dev Tools
  useSyncQueries({ queryClient });

  useEffect(() => setupAppStateRefresh(), []);

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
      await registerBackgroundTask();
      initializeWatchProviders();
      await askNotificationPermissions();
      await checkForShowUpdatesAndNotify();
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
    if (initialized && fontsLoaded && (database.ready || database.error)) {
      SplashScreen.hideAsync();
    }
  }, [initialized, fontsLoaded, database.ready, database.error]);

  if (database.error) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Text>Unable to open the show database.</Text>
        <Text>{database.error.message}</Text>
      </View>
    );
  }
  if (!database.ready) return null;

  return (
    <View style={{ flex: 1 }}>
      <Slot />
    </View>
  );
};

export default function RootLayout() {
  const { colorScheme } = useColorScheme();
  const defaultTheme = use$(settings$.defaultTheme);

  const finalTheme = defaultTheme === 'auto' ? (colorScheme ?? 'light') : defaultTheme;

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
