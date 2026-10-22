import { focusManager, QueryClient } from '@tanstack/react-query';
import { AppState } from 'react-native';

import { dbKeys } from '~/data/dbKeys';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000, // 10 minutes (corrected to milliseconds)
    },
  },
});

//~ React Native has no window focus: tell React Query when the app is in the foreground.
//~ SQLite queries never go stale on their own, so they are refreshed explicitly to pick up
//~ anything the background tasks wrote while the app was away.
export const setupAppStateRefresh = () => {
  const subscription = AppState.addEventListener('change', (status) => {
    focusManager.setFocused(status === 'active');
    if (status === 'active') {
      queryClient.invalidateQueries({ queryKey: dbKeys.all });
    }
  });
  return () => subscription.remove();
};
