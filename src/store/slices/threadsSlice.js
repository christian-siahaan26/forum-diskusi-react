import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  createThreadApi,
  downVoteThreadApi,
  fetchThreadsApi,
  neutralVoteThreadApi,
  upVoteThreadApi,
} from '../../api/threadsApi';

export const fetchThreads = createAsyncThunk(
  'threads/fetchThreads',
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchThreadsApi();
      return data.data.threads;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

/**
 * @param {{ title: string, body: string, category: string }} threadData
 */
export const createThread = createAsyncThunk(
  'threads/createThread',
  async (threadData, { rejectWithValue }) => {
    try {
      const data = await createThreadApi(threadData);
      return data.data.thread;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

const getNextVoteType = (currentVote, clickedVote) => {
  if (currentVote === clickedVote) return 'neutral';
  return clickedVote;
};

export const upVoteThread = createAsyncThunk(
  'threads/upVote',
  async ({ threadId, userId }, { getState, rejectWithValue }) => {
    const { threads } = getState().threads;
    const thread = threads.find((t) => t.id === threadId);

    const isAlreadyUpVoted = thread.upVotesBy.includes(userId);

    try {
      if (isAlreadyUpVoted) {
        await neutralVoteThreadApi(threadId);
      } else {
        await upVoteThreadApi(threadId);
      }

      return { threadId, userId };
    } catch (error) {
      return rejectWithValue({ threadId, userId, error: error.message });
    }
  },
);

export const downVoteThread = createAsyncThunk(
  'threads/downVote',
  async ({ threadId, userId }, { getState, rejectWithValue }) => {
    const { threads } = getState().threads;
    const thread = threads.find((t) => t.id === threadId);

    const isAlreadyDownVoted = thread.downVotesBy.includes(userId);

    try {
      if (isAlreadyDownVoted) {
        await neutralVoteThreadApi(threadId);
      } else {
        await downVoteThreadApi(threadId);
      }

      return { threadId, userId };
    } catch (error) {
      return rejectWithValue({ threadId, userId, error: error.message });
    }
  },
);

const applyVoteToThread = (threads, threadId, userId, voteType) => {
  const thread = threads.find((t) => t.id === threadId);
  if (!thread) return;

  thread.upVotesBy = thread.upVotesBy.filter((id) => id !== userId);
  thread.downVotesBy = thread.downVotesBy.filter((id) => id !== userId);

  if (voteType === 'up') thread.upVotesBy.push(userId);
  if (voteType === 'down') thread.downVotesBy.push(userId);
};

const rollbackVoteOnThread = (threads, threadId, userId, previousVoteStatus) => {
  applyVoteToThread(threads, threadId, userId, previousVoteStatus);
};

const threadsSlice = createSlice({
  name: 'threads',
  initialState: {
    threads: [],
    status: 'idle',
    error: null,
    activeCategory: 'all',
  },
  reducers: {
    setActiveCategory: (state, action) => {
      state.activeCategory = action.payload;
    },

    clearThreadsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Threads
      .addCase(fetchThreads.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchThreads.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.threads = action.payload;
      })
      .addCase(fetchThreads.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Create Thread
      .addCase(createThread.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(createThread.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.threads.unshift(action.payload);
      })
      .addCase(createThread.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Up Vote Thread (Optimistic)
      .addCase(upVoteThread.pending, (state, action) => {
        const { threadId, userId } = action.meta.arg;
        const thread = state.threads.find((t) => t.id === threadId);
        if (!thread) return;

        let currentVote = 'neutral';
        if (thread?.upVotesBy.includes(userId)) {
          currentVote = 'up';
        } else if (thread?.downVotesBy.includes(userId)) {
          currentVote = 'down';
        }

        const nextVote = getNextVoteType(currentVote, 'up');
        applyVoteToThread(state.threads, threadId, userId, nextVote);
      })
      .addCase(upVoteThread.fulfilled, () => {
      })
      .addCase(upVoteThread.rejected, (state, action) => {
        const { threadId, userId, previousVoteStatus } = action.payload;
        rollbackVoteOnThread(state.threads, threadId, userId, previousVoteStatus);
      })

      // Down Vote Thread (Optimistic)
      .addCase(downVoteThread.pending, (state, action) => {
        const { threadId, userId } = action.meta.arg;
        const thread = state.threads.find((t) => t.id === threadId);
        if (!thread) return;

        let currentVote = 'neutral';
        if (thread?.upVotesBy.includes(userId)) {
          currentVote = 'up';
        } else if (thread?.downVotesBy.includes(userId)) {
          currentVote = 'down';
        }

        const nextVote = getNextVoteType(currentVote, 'down');
        applyVoteToThread(state.threads, threadId, userId, nextVote);
      })
      .addCase(downVoteThread.fulfilled, () => {
      })
      .addCase(downVoteThread.rejected, (state, action) => {
        const { threadId, userId, previousVoteStatus } = action.payload;
        rollbackVoteOnThread(state.threads, threadId, userId, previousVoteStatus);
      });
  },
});

export const { setActiveCategory, clearThreadsError } = threadsSlice.actions;

// Selectors

export const selectAllThreads = (state) => state.threads.threads;
export const selectThreadsStatus = (state) => state.threads.status;
export const selectThreadsError = (state) => state.threads.error;
export const selectActiveCategory = (state) => state.threads.activeCategory;

export const selectFilteredThreads = (state) => {
  const { threads, activeCategory } = state.threads;
  if (activeCategory === 'all') return threads;
  return threads.filter(
    (thread) => thread.category.toLowerCase() === activeCategory.toLowerCase(),
  );
};

// Derived selector
export const selectAllCategories = (state) => {
  const categories = state.threads.threads.map((t) => t.category);
  return ['all', ...new Set(categories)];
};

export default threadsSlice.reducer;
