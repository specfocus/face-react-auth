import { BasenameContextProvider } from '@specfocus/view-focus.navigation/routes';
import { HistoryRouter } from '@specfocus/view-focus.navigation/routes/HistoryRouter';
import { useNotify } from '@specfocus/view-focus.notification/providers/useNotify';
import { render, screen, waitFor } from '@testing-library/react';
import expect from 'expect';
import { createMemoryHistory } from 'history';
import { useEffect, useState } from 'react';
import AuthContext from './AuthContext';
import { AuthProvider } from './AuthProvider';
import { useCheckAuth } from './useCheckAuth';

jest.mock('../notifications/useNotify');

const notify = jest.fn();
useNotify.mockImplementation(() => notify);

const TestComponent = ({
  params,
  logoutOnFailure,
  redirectTo,
  disableNotification,
}: {
  params?: any;
  logoutOnFailure?: boolean;
  redirectTo?: string;
  disableNotification?: boolean;
}) => {
  const [authenticated, setAuthenticated] = useState(true);
  const checkAuth = useCheckAuth();
  useEffect(() => {
    checkAuth(params, logoutOnFailure, redirectTo, disableNotification)
      .then(() => setAuthenticated(true))
      .catch(error => setAuthenticated(false));
  }, [params, logoutOnFailure, redirectTo, disableNotification, checkAuth]);
  return <div>{authenticated ? 'authenticated' : 'not authenticated'}</div>;
};

const authProvider: AuthProvider = {
  login: () => Promise.reject('bad method'),
  logout: () => {
    return Promise.resolve();
  },
  checkAuth: params => (params.token ? Promise.resolve() : Promise.reject()),
  checkError: params => {
    if (params instanceof Error && params.message === 'denied') {
      return Promise.reject(new Error('logout'));
    }
    return Promise.resolve();
  },
  getPermissions: () => Promise.reject('not authenticated'),
};

describe('useCheckAuth', () => {
  afterEach(() => {
    notify.mockClear();
  });

  it('should not logout if user is authenticated', async () => {
    const history = createMemoryHistory({ initialEntries: ['/'] });
    render(
      <HistoryRouter history={history}>
        <AuthContext.Provider value={authProvider}>
          <TestComponent params={{ token: true }} />
        </AuthContext.Provider>
      </HistoryRouter>
    );
    await waitFor(() => {
      expect(notify).toHaveBeenCalledTimes(0);
      expect(screen.queryByText('authenticated')).not.toBeNull();
      expect(history.location.pathname).toBe('/');
    });
  });

  it('should logout if user is not authenticated', async () => {
    const history = createMemoryHistory({ initialEntries: ['/'] });
    render(
      <HistoryRouter history={history}>
        <AuthContext.Provider value={authProvider}>
          <TestComponent params={{ token: false }} />
        </AuthContext.Provider>
      </HistoryRouter>
    );
    await waitFor(() => {
      expect(notify).toHaveBeenCalledTimes(1);
      expect(screen.queryByText('authenticated')).toBeNull();
      expect(history.location.pathname).toBe('/login');
    });
  });

  it('should not logout if has no credentials and passed logoutOnFailure as false', async () => {
    const history = createMemoryHistory({ initialEntries: ['/'] });
    render(
      <HistoryRouter history={history}>
        <AuthContext.Provider value={authProvider}>
          <TestComponent
            params={{ token: false }}
            logoutOnFailure={false}
          />
        </AuthContext.Provider>
      </HistoryRouter>
    );
    await waitFor(() => {
      expect(notify).toHaveBeenCalledTimes(0);
      expect(screen.queryByText('not authenticated')).not.toBeNull();
      expect(history.location.pathname).toBe('/');
    });
  });

  it('should logout without showing a notification when disableNotification is true', async () => {
    const history = createMemoryHistory({ initialEntries: ['/'] });
    render(
      <HistoryRouter history={history}>
        <AuthContext.Provider value={authProvider}>
          <TestComponent
            params={{ token: false }}
            disableNotification
          />
        </AuthContext.Provider>
      </HistoryRouter>
    );
    await waitFor(() => {
      expect(notify).toHaveBeenCalledTimes(0);
      expect(screen.queryByText('authenticated')).toBeNull();
      expect(history.location.pathname).toBe('/login');
    });
  });

  it('should logout without showing a notification when authProvider returns error with message false', async () => {
    const history = createMemoryHistory({ initialEntries: ['/'] });
    render(
      <HistoryRouter history={history}>
        <AuthContext.Provider
          value={{
            ...authProvider,
            checkAuth: () => Promise.reject({ message: false }),
          }}
        >
          <TestComponent />
        </AuthContext.Provider>
      </HistoryRouter>
    );
    await waitFor(() => {
      expect(notify).toHaveBeenCalledTimes(0);
      expect(screen.queryByText('authenticated')).toBeNull();
      expect(history.location.pathname).toBe('/login');
    });
  });

  it('should take basename into account when redirecting to login', async () => {
    const history = createMemoryHistory({ initialEntries: ['/foo'] });
    render(
      <HistoryRouter history={history}>
        <BasenameContextProvider basename="/foo">
          <AuthContext.Provider value={authProvider}>
            <TestComponent params={{ token: false }} />
          </AuthContext.Provider>
        </BasenameContextProvider>
      </HistoryRouter>
    );
    await waitFor(() => {
      expect(notify).toHaveBeenCalledTimes(1);
      expect(screen.queryByText('authenticated')).toBeNull();
      expect(history.location.pathname).toBe('/foo/login');
    });
  });
});
