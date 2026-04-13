import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  fetchThreadDetailApi,
  downVoteThreadApi,
  neutralVoteThreadApi,
  upVoteThreadApi,
} from '../../api/threadsApi';
import {
  downVoteCommentApi,
  neutralVoteCommentApi,
  upVoteCommentApi,
} from '../../api/commentsApi';

export const fetchThreadDetail = createAsyncThunk(
  'threadDetail/fetchThreadDetail',
  async (threadId, { rejectWithValue }) => {
    try {
      const data = await fetchThreadDetailApi(threadId);
      return data.data.detailThread;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

const getNextVoteType = (currentVote, clickedVote) => (currentVote === clickedVote ? 'neutral' : clickedVote);

const applyVoteToTarget = (state, userId, voteType) => {
  if (!state) return;
  state.upVotesBy = state.upVotesBy.filter((id) => id !== userId);
  state.downVotesBy = state.downVotesBy.filter((id) => id !== userId);
  if (voteType === 'up') state.upVotesBy.push(userId);
  if (voteType === 'down') state.downVotesBy.push(userId);
};

const getCurrentVote = (target, userId) => {
  if (target?.upVotesBy.includes(userId)) return 'up';
  if (target?.downVotesBy.includes(userId)) return 'down';
  return 'neutral';
};

export const upVoteThreadDetail = createAsyncThunk(
  'threadDetail/upVoteThread',
  async ({ threadId, userId }, { getState, rejectWithValue }) => {
    const { thread } = getState().threadDetail;
    const previousVoteStatus = getCurrentVote(thread, userId);
    try {
      const nextVote = getNextVoteType(previousVoteStatus, 'up');
      if (nextVote === 'neutral') await neutralVoteThreadApi(threadId);
      else await upVoteThreadApi(threadId);
      return { userId, nextVote };
    } catch (error) {
      return rejectWithValue({ userId, previousVoteStatus });
    }
  },
);

export const downVoteThreadDetail = createAsyncThunk(
  'threadDetail/downVoteThread',
  async ({ threadId, userId }, { getState, rejectWithValue }) => {
    const { thread } = getState().threadDetail;
    const previousVoteStatus = getCurrentVote(thread, userId);
    try {
      const nextVote = getNextVoteType(previousVoteStatus, 'down');
      if (nextVote === 'neutral') await neutralVoteThreadApi(threadId);
      else await downVoteThreadApi(threadId);
      return { userId, nextVote };
    } catch (error) {
      return rejectWithValue({ userId, previousVoteStatus });
    }
  },
);

export const upVoteComment = createAsyncThunk(
  'threadDetail/upVoteComment',
  async ({ threadId, commentId, userId }, { getState, rejectWithValue }) => {
    const comment = getState().threadDetail.thread?.comments
      ?.find((c) => c.id === commentId);
    const previousVoteStatus = getCurrentVote(comment, userId);
    try {
      const nextVote = getNextVoteType(previousVoteStatus, 'up');
      if (nextVote === 'neutral') await neutralVoteCommentApi(threadId, commentId);
      else await upVoteCommentApi(threadId, commentId);
      return { commentId, userId, nextVote };
    } catch (error) {
      return rejectWithValue({ commentId, userId, previousVoteStatus });
    }
  },
);

export const downVoteComment = createAsyncThunk(
  'threadDetail/downVoteComment',
  async ({ threadId, commentId, userId }, { getState, rejectWithValue }) => {
    const comment = getState().threadDetail.thread?.comments
      ?.find((c) => c.id === commentId);
    const previousVoteStatus = getCurrentVote(comment, userId);
    try {
      const nextVote = getNextVoteType(previousVoteStatus, 'down');
      if (nextVote === 'neutral') await neutralVoteCommentApi(threadId, commentId);
      else await downVoteCommentApi(threadId, commentId);
      return { commentId, userId, nextVote };
    } catch (error) {
      return rejectWithValue({ commentId, userId, previousVoteStatus });
    }
  },
);

const threadDetailSlice = createSlice({
  name: 'threadDetail',
  initialState: {
    thread: null,
    status: 'idle',
    error: null,

    commentStatus: 'idle',
    commentError: null,
  },
  reducers: {
    appendComment: (state, action) => {
      if (state.thread) {
        state.thread.comments.unshift(action.payload);
      }
    },
    clearThreadDetail: (state) => {
      state.thread = null;
      state.status = 'idle';
      state.error = null;
      state.commentStatus = 'idle';
      state.commentError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Detail
      .addCase(fetchThreadDetail.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchThreadDetail.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.thread = action.payload;
      })
      .addCase(fetchThreadDetail.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Up Vote Thread Detail (Optimistic)
      .addCase(upVoteThreadDetail.pending, (state, action) => {
        const { userId } = action.meta.arg;
        const currentVote = getCurrentVote(state.thread, userId);
        applyVoteToTarget(state.thread, userId, getNextVoteType(currentVote, 'up'));
      })
      .addCase(upVoteThreadDetail.fulfilled, () => {})
      .addCase(upVoteThreadDetail.rejected, (state, action) => {
        const { userId, previousVoteStatus } = action.payload;
        applyVoteToTarget(state.thread, userId, previousVoteStatus);
      })

      // Down Vote Thread Detail (Optimistic)
      .addCase(downVoteThreadDetail.pending, (state, action) => {
        const { userId } = action.meta.arg;
        const currentVote = getCurrentVote(state.thread, userId);
        applyVoteToTarget(state.thread, userId, getNextVoteType(currentVote, 'down'));
      })
      .addCase(downVoteThreadDetail.fulfilled, () => {})
      .addCase(downVoteThreadDetail.rejected, (state, action) => {
        const { userId, previousVoteStatus } = action.payload;
        applyVoteToTarget(state.thread, userId, previousVoteStatus);
      })

      // Up Vote Comment (Optimistic)
      .addCase(upVoteComment.pending, (state, action) => {
        const { commentId, userId } = action.meta.arg;
        const comment = state.thread?.comments?.find((c) => c.id === commentId);
        const currentVote = getCurrentVote(comment, userId);
        applyVoteToTarget(comment, userId, getNextVoteType(currentVote, 'up'));
      })
      .addCase(upVoteComment.fulfilled, () => {})
      .addCase(upVoteComment.rejected, (state, action) => {
        const { commentId, userId, previousVoteStatus } = action.payload;
        const comment = state.thread?.comments?.find((c) => c.id === commentId);
        applyVoteToTarget(comment, userId, previousVoteStatus);
      })

      // Down Vote Comment (Optimistic)
      .addCase(downVoteComment.pending, (state, action) => {
        const { commentId, userId } = action.meta.arg;
        const comment = state.thread?.comments?.find((c) => c.id === commentId);
        const currentVote = getCurrentVote(comment, userId);
        applyVoteToTarget(comment, userId, getNextVoteType(currentVote, 'down'));
      })
      .addCase(downVoteComment.fulfilled, () => {})
      .addCase(downVoteComment.rejected, (state, action) => {
        const { commentId, userId, previousVoteStatus } = action.payload;
        const comment = state.thread?.comments?.find((c) => c.id === commentId);
        applyVoteToTarget(comment, userId, previousVoteStatus);
      });
  },
});

export const { appendComment, clearThreadDetail } = threadDetailSlice.actions;

// Selectors
export const selectThreadDetail = (state) => state.threadDetail.thread;
export const selectThreadDetailStatus = (state) => state.threadDetail.status;
export const selectThreadDetailError = (state) => state.threadDetail.error;
export const selectComments = (state) => state.threadDetail.thread?.comments ?? [];
export const selectCommentStatus = (state) => state.threadDetail.commentStatus;

export default threadDetailSlice.reducer;
