import { MMKV } from 'react-native-mmkv';
import uuid from 'react-native-uuid';

export type User = {
  id: string;
  name: string;
};

type StorageKeys = {
  users: User[];
  currentUser: User;
};

type Subscriber = () => void;

export class AuthManager {
  private _currentUser: User | undefined;
  private _initialized = false;
  private _allUsers: User[] = [];
  private _storage: MMKV = new MMKV();
  private _storageAdapter: MMKV | undefined = undefined;
  private _subscribers: Subscriber[] = [];

  constructor() {
    this.initialize();
  }

  private notifySubscribers = () => {
    this._subscribers.forEach((subscriber) => subscriber());
  };

  // Used to subscribe to changes to the AuthManager
  public subscribe = (subscriber: Subscriber) => {
    this._subscribers.push(subscriber);
    // Return a method to unsubsribe
    return () => {
      this._subscribers = this._subscribers.filter((sub) => sub !== subscriber);
    };
  };

  private initialize() {
    const currUser = this.getItem('currentUser');

    this._storageAdapter = this.initCurrentUserStorage(currUser as User | undefined);
    this._currentUser = currUser as User | undefined;
    this._allUsers = this.getUsers();
    this._initialized = true;
    this.notifySubscribers();
  }

  private initCurrentUserStorage = (currentUser: User | undefined): MMKV => {
    if (!currentUser) {
      return new MMKV({ id: `loggedout.placeholder` });
    }
    const storage = new MMKV({ id: `${currentUser.id}.storage` });
    storage.set('mmkvid', `${currentUser.id}.storage`);

    return storage;
  };

  get initialized(): boolean {
    return this._initialized;
  }

  get currentUser(): User | undefined {
    return this._currentUser;
  }

  get allUsers(): User[] {
    return this._allUsers;
  }

  login(user: User) {
    this.setItem('currentUser', user);
    this._storageAdapter = this.initCurrentUserStorage(user);
    this._currentUser = user;

    this.notifySubscribers();
  }

  updateUser(userId: string, newName: string) {
    const existingUsers = (this.getItem('users') as User[]) || [];
    if (!userId || !newName) return;

    const updatedUsers = existingUsers.map((user) => {
      if (user.id === userId) {
        return { ...user, name: newName };
      }
      return user;
    });

    this.setItem('users', updatedUsers);
    this._allUsers = updatedUsers;
    this.notifySubscribers();
  }

  register(newUserName: string) {
    if (!newUserName || newUserName === '') return;
    const existingUsers = (this.getItem('users') as User[]) || [];
    const newUserId = uuid.v4();

    let newUsers: User[] = [...existingUsers];

    if (!existingUsers.some((el) => el.name === newUserName)) {
      newUsers = [...newUsers, { id: newUserId, name: newUserName }];
    }

    this.setItem('users', newUsers);
    this._allUsers = newUsers;
    this.notifySubscribers();
  }

  removeUser(user: User) {
    const existingUsers = (this.getItem('users') as User[]) || undefined;
    if (!existingUsers || !user.id) return undefined;

    const newUsers = existingUsers.filter((el: User) => el.id !== user.id);
    this.setItem('users', newUsers);
    this._allUsers = newUsers;
    // Now we remove the user from the device
    this.deleteUserStorage(user);
    // If removed user was set as currentUser, logout
    const currentUser = this.getItem('currentUser');
    if ((currentUser.id = user.id)) {
      this.logout();
    }
    this.notifySubscribers();
  }

  private deleteUserStorage = (currentUser: User) => {
    const tempStorage = new MMKV({ id: `${currentUser.id}.storage` });
    tempStorage.clearAll();
  };

  logout() {
    this.removeItem('currentUser');
    this._storageAdapter = this.initCurrentUserStorage(undefined);
    this._currentUser = undefined;
    this.notifySubscribers();
  }

  getUsers = (): User[] => {
    return this.getItem('users') || [];
  };

  get userStorage(): MMKV | undefined {
    return this._storageAdapter;
  }

  private setItem = <K extends keyof StorageKeys>(key: K, value: StorageKeys[K]) => {
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
}
