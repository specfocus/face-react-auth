import { UserIdentity } from '../users';
import { AuthActionType } from '../actions/types';

export type AuthProvider = {
  login: (params: any) => Promise<any>;
  logout: (params: any) => Promise<void | false | string>;
  checkAuth: (params: any) => Promise<void>;
  checkError: (error: any) => Promise<void>;
  getIdentity?: () => Promise<UserIdentity>;
  getPermissions: (params: any) => Promise<any>;
  [key: string]: any;
};

export type LegacyAuthProvider = (
  type: AuthActionType,
  params?: any
) => Promise<any>;