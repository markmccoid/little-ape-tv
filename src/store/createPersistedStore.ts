import { observable, Observable, batch, syncState } from '@legendapp/state';
import { ObservablePersistMMKV } from '@legendapp/state/persist-plugins/mmkv';
import { synced, syncObservable } from '@legendapp/state/sync';
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
  // Configure MMKV persistence
  const customMMKVConfig = new ObservablePersistMMKV({ id: options.id });
  // Create a new observable with the initial state
  // const newObs$ = observable<T>(initialState);
  const newObs$ = observable<T>(
    synced({
      initial: initialState,
      persist: {
        plugin: customMMKVConfig,
        name: options.name,
      },
    })
  );
  console.log('increatepresist', options.id);
  // Sync and persist the observable

  // syncObservable(newObs$ as unknown as Observable<any>, {
  //   persist: {
  //     plugin: customMMKVConfig,
  //     name: options.name,
  //   },
  // });

  return newObs$;
}

/*

*/
