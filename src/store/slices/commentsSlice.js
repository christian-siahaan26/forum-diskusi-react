import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { createCommentApi } from '../../api/commentsApi';
import { appendComment } from './threadDetailSlice';

export const createComment = createAsyncThunk(
  'comments/createComment',
  async ({ threadId, content }, { dispatch, rejectWithValue }) => {
    try {
      const data = await createCommentApi(threadId, { content });
      const newComment = data.data.comment;

      dispatch(appendComment(newComment));

      return newComment;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

const commentsSlice = createSlice({
  name: 'comments',
  initialState: {
    status: 'idle',
    error: null,
  },
  reducers: {
    clearCommentError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createComment.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(createComment.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(createComment.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { clearCommentError } = commentsSlice.actions;

export const selectCommentSubmitStatus = (state) => state.comments.status;
export const selectCommentSubmitError = (state) => state.comments.error;

export default commentsSlice.reducer;
