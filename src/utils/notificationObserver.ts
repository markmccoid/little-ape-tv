import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';

//~ -----------------------------------------------
//~ This is called in the top level _layout.tsx
//~ It will monitor for when a user clicks on a notification
//~ -----------------------------------------------
export default function useNotificationObserver() {
  useEffect(() => {
    // let isMounted = true;

    function redirect(notification: Notifications.Notification) {
      const url = notification?.request?.content?.data?.url;
      if (url) {
        if (router.canDismiss()) {
          router.dismissAll();
        }
        // router.push('./(authed)/(tabs)/(home)');
        router.push(url); // or router.push(url) if you prefer
      }
    }

    // Handle notification when app is opened from a killed/background state
    // Notifications.getLastNotificationResponseAsync().then((response) => {
    //   if (!isMounted || !response?.notification) return;
    //   redirect(response.notification);
    // });

    // Listen for notification taps when app is in foreground/background
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      redirect(response.notification);
    });

    return () => {
      // isMounted = false;
      subscription.remove();
    };
  }, []);
}
