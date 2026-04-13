import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { fetchCurrentUserApi, loginUserApi, registerUserApi } from '../../api/authApi';
import { getToken, removeToken, setToken } from '../../utils/tokenHelper';

// Thunk: Register User
export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const data = await registerUserApi(credentials);
      return data.data.user;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

// Thunk: Fetch Current User
export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchCurrentUserApi();
      return data.data.user;
    } catch (error) {
      removeToken();
      return rejectWithValue(error.message);
    }
  },
);

// Thunk: Login User
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { dispatch, rejectWithValue }) => {
    try {
      const data = await loginUserApi(credentials);
      const { token } = data.data;

      setToken(token);

      await dispatch(fetchCurrentUser());

      return token;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

const initialState = {
  authUser: null,
  token: getToken() || null,
  status: 'idle',
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Logout
    logoutUser: (state) => {
      removeToken();
      state.authUser = null;
      state.token = null;
      state.status = 'idle';
      state.error = null;
    },

    /** Reset error */
    clearAuthError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.status = 'idle';
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Login
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.token = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        removeToken();
      })

      // Fetch Current User
      .addCase(fetchCurrentUser.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.authUser = action.payload;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.authUser = null;
        state.token = null;
      });
  },
});

export const { logoutUser, clearAuthError } = authSlice.actions;

export const selectAuthUser = (state) => state.auth.authUser;
export const selectAuthToken = (state) => state.auth.token;
export const selectAuthStatus = (state) => state.auth.status;
export const selectAuthError = (state) => state.auth.error;
export const selectIsAuthenticated = (state) => !!state.auth.authUser;

export default authSlice.reducer;
