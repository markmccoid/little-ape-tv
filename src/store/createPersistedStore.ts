import { observable, Observable, batch } from '@legendapp/state';
import { ObservablePersistMMKV } from '@legendapp/state/persist-plugins/mmkv';
import { syncObservable } from '@legendapp/state/sync';
import { authManager } from '~/authentication/AuthProvider';

export type PersistedObservableOptions = {
  id: string | undefined;
  name: string;
};

//~~ -----------------------------------------
//~~ createAndPersistObservable
//~~ Called via the AuthManager notify() function
//~~ -----------------------------------------
export function createAndPersistObservable<T>(
  initialState: T,
  options: PersistedObservableOptions
): Observable<T> {
  options.id = authManager?.currentUser?.id;
  if (options.id === undefined) {
    options.id = 'placeholder';
  }
  // Create a new observable with the initial state
  const newObs$ = observable<T>(initialState);

  // Configure MMKV persistence
  const customMMKVConfig = new ObservablePersistMMKV({ id: options.id });

  // Sync and persist the observable
  syncObservable(newObs$ as unknown as Observable<any>, {
    persist: {
      plugin: customMMKVConfig,
      name: options.name,
    },
  });

  return newObs$;
}

/*

*/
