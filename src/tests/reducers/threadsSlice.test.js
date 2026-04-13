// src/tests/reducers/threadsSlice.test.js
import { describe, it, expect } from 'vitest';
import threadsReducer, {
  setActiveCategory,
  clearThreadsError,
  fetchThreads,
  createThread,
  upVoteThread,
  downVoteThread,
} from '../../store/slices/threadsSlice';
// import {
//   fetchThreads,
//   createThread,
//   upVoteThread,
//   downVoteThread,
// } from '../../store/slices/threadsSlice';

// ─────────────────────────────────────────────────────────────────────────────
// FIXTURES
// ─────────────────────────────────────────────────────────────────────────────

const fakeThread1 = {
  id: 'thread-1',
  title: 'Belajar Redux Toolkit',
  body: 'Bagaimana cara pakai createSlice?',
  category: 'redux',
  ownerId: 'user-123',
  createdAt: '2024-01-01T00:00:00.000Z',
  upVotesBy: [],
  downVotesBy: [],
  totalComments: 0,
};

const fakeThread2 = {
  id: 'thread-2',
  title: 'React Performance',
  body: 'Tips optimasi React app',
  category: 'react',
  ownerId: 'user-456',
  createdAt: '2024-01-02T00:00:00.000Z',
  upVotesBy: ['user-789'],
  downVotesBy: [],
  totalComments: 3,
};

const newFakeThread = {
  id: 'thread-3',
  title: 'Thread Baru',
  body: 'Isi thread baru',
  category: 'general',
  ownerId: 'user-123',
  createdAt: '2024-01-03T00:00:00.000Z',
  upVotesBy: [],
  downVotesBy: [],
  totalComments: 0,
};

const initialState = {
  threads: [],
  status: 'idle',
  error: null,
  activeCategory: 'all',
};

const populatedState = {
  ...initialState,
  threads: [fakeThread1, fakeThread2],
  status: 'succeeded',
};

// ─────────────────────────────────────────────────────────────────────────────
// TEST SUITE
// ─────────────────────────────────────────────────────────────────────────────

