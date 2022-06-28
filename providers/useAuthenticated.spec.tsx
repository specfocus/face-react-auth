import { Route } from '@specfocus/view-focus.navigation/Route';
import { Routes } from '@specfocus/view-focus.navigation/Routes';
import { useLocation } from '@specfocus/view-focus.navigation/useLocation';
import { render, screen, waitFor } from '@testing-library/react';
import expect from 'expect';
import { createMemoryHistory } from 'history';
import React from 'react';
import { BaseRootContext } from '../core';
import { useNotificationContext } from '../notifications';
import { memoryStore } from '@specfocus/view-focus.states/states';
import { Authenticated } from './Authenticated';

describe('useAuthenticated', () => {
  const Foo = () => <div>Foo</div>;

  it('should call authProvider on mount', () => {
    const authProvider = {
      login: () => Promise.reject('bad method'),
      logout: () => Promise.reject('bad method'),
      checkAuth: jest.fn().mockResolvedValueOnce(''),
      checkError: () => Promise.reject('bad method'),
      getPermissions: () => Promise.reject('bad method'),
    };
    const store = memoryStore();
    const reset = jest.spyOn(store, 'reset');
    render(
      <BaseRootContext authProvider={authProvider} store={store}>
        <Authenticated>
          <Foo />
        </Authenticated>
      </BaseRootContext>
    );
    expect(authProvider.checkAuth).toBeCalledTimes(1);
    expect(authProvider.checkAuth.mock.calls[0][0]).toEqual({});
    expect(reset).toHaveBeenCalledTimes(0);
  });

  it('should call authProvider on update', () => {
    const authProvider = {
      login: () => Promise.reject('bad method'),
      logout: () => Promise.reject('bad method'),
      checkAuth: jest.fn().mockResolvedValue(''),
      checkError: () => Promise.reject('bad method'),
      getPermissions: () => Promise.reject('bad method'),
    };
    const store = memoryStore();
    const reset = jest.spyOn(store, 'reset');

    const FooWrapper = props => (
      <BaseRootContext authProvider={authProvider} store={store}>
        <Authenticated {...props}>
          <Foo />
        </Authenticated>
      </BaseRootContext>
    );
    const { rerender } = render(<FooWrapper />);
    rerender(<FooWrapper authParams={{ foo: 'bar' }} />);
    expect(authProvider.checkAuth).toBeCalledTimes(2);
    expect(authProvider.checkAuth.mock.calls[1][0]).toEqual({ foo: 'bar' });
    expect(reset).toHaveBeenCalledTimes(0);
  });

  it('should not block rendering by default', async () => {
    const authProvider = {
      login: () => Promise.reject('bad method'),
      logout: () => Promise.reject('bad method'),
      checkAuth: jest.fn().mockResolvedValue(''),
      checkError: () => Promise.reject('bad method'),
      getPermissions: () => Promise.reject('bad method'),
    };
    const store = memoryStore();
    const reset = jest.spyOn(store, 'reset');

    render(
      <BaseRootContext authProvider={authProvider} store={store}>
        <Authenticated>
          <Foo />
        </Authenticated>
      </BaseRootContext>
    );
    expect(screen.queryByText('Foo')).toBeDefined();
    expect(reset).toHaveBeenCalledTimes(0);
  });

  it('should logout, redirect to login and show a notification after a tick if the auth fails', async () => {
    const authProvider = {
      login: jest.fn().mockResolvedValue(''),
      logout: jest.fn().mockResolvedValue(''),
      checkAuth: jest.fn().mockRejectedValue(undefined),
      checkError: jest.fn().mockResolvedValue(''),
      getPermissions: jest.fn().mockResolvedValue(''),
    };
    const store = memoryStore();
    const reset = jest.spyOn(store, 'reset');
    const history = createMemoryHistory();

    const Login = () => {
      const location = useLocation();
      return (
        <div aria-label="nextPathname">
          {(location.state as any).nextPathname}
        </div>
      );
    };

    let notificationsSpy;
    const Notification = () => {
      const { notifications } = useNotificationContext();
      React.useEffect(() => {
        notificationsSpy = notifications;
      }, [notifications]);
      return null;
    };

    render(
      <BaseRootContext
        authProvider={authProvider}
        history={history}
        store={store}
      >
        <Notification />
        <Routes>
          <Route
            path="/"
            element={
              <Authenticated>
                <Foo />
              </Authenticated>
            }
          />
          <Route path="/login" element={<Login />} />
        </Routes>
      </BaseRootContext>
    );
    await waitFor(() => {
      expect(authProvider.checkAuth.mock.calls[0][0]).toEqual({});
      expect(authProvider.logout.mock.calls[0][0]).toEqual({});
      expect(reset).toHaveBeenCalledTimes(1);
      expect(notificationsSpy).toEqual([
        {
          message: 'auth.auth_check_error',
          type: 'warning',
          notificationOptions: {},
        },
      ]);
      expect(screen.getByLabelText('nextPathname').innerHTML).toEqual(
        '/'
      );
    });
  });
});
