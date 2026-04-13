// src/tests/components/ThreadCard.test.jsx
import {
  describe, it, expect, vi, beforeEach,
} from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import ThreadCard from '../../components/threads/ThreadCard';

// ─────────────────────────────────────────────────────────────────────────────
// MOCK
//
// useNavigate perlu di-mock karena ThreadCard memanggilnya saat judul diklik,
// dan MemoryRouter saja tidak cukup — kita perlu menangkap navigate call.
// ─────────────────────────────────────────────────────────────────────────────

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual, // pertahankan semua export asli (termasuk MemoryRouter)
    useNavigate: () => mockNavigate,
  };
});

// ─────────────────────────────────────────────────────────────────────────────
// FIXTURES
// ─────────────────────────────────────────────────────────────────────────────

const fakeOwner = {
  id: 'user-123',
  name: 'John Doe',
  email: 'john@example.com',
  avatar: '', // kosong → Avatar fallback ke inisial
};

const fakeThread = {
  id: 'thread-abc',
  title: 'Cara Belajar Redux Toolkit dengan Benar',
  body: 'Redux Toolkit adalah cara terbaik untuk manage state di React.',
  category: 'redux',
  ownerId: 'user-123',
  createdAt: '2024-06-01T08:00:00.000Z',
  upVotesBy: ['user-456', 'user-789'],
  downVotesBy: ['user-999'],
  totalComments: 5,
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: render ThreadCard dengan MemoryRouter
// ─────────────────────────────────────────────────────────────────────────────

const renderThreadCard = (overrideProps = {}) => {
  const defaultProps = {
    thread: fakeThread,
    owner: fakeOwner,
    authUserId: null, // default: belum login (guest)
    onUpVote: vi.fn(),
    onDownVote: vi.fn(),
  };

  const props = { ...defaultProps, ...overrideProps };
  const user = userEvent.setup();

  render(
    // MemoryRouter wajib karena ThreadCard pakai useNavigate
    <MemoryRouter>
      <ThreadCard {...props} />
    </MemoryRouter>,
  );

  return { user, ...props };
};

// ─────────────────────────────────────────────────────────────────────────────
// TEST SUITE
// ─────────────────────────────────────────────────────────────────────────────

describe('ThreadCard component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Render Props ─────────────────────────────────────────────────────────────

  describe('props rendering', () => {
    it('should render thread title correctly', () => {
      // Act
      renderThreadCard();

      // Assert
      expect(
        screen.getByText('Cara Belajar Redux Toolkit dengan Benar'),
      ).toBeInTheDocument();
    });

    it('should render thread category as badge', () => {
      // Act
      renderThreadCard();

      // Assert — kategori ditampilkan dengan prefix #
      expect(screen.getByText('#redux')).toBeInTheDocument();
    });

    it('should render owner name correctly', () => {
      // Act
      renderThreadCard();

      // Assert
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('should render correct upvote count from upVotesBy array length', () => {
      // Act
      renderThreadCard();

      // fakeThread.upVotesBy = ['user-456', 'user-789'] → count = 2
      // VoteButton up menampilkan angka count-nya
      const article = screen.getByRole('article');
      const upButtons = within(article).getAllByRole('button', { name: /up vote/i });

      // Ambil button up-vote (aria-label="Up vote, jumlah: 2")
      const upVoteButton = upButtons[0];
      expect(upVoteButton).toHaveTextContent('2');
    });

    it('should render correct downvote count', () => {
      // Act
      renderThreadCard();

      // fakeThread.downVotesBy = ['user-999'] → count = 1
      const article = screen.getByRole('article');
      const downButton = within(article).getByRole('button', { name: /down vote/i });
      expect(downButton).toHaveTextContent('1');
    });

    it('should render total comments count', () => {
      // Act
      renderThreadCard();

      // Assert — "5 komentar"
      expect(screen.getByText(/5 komentar/i)).toBeInTheDocument();
    });

    it('should render body preview text', () => {
      // Act
      renderThreadCard();

      // Assert — body thread ditampilkan (via dangerouslySetInnerHTML)
      expect(
        screen.getByText(/Redux Toolkit adalah cara terbaik/i),
      ).toBeInTheDocument();
    });
  });

  // ── Guest State (belum login) ────────────────────────────────────────────────

  describe('guest state — authUserId is null', () => {
    it('should disable vote buttons when user is not authenticated', () => {
      // Act — render tanpa authUserId (default null = guest)
      renderThreadCard({ authUserId: null });

      // Assert — semua vote button harus disabled
      const voteButtons = screen.getAllByRole('button', { name: /vote/i });
      voteButtons.forEach((button) => {
        expect(button).toBeDisabled();
      });
    });

    it('should show login prompt when user is not authenticated', () => {
      // Act
      renderThreadCard({ authUserId: null });

      // Assert — ada teks yang mengajak login
      expect(screen.getByRole('button', { name: /masuk/i })).toBeInTheDocument();
    });

    it('should navigate to login when guest clicks the login prompt', async () => {
      // Arrange
      const { user } = renderThreadCard({ authUserId: null });

      // Act
      await user.click(screen.getByRole('button', { name: /masuk/i }));

      // Assert
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  // ── Authenticated State (sudah login) ───────────────────────────────────────

  describe('authenticated state — authUserId is provided', () => {
    it('should enable vote buttons when user is authenticated', () => {
      // Act
      renderThreadCard({ authUserId: 'user-456' });

      // Assert — vote button tidak disabled
      const voteButtons = screen.getAllByRole('button', { name: /vote/i });
      voteButtons.forEach((button) => {
        expect(button).not.toBeDisabled();
      });
    });

    it('should call onUpVote with correct threadId when up vote button is clicked', async () => {
      // Arrange
      const { user, onUpVote } = renderThreadCard({ authUserId: 'user-new' });

      // Act — klik tombol up vote
      const upVoteButton = screen.getByRole('button', { name: /up vote/i });
      await user.click(upVoteButton);

      // Assert — handler dipanggil dengan threadId yang benar
      expect(onUpVote).toHaveBeenCalledOnce();
      expect(onUpVote).toHaveBeenCalledWith('thread-abc');
    });

    it('should call onDownVote with correct threadId when down vote button is clicked', async () => {
      // Arrange
      const { user, onDownVote } = renderThreadCard({ authUserId: 'user-new' });

      // Act
      const downVoteButton = screen.getByRole('button', { name: /down vote/i });
      await user.click(downVoteButton);

      // Assert
      expect(onDownVote).toHaveBeenCalledOnce();
      expect(onDownVote).toHaveBeenCalledWith('thread-abc');
    });

    it('should mark up vote button as active (aria-pressed=true) when user has upvoted', () => {
      // Arrange — user-456 sudah ada di upVotesBy
      renderThreadCard({ authUserId: 'user-456' });

      // Assert — aria-pressed harus true pada tombol up vote
      const upVoteButton = screen.getByRole('button', { name: /up vote/i });
      expect(upVoteButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('should mark down vote button as active when user has downvoted', () => {
      // Arrange — user-999 sudah ada di downVotesBy
      renderThreadCard({ authUserId: 'user-999' });

      // Assert
      const downVoteButton = screen.getByRole('button', { name: /down vote/i });
      expect(downVoteButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('should not mark any vote button as active for user who has not voted', () => {
      // Arrange — user-brand-new belum pernah vote
      renderThreadCard({ authUserId: 'user-brand-new' });

      // Assert — keduanya aria-pressed=false
      const upVoteButton = screen.getByRole('button', { name: /up vote/i });
      const downVoteButton = screen.getByRole('button', { name: /down vote/i });
      expect(upVoteButton).toHaveAttribute('aria-pressed', 'false');
      expect(downVoteButton).toHaveAttribute('aria-pressed', 'false');
    });
  });

  // ── Navigasi ke Detail Thread ────────────────────────────────────────────────

  describe('navigation', () => {
    it('should navigate to thread detail page when title is clicked', async () => {
      // Arrange
      const { user } = renderThreadCard();

      // Act — klik judul thread
      const title = screen.getByText('Cara Belajar Redux Toolkit dengan Benar');
      await user.click(title);

      // Assert — navigate ke route yang benar
      expect(mockNavigate).toHaveBeenCalledWith('/threads/thread-abc');
    });
  });

  // ── Edge Cases ───────────────────────────────────────────────────────────────

  describe('edge cases', () => {
    it('should show fallback owner name when owner prop is null', () => {
      // Act
      renderThreadCard({ owner: null });

      // Assert — fallback text harus muncul
      expect(screen.getByText(/pengguna tidak diketahui/i)).toBeInTheDocument();
    });

    it('should truncate body preview when body text exceeds 200 characters', () => {
      // Arrange — buat body yang sangat panjang
      const longBody = 'A'.repeat(250);
      const threadWithLongBody = { ...fakeThread, body: longBody };

      // Act
      renderThreadCard({ thread: threadWithLongBody });

      // Assert — teks yang ditampilkan tidak boleh lebih dari 203 karakter
      // (200 + "..." = 203)
      const bodyElement = screen.getByRole('article').querySelector('[dangerouslySetInnerHTML]')
        ?? screen.getByRole('article');

      // Verifikasi kehadiran "..." sebagai indikator truncation
      expect(bodyElement.textContent).toContain('...');
    });
  });
});
