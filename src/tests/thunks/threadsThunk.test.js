// src/tests/thunks/threadsThunk.test.js
import {
  describe, it, expect, vi, beforeEach, afterEach,
} from 'vitest';
import { fetchThreads, upVoteThread } from '../../store/slices/threadsSlice';
// Sesuaikan path import ini jika berbeda
import * as threadsApi from '../../api/threadsApi';

vi.mock('../../api/threadsApi');

describe('threadsSlice thunks', () => {
  let dispatch;
  let getState;

  beforeEach(() => {
    dispatch = vi.fn();

    // MOCK STATE: Pastikan state selengkap mungkin agar thunk tidak error di tengah jalan
    getState = vi.fn().mockReturnValue({
      auth: {
        authUser: { id: 'user-1' }, // Berjaga-jaga jika thunk butuh authUser
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

  // ── 1. Uji fetchThreads ──────────────────────────────────────────────────
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

  // ── 2. Uji upVoteThread ──────────────────────────────────────────────────
  describe('upVoteThread thunk', () => {
    it('should dispatch pending and fulfilled when API call succeeds', async () => {
      // Arrange (Mock keduanya agar aman jika ada logika toggle neutral)
      threadsApi.upVoteThreadApi.mockResolvedValue({ status: 'success' });
      threadsApi.neutralVoteThreadApi.mockResolvedValue({ status: 'success' });

      // Act
      const action = upVoteThread({ threadId: 'thread-1', userId: 'user-1' });
      // rejectWithValue kita mock karena thunk mungkin memanggilnya saat error
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
