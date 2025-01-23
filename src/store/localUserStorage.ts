import { MMKV } from 'react-native-mmkv';
import { Tag } from './store-shows-local';

type LocalStorageKeys = {
  mmkvid: string;
  tags: Tag[];
};

export class LocalUserStorage {
  private _storage: MMKV;

  constructor(storageID: string) {
    this._storage = new MMKV({ id: storageID });
  }

  public getItem = <K extends keyof LocalStorageKeys>(key: K): LocalStorageKeys[K] | undefined => {
    const value = this._storage.getString(key);
    return value ? JSON.parse(value) : undefined;
  };

  public setItem = <K extends keyof LocalStorageKeys>(key: K, value: LocalStorageKeys[K]): void => {
    this._storage.set(key, JSON.stringify(value));
  };

  public removeItem = (key: keyof LocalStorageKeys): void => {
    this._storage.delete(key);
  };

  public clearAll = (): void => {
    this._storage.clearAll();
  };
}
/**
 *   private setItem = <K extends keyof StorageKeys>(key: K, value: StorageKeys[K]) => {
    if (!this._storage) throw new Error('Storage not initalized');
    this._storage.set(key, JSON.stringify(value));
  };

  private getItem = (key: keyof StorageKeys) => {
    if (!this._storage) throw new Error('Storage not initalized');
    const value = this._storage.getString(key);
    return value ? JSON.parse(value) : undefined;
  };

  private removeItem = (key: keyof StorageKeys) => {
    if (!this._storage) throw new Error('Storage not initalized');
    this._storage.delete(key);
  };
 */
