import { observable, Observable, ObservableParam } from '@legendapp/state';
import { ObservablePersistMMKV } from '@legendapp/state/persist-plugins/mmkv';
import { syncObservable } from '@legendapp/state/sync';

export interface PersistedObservableOptions {
  id: string | undefined; // Function to get MMKV ID, can be dynamic
  name: string; // Persistence name
}
//~ ------------------------------------------------------------
//~ This function is used to create a persisted observable
//~ that is stored in MMKV
//~ We are using this function because we need to create a new observable and syncObservable
//~ everytime we switch users.
//~ ------------------------------------------------------------
export function setupPersistedObservable<T>(
  // Observable shape to create and persist
  initialState: T,
  // required options - id - the MMKV instance ID, name - the name of the key in MMKV
  options: PersistedObservableOptions
): Observable<T> {
  const newObs$ = observable<T>(initialState);
  // Create a new MMKV config with the provided ID
  const customMMKVConfig = new ObservablePersistMMKV({ id: options.id });
  // This will persist the observable to MMKV
  syncObservable(newObs$ as unknown as ObservableParam<any>, {
    persist: {
      plugin: customMMKVConfig,
      name: options.name,
    },
  });
  return newObs$;
}
