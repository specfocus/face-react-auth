import { useBasename } from '@specfocus/view-focus.navigation/routes';
import { removeDoubleSlashes } from '@specfocus/view-focus.navigation/routes/useCreatePath';
import { useLocation } from '@specfocus/view-focus.navigation/routes/useLocation';
import { useNavigate } from '@specfocus/view-focus.navigation/routes/useNavigate';
import { useNotificationContext } from '@specfocus/view-focus.notification/providers/useNotificationContext';
import { useCallback } from 'react';
import { defaultAuthParams, useAuthProvider } from './useAuthProvider';

/**
 * Get a callback for calling the authProvider.login() method
 * and redirect to the previous authenticated page (or the home page) on success.
 *
 * @see useAuthProvider
 *
 * @returns {Function} login callback
 *
 * @example
 *
 * import { useLogin } from '@specfocus/view-focus.mui-demo';
 *
 * const LoginButton = () => {
 *     const [loading, setLoading] = useState(false);
 *     const login = useLogin();
 *     const handleClick = {
 *         setLoading(true);
 *         login({ username: 'john', password: 'p@ssw0rd' }, '/posts')
 *             .then(() => setLoading(false));
 *     }
 *     return <button onClick={handleClick}>Login</button>;
 * }
 */
const useLogin = (): Login => {
  const authProvider = useAuthProvider();
  const location = useLocation();
  const locationState = location.state as any;
  const navigate = useNavigate();
  const basename = useBasename();
  const { resetNotifications } = useNotificationContext();
  const nextPathName = locationState && locationState.nextPathname;
  const nextSearch = locationState && locationState.nextSearch;
  const afterLoginUrl = removeDoubleSlashes(
    `${basename}/${defaultAuthParams.afterLoginUrl}`
  );

  const login = useCallback(
    (params: any = {}, pathName) =>
      authProvider.login(params).then(ret => {
        resetNotifications();
        const redirectUrl = pathName
          ? pathName
          : nextPathName + nextSearch || afterLoginUrl;
        navigate(redirectUrl);
        return ret;
      }),
    [
      authProvider,
      navigate,
      nextPathName,
      nextSearch,
      resetNotifications,
      afterLoginUrl,
    ]
  );

  const loginWithoutProvider = useCallback(
    (_, __) => {
      resetNotifications();
      navigate(afterLoginUrl);
      return Promise.resolve();
    },
    [navigate, resetNotifications, afterLoginUrl]
  );

  return authProvider ? login : loginWithoutProvider;
};

/**
 * Log a user in by calling the authProvider.login() method
 *
 * @param {Object} params Login parameters to pass to the authProvider. May contain username/email, password, etc
 * @param {string} pathName The path to redirect to after login. By default, redirects to the home page, or to the last page visited after disconnection.
 *
 * @return {Promise} The authProvider response
 */
type Login = (params: any, pathName?: string) => Promise<any>;

export default useLogin;
