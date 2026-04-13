import {
  describe, it, expect, vi, beforeEach, afterEach,
} from 'vitest';
import { fetchThreads, upVoteThread } from '../../store/slices/threadsSlice';
import * as threadsApi from '../../api/threadsApi';

vi.mock('../../api/threadsApi');

describe('threadsSlice thunks', () => {
  let dispatch;
  let getState;

  beforeEach(() => {
    dispatch = vi.fn();

    // MOCK STATE
    getState = vi.fn().mockReturnValue({
      auth: {
        authUser: { id: 'user-1' },
      },
      threads: {
        threads: [
          { id: 'thread-1', upVotesBy: [], downVotesBy: [] },
          { id: 'thread-2', upVotesBy: ['user-789'], downVotesBy: [] },
        ],
      },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // Uji fetchThreads
  describe('fetchThreads thunk', () => {
    it('should dispatch pending and fulfilled when API call succeeds', async () => {
      // Arrange
      threadsApi.fetchThreadsApi.mockResolvedValue({ data: { threads: [] } });

      // Act
      const action = fetchThreads();
      await action(dispatch, getState, undefined);

      // Assert
      expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
        type: fetchThreads.pending.type,
      }));
      expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
        type: fetchThreads.fulfilled.type,
      }));
    });

    it('should dispatch pending and rejected when API call fails', async () => {
      // Arrange
      threadsApi.fetchThreadsApi.mockRejectedValue(new Error('Network Error'));

      // Act
      const action = fetchThreads();
      await action(dispatch, getState, undefined);

      // Assert
      expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
        type: fetchThreads.pending.type,
      }));
      expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
        type: fetchThreads.rejected.type,
      }));
    });
  });

  // Uji upVoteThread
  describe('upVoteThread thunk', () => {
    it('should dispatch pending and fulfilled when API call succeeds', async () => {
      threadsApi.upVoteThreadApi.mockResolvedValue({ status: 'success' });
      threadsApi.neutralVoteThreadApi.mockResolvedValue({ status: 'success' });

      // Act
      const action = upVoteThread({ threadId: 'thread-1', userId: 'user-1' });
      await action(dispatch, getState, { rejectWithValue: vi.fn() });

      // Assert
      expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
        type: upVoteThread.pending.type,
      }));
      expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
        type: upVoteThread.fulfilled.type,
      }));
    });

    it('should dispatch pending and rejected when API call fails', async () => {
      // Arrange
      threadsApi.upVoteThreadApi.mockRejectedValue(new Error('Failed Vote'));
      threadsApi.neutralVoteThreadApi.mockRejectedValue(new Error('Failed Vote'));

      // Act
      const action = upVoteThread({ threadId: 'thread-1', userId: 'user-1' });
      await action(dispatch, getState, { rejectWithValue: vi.fn() });

      // Assert
      expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
        type: upVoteThread.pending.type,
      }));
      expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
        type: upVoteThread.rejected.type,
      }));
    });
  });
});
