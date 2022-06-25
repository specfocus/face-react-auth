import { createContext } from 'react';
import { UserIdentity } from '../users';
import { AuthProvider } from './AuthProvider';

const defaultIdentity: UserIdentity = { id: '' };

const defaultProvider: AuthProvider = {
  login: () => Promise.resolve(),
  logout: () => Promise.resolve(),
  checkAuth: () => Promise.resolve(),
  checkError: () => Promise.resolve(),
  getPermissions: () => Promise.resolve(),
  getIdentity: () => Promise.resolve(defaultIdentity),
};

const AuthContext = createContext<AuthProvider>(defaultProvider);

AuthContext.displayName = 'AuthContext';

export default AuthContext;
