import '~/global.css';

import { Slot } from 'expo-router';
import { useEffect } from 'react';
import { Appearance, View, Platform } from 'react-native';
import { AuthProvider, useAuth } from '~/authentication/AuthProvider';
import * as SplashScreen from 'expo-splash-screen';
import { initTMDB } from '@markmccoid/tmdb_api';
import { QueryClientProvider } from '@tanstack/react-query';
import { CustomLightTheme, CustomDarkTheme } from '../utils/customColorTheme';
import { useColorScheme } from 'nativewind';
import { ThemeProvider } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Asul_400Regular, Asul_700Bold } from '@expo-google-fonts/asul';
import { Roboto_400Regular, Roboto_500Medium } from '@expo-google-fonts/roboto';
import { useFonts } from '@expo-google-fonts/asul';
import { setupEvents } from '~/utils/events';
import { queryClient } from '~/utils/queryClient';
import { useSyncQueries } from 'tanstack-query-dev-tools-expo-plugin';
import { checkForShowUpdatesAndNotify, registerBackgroundTask } from '~/utils/backgroundTasks';
import { use$ } from '@legendapp/state/react';
import { initializeWatchProviders, settings$ } from '~/store/store-settings';
import { askNotificationPermissions } from '~/utils/permissions';
import useNotificationObserver from '~/utils/notificationObserver';
import { useSyncQueriesExternal } from 'react-query-external-sync';
import { useMMKV } from 'react-native-mmkv';
import { authManager } from '~/authentication/AuthProvider';

const InitialLayout = () => {
  const { currentUser, initialized } = useAuth();
  const [fontsLoaded, error] = useFonts({ Asul_700Bold, Roboto_500Medium, Roboto_400Regular });
  //! Notification Observer.  Added because notification links were not
  //! getting through via expo-router defaults.
  useNotificationObserver();

  // Tanstack Query Dev Tools
  useSyncQueries({ queryClient });
  // Set up the sync hook - automatically disabled in production!
  const mmkv = useMMKV({ id: authManager.currentUser?.id || '' });
  useSyncQueriesExternal({
    queryClient,
    socketURL: 'http://localhost:42831', // Default port for React Native DevTools
    deviceName: Platform?.OS || 'web', // Platform detection
    platform: Platform?.OS || 'web', // Use appropriate platform identifier
    deviceId: Platform?.OS || 'web', // Use a PERSISTENT identifier (see note below)
    extraDeviceInfo: {
      // Optional additional info about your device
      appVersion: '1.0.0',
      // Add any relevant platform info
    },
    enableLogs: false,
    envVariables: {
      NODE_ENV: process.env.NODE_ENV,
      // Add any private environment variables you want to monitor
      // Public environment variables are automatically loaded
    },
    // Storage monitoring with CRUD operations
    mmkvStorage: mmkv, // MMKV storage for ['#storage', 'mmkv', 'key'] queries + monitoring
  });

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
