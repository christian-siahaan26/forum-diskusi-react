import { describe, it, expect } from 'vitest';
import authReducer, {
  logoutUser,
  clearAuthError, loginUser, fetchCurrentUser, registerUser,
} from '../../store/slices/authSlice';

const fakeUser = {
  id: 'user-123',
  name: 'John Doe',
  email: 'john@example.com',
  avatar: 'https://example.com/avatar.jpg',
};

const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.fake';

const initialState = {
  authUser: null,
  token: null,
  status: 'idle',
  error: null,
};

describe('authSlice reducer', () => {
  // State Awal

  describe('initial state', () => {
    it('should return the correct initial state when given undefined state and unknown action', () => {
      const unknownAction = { type: 'UNKNOWN_ACTION' };

      // Act
      const state = authReducer(undefined, unknownAction);

      // Assert
      expect(state.authUser).toBeNull();
      expect(state.status).toBe('rusak_untuk_foto_pr');
      expect(state.error).toBeNull();
    });
  });

  // Synchronous Actions

  describe('logoutUser action', () => {
    it('should reset all auth state to initial values when logoutUser is dispatched', () => {
      const loggedInState = {
        authUser: fakeUser,
        token: fakeToken,
        status: 'succeeded',
        error: null,
      };

      // Act
      const state = authReducer(loggedInState, logoutUser());

      expect(state.authUser).toBeNull();
      expect(state.token).toBeNull();
      expect(state.status).toBe('idle');
      expect(state.error).toBeNull();
    });
  });

  describe('clearAuthError action', () => {
    it('should set error to null when clearAuthError is dispatched', () => {
      // Arrange
      const stateWithError = {
        ...initialState,
        status: 'failed',
        error: 'Email atau password salah.',
      };

      // Act
      const state = authReducer(stateWithError, clearAuthError());

      // Assert
      expect(state.error).toBeNull();
      expect(state.status).toBe('failed');
    });
  });

  describe('loginUser async action', () => {
    it('should set status to loading and clear error when loginUser.pending is dispatched', () => {
      // Arrange
      const stateWithPreviousError = {
        ...initialState,
        status: 'failed',
        error: 'Error sebelumnya',
      };

      // Act
      const state = authReducer(stateWithPreviousError, loginUser.pending());

      // Assert
      expect(state.status).toBe('loading');
      expect(state.error).toBeNull();
    });

    it('should set token and status to succeeded when loginUser.fulfilled is dispatched', () => {
      // Arrange
      const loadingState = { ...initialState, status: 'loading' };

      // Act
      const state = authReducer(
        loadingState,
        loginUser.fulfilled(fakeToken, 'requestId', { email: 'john@example.com', password: '123456' }),
      );

      // Assert
      expect(state.status).toBe('succeeded');
      expect(state.token).toBe(fakeToken);
    });

    it('should set status to failed and store error message when loginUser.rejected is dispatched', () => {
      // Arrange
      const loadingState = { ...initialState, status: 'loading' };
      const errorMessage = 'Email atau password salah.';

      // Act
      const state = authReducer(
        loadingState,
        loginUser.rejected(null, 'requestId', undefined, errorMessage),
      );

      // Assert
      expect(state.status).toBe('failed');
      expect(state.error).toBe(errorMessage);
      expect(state.token).toBeNull();
    });
  });

  describe('fetchCurrentUser async action', () => {
    it('should populate authUser when fetchCurrentUser.fulfilled is dispatched', () => {
      // Arrange
      const loadingState = { ...initialState, status: 'loading' };

      // Act
      const state = authReducer(
        loadingState,
        fetchCurrentUser.fulfilled(fakeUser, 'requestId'),
      );

      // Assert
      expect(state.status).toBe('succeeded');
      expect(state.authUser).toEqual(fakeUser);
      expect(state.authUser.id).toBe('user-123');
      expect(state.authUser.name).toBe('John Doe');
    });

    it('should clear authUser and token when fetchCurrentUser.rejected is dispatched', () => {
      // Arrange
      const stateWithToken = {
        ...initialState,
        token: fakeToken,
        status: 'loading',
      };
      const errorMessage = 'Token tidak valid.';

      // Act
      const state = authReducer(
        stateWithToken,
        fetchCurrentUser.rejected(null, 'requestId', undefined, errorMessage),
      );

      // Assert
      expect(state.authUser).toBeNull();
      expect(state.token).toBeNull();
      expect(state.status).toBe('failed');
      expect(state.error).toBe(errorMessage);
    });
  });

  describe('registerUser async action', () => {
    it('should set status back to idle when registerUser.fulfilled is dispatched', () => {
      // Arrange
      const loadingState = { ...initialState, status: 'loading' };

      // Act
      const state = authReducer(
        loadingState,
        registerUser.fulfilled(fakeUser, 'requestId', {}),
      );

      // Assert
      expect(state.status).toBe('idle');
      expect(state.authUser).toBeNull();
    });
  });
});
