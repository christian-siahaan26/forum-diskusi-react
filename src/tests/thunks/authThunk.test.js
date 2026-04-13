// src/tests/thunks/authThunk.test.js
import {
  describe, it, expect, vi, beforeEach, afterEach,
} from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import authReducer, {
  loginUser,
  registerUser,
  fetchCurrentUser,
} from '../../store/slices/authSlice';
// Import SETELAH vi.mock() agar yang kita dapat adalah versi yang sudah di-mock
import {
  loginUserApi,
  registerUserApi,
  fetchCurrentUserApi,
} from '../../api/authApi';
import { setToken, removeToken } from '../../utils/tokenHelper';

// ─────────────────────────────────────────────────────────────────────────────
// MOCK SETUP
//
// vi.mock() HARUS dipanggil di top-level modul — tidak boleh di dalam
// describe/it/beforeEach. Vitest akan hoist pemanggilan ini ke atas
// secara otomatis sebelum import apapun dieksekusi.
// ─────────────────────────────────────────────────────────────────────────────

vi.mock('../../api/authApi', () => ({
  loginUserApi: vi.fn(),
  registerUserApi: vi.fn(),
  fetchCurrentUserApi: vi.fn(),
}));

// Mock tokenHelper agar tidak benar-benar menyentuh localStorage
vi.mock('../../utils/tokenHelper', () => ({
  getToken: vi.fn(() => null),
  setToken: vi.fn(),
  removeToken: vi.fn(),
}));

// ─────────────────────────────────────────────────────────────────────────────
// FIXTURES
// ─────────────────────────────────────────────────────────────────────────────

const fakeUser = {
  id: 'user-123',
  name: 'John Doe',
  email: 'john@example.com',
  avatar: 'https://ui-avatars.com/api/?name=John+Doe',
};

const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.fake-payload.fake-sig';

const loginCredentials = { email: 'john@example.com', password: 'secret123' };

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: buat store nyata (bukan mock store) agar thunk bisa dispatch
// dan kita bisa inspect state akhirnya.
// Ini lebih andal daripada redux-mock-store untuk menguji state changes.
// ─────────────────────────────────────────────────────────────────────────────

const buildStore = (preloadedState = {}) => configureStore({
  reducer: { auth: authReducer },
  preloadedState,
});

// ─────────────────────────────────────────────────────────────────────────────
// TEST SUITE
// ─────────────────────────────────────────────────────────────────────────────

describe('authSlice thunks', () => {
  beforeEach(() => {
    // Reset semua mock sebelum tiap test agar tidak ada "sisa" dari test sebelumnya
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ── loginUser thunk ─────────────────────────────────────────────────────────

  describe('loginUser thunk', () => {
    it('should dispatch fulfilled, save token, and populate authUser when credentials are valid', async () => {
      // Arrange
      // Setup mock: loginUserApi berhasil → kembalikan token
      loginUserApi.mockResolvedValueOnce({
        status: 'success',
        message: 'ok',
        data: { token: fakeToken },
      });

      // fetchCurrentUserApi dipanggil otomatis di dalam loginUser thunk
      fetchCurrentUserApi.mockResolvedValueOnce({
        status: 'success',
        message: 'ok',
        data: { user: fakeUser },
      });

      const store = buildStore();

      // Act — dispatch thunk seperti yang dilakukan komponen nyata
      const resultAction = await store.dispatch(loginUser(loginCredentials));

      // Assert 1: thunk harus fulfilled
      expect(resultAction.type).toBe(loginUser.fulfilled.type);

      // Assert 2: token harus disimpan ke localStorage
      expect(setToken).toHaveBeenCalledOnce();
      expect(setToken).toHaveBeenCalledWith(fakeToken);

      // Assert 3: state Redux harus terupdate dengan benar
      const { auth } = store.getState();
      expect(auth.status).toBe('succeeded');
      expect(auth.token).toBe(fakeToken);
      expect(auth.authUser).toEqual(fakeUser);
      expect(auth.error).toBeNull();
    });

    it('should dispatch rejected and store error message when API returns error', async () => {
      // Arrange
      // Simulasikan API mengembalikan error (misal: password salah)
      const apiErrorMessage = 'Email atau password salah.';
      loginUserApi.mockRejectedValueOnce(new Error(apiErrorMessage));

      const store = buildStore();

      // Act
      const resultAction = await store.dispatch(loginUser(loginCredentials));

      // Assert 1: thunk harus rejected
      expect(resultAction.type).toBe(loginUser.rejected.type);

      // Assert 2: payload harus berisi pesan error dari API
      expect(resultAction.payload).toBe(apiErrorMessage);

      // Assert 3: state harus mencerminkan kegagalan
      const { auth } = store.getState();
      expect(auth.status).toBe('failed');
      expect(auth.error).toBe(apiErrorMessage);
      expect(auth.token).toBeNull();
      expect(auth.authUser).toBeNull();

      // Assert 4: token TIDAK boleh disimpan jika login gagal
      expect(setToken).not.toHaveBeenCalled();
    });

    it('should call removeToken when loginUser.rejected to clean up any stale token', async () => {
      // Arrange
      loginUserApi.mockRejectedValueOnce(new Error('Unauthorized'));
      const store = buildStore();

      // Act
      await store.dispatch(loginUser(loginCredentials));

      // Assert — pastikan token lama dibersihkan
      expect(removeToken).toHaveBeenCalled();
    });
  });

  // ── registerUser thunk ──────────────────────────────────────────────────────

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

      // Assert 1: thunk harus fulfilled
      expect(resultAction.type).toBe(registerUser.fulfilled.type);

      // Assert 2: API dipanggil dengan argument yang benar
      expect(registerUserApi).toHaveBeenCalledOnce();
      expect(registerUserApi).toHaveBeenCalledWith(registerCredentials);

      // Assert 3: setelah register, user BELUM login (authUser masih null)
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

  // ── fetchCurrentUser thunk ──────────────────────────────────────────────────

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

      // Mulai dari state yang punya token (simulasi app load dengan token lama)
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

      // Assert 1: removeToken dipanggil karena token tidak valid
      expect(removeToken).toHaveBeenCalled();

      // Assert 2: state bersih
      const { auth } = store.getState();
      expect(auth.authUser).toBeNull();
      expect(auth.token).toBeNull();
    });
  });
});
