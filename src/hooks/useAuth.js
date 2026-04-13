import { useCallback } from 'react';
import {
  clearAuthError,
  fetchCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
  selectAuthError,
  selectAuthStatus,
  selectAuthUser,
  selectIsAuthenticated,
} from '../store/slices/authSlice';
import useAppDispatch from './useAppDispatch';
import useAppSelector from './useAppSelector';

const useAuth = () => {
  const dispatch = useAppDispatch();

  const authUser = useAppSelector(selectAuthUser);
  const status = useAppSelector(selectAuthStatus);
  const error = useAppSelector(selectAuthError);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const isLoading = status === 'loading';

  const handleRegister = useCallback(
    (credentials) => dispatch(registerUser(credentials)),
    [dispatch],
  );

  const handleLogin = useCallback(
    (credentials) => dispatch(loginUser(credentials)),
    [dispatch],
  );

  const handleLogout = useCallback(
    () => dispatch(logoutUser()),
    [dispatch],
  );

  const handleFetchCurrentUser = useCallback(
    () => dispatch(fetchCurrentUser()),
    [dispatch],
  );

  const handleClearError = useCallback(
    () => dispatch(clearAuthError()),
    [dispatch],
  );

  return {
    authUser,
    isAuthenticated,
    isLoading,
    error,
    handleRegister,
    handleLogin,
    handleLogout,
    handleFetchCurrentUser,
    handleClearError,
  };
};

export default useAuth;