describe('threadsSlice reducer', () => {
  // ── State Awal ──────────────────────────────────────────────────────────────

  describe('initial state', () => {
    it('should return correct initial state when given undefined state and unknown action', () => {
      // Act
      const state = threadsReducer(undefined, { type: 'UNKNOWN' });

      // Assert
      expect(state.threads).toEqual([]);
      expect(state.status).toBe('idle');
      expect(state.error).toBeNull();
      expect(state.activeCategory).toBe('all');
    });
  });

  // ── Synchronous Actions ─────────────────────────────────────────────────────

  describe('setActiveCategory action', () => {
    it('should update activeCategory when setActiveCategory is dispatched', () => {
      // Act
      const state = threadsReducer(initialState, setActiveCategory('react'));

      // Assert
      expect(state.activeCategory).toBe('react');
    });

    it('should set activeCategory back to all when setActiveCategory("all") is dispatched', () => {
      // Arrange — simulasi user sudah memilih kategori sebelumnya
      const filteredState = { ...initialState, activeCategory: 'redux' };

      // Act
      const state = threadsReducer(filteredState, setActiveCategory('all'));

      // Assert
      expect(state.activeCategory).toBe('all');
    });
  });

  describe('clearThreadsError action', () => {
    it('should set error to null when clearThreadsError is dispatched', () => {
      // Arrange
      const errorState = { ...initialState, status: 'failed', error: 'Gagal memuat thread.' };

      // Act
      const state = threadsReducer(errorState, clearThreadsError());

      // Assert
      expect(state.error).toBeNull();
    });
  });

  // ── fetchThreads lifecycle ──────────────────────────────────────────────────

  describe('fetchThreads async action', () => {
    it('should set status to loading when fetchThreads.pending is dispatched', () => {
      // Act
      const state = threadsReducer(initialState, fetchThreads.pending());

      // Assert
      expect(state.status).toBe('loading');
      expect(state.error).toBeNull();
    });

    it('should populate threads array when fetchThreads.fulfilled is dispatched', () => {
      // Arrange
      const threads = [fakeThread1, fakeThread2];

      // Act
      const state = threadsReducer(
        { ...initialState, status: 'loading' },
        fetchThreads.fulfilled(threads, 'requestId'),
      );

      // Assert
      expect(state.status).toBe('succeeded');
      expect(state.threads).toHaveLength(2);
      expect(state.threads[0].id).toBe('thread-1');
      expect(state.threads[1].id).toBe('thread-2');
    });

    it('should set error when fetchThreads.rejected is dispatched', () => {
      // Act
      const state = threadsReducer(
        { ...initialState, status: 'loading' },
        fetchThreads.rejected(null, 'requestId', undefined, 'Network Error'),
      );

      // Assert
      expect(state.status).toBe('failed');
      expect(state.error).toBe('Network Error');
      expect(state.threads).toEqual([]);
    });
  });

  // ── createThread lifecycle ──────────────────────────────────────────────────

  describe('createThread async action', () => {
    it('should prepend new thread to the beginning of threads array when createThread.fulfilled', () => {
      // Arrange — state sudah ada 2 thread
      const stateWithThreads = { ...populatedState, status: 'loading' };

      // Act
      const state = threadsReducer(
        stateWithThreads,
        createThread.fulfilled(newFakeThread, 'requestId', {}),
      );

      // Assert
      expect(state.threads).toHaveLength(3);
      // Thread baru harus ada di INDEX 0 (prepend dengan unshift)
      expect(state.threads[0].id).toBe('thread-3');
      expect(state.threads[0].title).toBe('Thread Baru');
      // Thread lama tetap ada di belakangnya
      expect(state.threads[1].id).toBe('thread-1');
    });
  });

  // ── Optimistic Vote ─────────────────────────────────────────────────────────
  // Ini bagian paling penting — verifikasi bahwa state berubah SEGERA
  // saat pending (sebelum API selesai), dan rollback saat rejected.

  describe('upVoteThread optimistic update', () => {
    it('should add userId to upVotesBy immediately when upVoteThread.pending is dispatched', () => {
      // Arrange — thread-1 belum punya vote sama sekali
      const arg = { threadId: 'thread-1', userId: 'user-999' };

      // Act — kirim action pending dengan meta.arg yang benar
      const state = threadsReducer(
        populatedState,
        { type: upVoteThread.pending.type, meta: { arg } },
      );

      // Assert — user-999 harus masuk ke upVotesBy
      const updatedThread = state.threads.find((t) => t.id === 'thread-1');
      expect(updatedThread.upVotesBy).toContain('user-999');
      expect(updatedThread.downVotesBy).not.toContain('user-999');
    });

    it('should toggle upVote to neutral (remove from upVotesBy) if user already upvoted', () => {
      // Arrange — thread-1 dengan user-999 yang sudah upvote
      const stateWithVote = {
        ...populatedState,
        threads: [
          { ...fakeThread1, upVotesBy: ['user-999'] },
          fakeThread2,
        ],
      };
      const arg = { threadId: 'thread-1', userId: 'user-999' };

      // Act — user klik upvote lagi → harus toggle off (neutral)
      const state = threadsReducer(
        stateWithVote,
        { type: upVoteThread.pending.type, meta: { arg } },
      );

      // Assert — user-999 harus TIDAK ADA di upVotesBy (toggled off)
      const updatedThread = state.threads.find((t) => t.id === 'thread-1');
      expect(updatedThread.upVotesBy).not.toContain('user-999');
    });

    it('should rollback vote when upVoteThread.rejected is dispatched', () => {
      // Arrange — simulasi state setelah optimistic update (user ada di upVotesBy)
      const stateAfterOptimistic = {
        ...populatedState,
        threads: [
          { ...fakeThread1, upVotesBy: ['user-999'] },
          fakeThread2,
        ],
      };

      // Act — API gagal, rollback ke neutral (previousVoteStatus = 'neutral')
      const state = threadsReducer(
        stateAfterOptimistic,
        {
          type: upVoteThread.rejected.type,
          payload: { threadId: 'thread-1', userId: 'user-999', previousVoteStatus: 'neutral' },
        },
      );

      // Assert — user-999 harus hilang dari upVotesBy (rollback)
      const rolledBackThread = state.threads.find((t) => t.id === 'thread-1');
      expect(rolledBackThread.upVotesBy).not.toContain('user-999');
    });
  });

  describe('downVoteThread optimistic update', () => {
    it('should add userId to downVotesBy and remove from upVotesBy when downVoteThread.pending', () => {
      // Arrange — user-789 sudah upvote thread-2, sekarang mau downvote
      // (thread-2 sudah punya upVotesBy: ['user-789'] dari fixture)
      const arg = { threadId: 'thread-2', userId: 'user-789' };

      // Act
      const state = threadsReducer(
        populatedState,
        { type: downVoteThread.pending.type, meta: { arg } },
      );

      // Assert
      const updatedThread = state.threads.find((t) => t.id === 'thread-2');
      // Harus pindah dari upVotesBy ke downVotesBy
      expect(updatedThread.downVotesBy).toContain('user-789');
      expect(updatedThread.upVotesBy).not.toContain('user-789');
    });

    it('should rollback to previous upvote when downVoteThread.rejected is dispatched', () => {
      // Arrange — setelah optimistic: user-789 ada di downVotesBy
      const stateAfterOptimistic = {
        ...populatedState,
        threads: [
          fakeThread1,
          { ...fakeThread2, upVotesBy: [], downVotesBy: ['user-789'] },
        ],
      };

      // Act — rollback ke 'up' (previousVoteStatus sebelum klik down)
      const state = threadsReducer(
        stateAfterOptimistic,
        {
          type: downVoteThread.rejected.type,
          payload: { threadId: 'thread-2', userId: 'user-789', previousVoteStatus: 'up' },
        },
      );

      // Assert — user-789 harus kembali ke upVotesBy
      const rolledBackThread = state.threads.find((t) => t.id === 'thread-2');
      expect(rolledBackThread.upVotesBy).toContain('user-789');
      expect(rolledBackThread.downVotesBy).not.toContain('user-789');
    });
  });
});
