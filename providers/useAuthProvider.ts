import { useContext } from 'react';
import AuthContext from './AuthContext';
import { AuthProvider } from './AuthProvider';

export const defaultAuthParams = {
  loginUrl: '/login',
  afterLoginUrl: '/',
};

/**
 * Get the authProvider stored in the context
 */
export const useAuthProvider = (): AuthProvider => useContext(AuthContext);