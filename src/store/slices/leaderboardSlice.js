import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { fetchLeaderboardApi } from '../../api/leaderboardApi';

export const fetchLeaderboard = createAsyncThunk(
  'leaderboard/fetchLeaderboard',
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchLeaderboardApi();
      return data.data.leaderboards;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

const leaderboardSlice = createSlice({
  name: 'leaderboard',
  initialState: {
    leaderboard: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeaderboard.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchLeaderboard.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.leaderboard = action.payload;
      })
      .addCase(fetchLeaderboard.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const selectLeaderboard = (state) => state.leaderboard.leaderboard;
export const selectLeaderboardStatus = (state) => state.leaderboard.status;
export const selectLeaderboardError = (state) => state.leaderboard.error;

export default leaderboardSlice.reducer;
