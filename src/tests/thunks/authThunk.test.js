import {
  describe, it, expect, vi, beforeEach, afterEach,
} from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import authReducer, {
  loginUser,
  registerUser,
  fetchCurrentUser,
} from '../../store/slices/authSlice';
import {
  loginUserApi,
  registerUserApi,
  fetchCurrentUserApi,
} from '../../api/authApi';
import { setToken, removeToken } from '../../utils/tokenHelper';

vi.mock('../../api/authApi', () => ({
  loginUserApi: vi.fn(),
  registerUserApi: vi.fn(),
  fetchCurrentUserApi: vi.fn(),
}));

vi.mock('../../utils/tokenHelper', () => ({
  getToken: vi.fn(() => null),
  setToken: vi.fn(),
  removeToken: vi.fn(),
}));

const fakeUser = {
  id: 'user-123',
  name: 'John Doe',
  email: 'john@example.com',
  avatar: 'https://ui-avatars.com/api/?name=John+Doe',
};

const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.fake-payload.fake-sig';

const loginCredentials = { email: 'john@example.com', password: 'secret123' };

const buildStore = (preloadedState = {}) => configureStore({
  reducer: { auth: authReducer },
  preloadedState,
});

describe('authSlice thunks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // loginUser thunk

  describe('loginUser thunk', () => {
    it('should dispatch fulfilled, save token, and populate authUser when credentials are valid', async () => {
      // Arrange
      loginUserApi.mockResolvedValueOnce({
        status: 'success',
        message: 'ok',
        data: { token: fakeToken },
      });
      fetchCurrentUserApi.mockResolvedValueOnce({
        status: 'success',
        message: 'ok',
        data: { user: fakeUser },
      });

      const store = buildStore();

      const resultAction = await store.dispatch(loginUser(loginCredentials));

      expect(resultAction.type).toBe(loginUser.fulfilled.type);

      expect(setToken).toHaveBeenCalledOnce();
      expect(setToken).toHaveBeenCalledWith(fakeToken);

      const { auth } = store.getState();
      expect(auth.status).toBe('succeeded');
      expect(auth.token).toBe(fakeToken);
      expect(auth.authUser).toEqual(fakeUser);
      expect(auth.error).toBeNull();
    });

    it('should dispatch rejected and store error message when API returns error', async () => {
      // Arrange
      const apiErrorMessage = 'Email atau password salah.';
      loginUserApi.mockRejectedValueOnce(new Error(apiErrorMessage));

      const store = buildStore();

      // Act
      const resultAction = await store.dispatch(loginUser(loginCredentials));

      expect(resultAction.type).toBe(loginUser.rejected.type);

      expect(resultAction.payload).toBe(apiErrorMessage);

      const { auth } = store.getState();
      expect(auth.status).toBe('failed');
      expect(auth.error).toBe(apiErrorMessage);
      expect(auth.token).toBeNull();
      expect(auth.authUser).toBeNull();

      expect(setToken).not.toHaveBeenCalled();
    });

    it('should call removeToken when loginUser.rejected to clean up any stale token', async () => {
      // Arrange
      loginUserApi.mockRejectedValueOnce(new Error('Unauthorized'));
      const store = buildStore();

      // Act
      await store.dispatch(loginUser(loginCredentials));

      expect(removeToken).toHaveBeenCalled();
    });
  });

  // registerUser thunk

  describe('registerUser thunk', () => {
    const registerCredentials = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'secret123',
    };

    it('should dispatch fulfilled with user data when registration succeeds', async () => {
      // Arrange
      registerUserApi.mockResolvedValueOnce({
        status: 'success',
        message: 'User created',
        data: { user: fakeUser },
      });

      const store = buildStore();

      // Act
      const resultAction = await store.dispatch(registerUser(registerCredentials));

      expect(resultAction.type).toBe(registerUser.fulfilled.type);

      expect(registerUserApi).toHaveBeenCalledOnce();
      expect(registerUserApi).toHaveBeenCalledWith(registerCredentials);

      const { auth } = store.getState();
      expect(auth.authUser).toBeNull();
      expect(auth.token).toBeNull();
      expect(auth.status).toBe('idle');
    });

    it('should dispatch rejected with error message when email is already taken', async () => {
      // Arrange
      const errorMessage = 'Email sudah terdaftar.';
      registerUserApi.mockRejectedValueOnce(new Error(errorMessage));

      const store = buildStore();

      // Act
      const resultAction = await store.dispatch(registerUser(registerCredentials));

      // Assert
      expect(resultAction.type).toBe(registerUser.rejected.type);
      expect(resultAction.payload).toBe(errorMessage);

      const { auth } = store.getState();
      expect(auth.status).toBe('failed');
      expect(auth.error).toBe(errorMessage);
    });
  });

  // fetchCurrentUser thunk

  describe('fetchCurrentUser thunk', () => {
    it('should populate authUser in state when token is valid', async () => {
      // Arrange
      fetchCurrentUserApi.mockResolvedValueOnce({
        status: 'success',
        data: { user: fakeUser },
      });

      const store = buildStore();

      // Act
      const resultAction = await store.dispatch(fetchCurrentUser());

      // Assert
      expect(resultAction.type).toBe(fetchCurrentUser.fulfilled.type);
      expect(store.getState().auth.authUser).toEqual(fakeUser);
    });

    it('should call removeToken and clear state when token is expired', async () => {
      // Arrange
      fetchCurrentUserApi.mockRejectedValueOnce(new Error('Token tidak valid.'));

      const store = buildStore({
        auth: {
          authUser: null,
          token: fakeToken,
          status: 'idle',
          error: null,
        },
      });

      // Act
      await store.dispatch(fetchCurrentUser());

      expect(removeToken).toHaveBeenCalled();

      const { auth } = store.getState();
      expect(auth.authUser).toBeNull();
      expect(auth.token).toBeNull();
    });
  });
});
