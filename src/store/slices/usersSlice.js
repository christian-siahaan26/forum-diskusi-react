import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { fetchAllUsersApi } from '../../api/usersApi';

export const fetchAllUsers = createAsyncThunk(
  'users/fetchAllUsers',
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchAllUsersApi();
      return data.data.users;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

const usersSlice = createSlice({
  name: 'users',
  initialState: {
    users: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllUsers.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.users = action.payload;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const selectAllUsers = (state) => state.users.users;
export const selectUsersStatus = (state) => state.users.status;

/**
 * Selector factory:
 * @param {string} userId
 */
export const selectUserById = (userId) => (state) => (
  state.users.users.find((user) => user.id === userId) ?? null
);

export default usersSlice.reducer;
