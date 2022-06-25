import type { Identifier } from '@specfocus/spec-focus/entities';

export type UserCheck = (
  payload: object,
  pathName: string,
  routeParams?: object
) => void;

export interface UserIdentity {
  id: Identifier;
  fullName?: string;
  avatar?: string;
  [key: string]: any;
}
