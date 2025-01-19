import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthManager, User } from './AuthManager';
import { MMKV } from 'react-native-mmkv';

type AuthProps = {
  initialized: AuthManager['initialized'];
  login: AuthManager['login'];
  register: AuthManager['register'];
  logout: AuthManager['logout'];
  removeUser: AuthManager['removeUser'];
  updateUser: AuthManager['updateUser'];
  currentUser: AuthManager['currentUser'];
  allUsers: AuthManager['allUsers'];
  userStorage: MMKV | undefined;
};

const AuthContext = createContext<AuthProps | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

const authManager = new AuthManager();

export const AuthProvider = ({ children }: any) => {
  const [, setUpdate] = useState({});

  // Subscribe to auth manager updates
  // This is important so that we get updates when authProvider changes when one of functions (login, etc) is called
  // the setUpdate() simple forces a rerender
  useEffect(() => {
    const unsub = authManager.subscribe(() => {
      setUpdate({});
    });
    return unsub;
  }, []);

  const value: AuthProps = {
    initialized: authManager.initialized,
    login: (user) => authManager.login(user),
    register: (username) => authManager.register(username),
    logout: () => authManager.logout(),
    removeUser: (user) => authManager.removeUser(user),
    updateUser: (id, newName) => authManager.updateUser(id, newName),
    currentUser: authManager.currentUser,
    allUsers: authManager.allUsers,
    userStorage: authManager.userStorage,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
