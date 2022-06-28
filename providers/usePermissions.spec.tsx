import React from 'react';
import expect from 'expect';
import { waitFor, render, screen } from '@testing-library/react';
import { BaseRootContext } from '../core/BaseRootContext';

import usePermissions from './usePermissions';

const UsePermissions = ({ children, authParams }: any) => {
  const res = usePermissions(authParams);
  return children(res);
};

const stateInpector = state => (
  <div>
    <span>{state.isLoading && 'LOADING'}</span>
    {state.permissions && <span>PERMISSIONS: {state.permissions}</span>}
    <span>{state.error && 'ERROR'}</span>
  </div>
);

describe('usePermissions', () => {
  it('should return a loading state on mount', () => {
    render(
      <BaseRootContext>
        <UsePermissions>{stateInpector}</UsePermissions>
      </BaseRootContext>
    );
    expect(screen.queryByText('LOADING')).not.toBeNull();
    expect(screen.queryByText('AUTHENTICATED')).toBeNull();
  });

  it('should return nothing by default after a tick', async () => {
    render(
      <BaseRootContext>
        <UsePermissions>{stateInpector}</UsePermissions>
      </BaseRootContext>
    );
    await waitFor(() => {
      expect(screen.queryByText('LOADING')).toBeNull();
    });
  });

  it('should return the permissions after a tick', async () => {
    const authProvider = {
      login: () => Promise.reject('bad method'),
      logout: () => Promise.reject('bad method'),
      checkAuth: () => Promise.reject('bad method'),
      checkError: () => Promise.reject('bad method'),
      getPermissions: () => Promise.resolve('admin'),
    };
    render(
      <BaseRootContext authProvider={authProvider}>
        <UsePermissions>{stateInpector}</UsePermissions>
      </BaseRootContext>
    );
    await waitFor(() => {
      expect(screen.queryByText('LOADING')).toBeNull();
      expect(screen.queryByText('PERMISSIONS: admin')).not.toBeNull();
    });
  });

  it('should return an error after a tick if the auth call fails', async () => {
    const authProvider = {
      login: () => Promise.reject('bad method'),
      logout: () => Promise.reject('bad method'),
      checkAuth: () => Promise.reject('bad method'),
      checkError: () => Promise.reject('bad method'),
      getPermissions: () => Promise.reject('not good'),
    };
    render(
      <BaseRootContext authProvider={authProvider}>
        <UsePermissions>{stateInpector}</UsePermissions>
      </BaseRootContext>
    );
    await waitFor(() => {
      expect(screen.queryByText('LOADING')).toBeNull();
      expect(screen.queryByText('ERROR')).not.toBeNull();
    });
  });
});
