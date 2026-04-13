import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import Navbar from '../components/shared/Navbar';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import CategoryFilter from '../components/threads/CategoryFilter';
import ThreadList from '../components/threads/ThreadList';
import useAppSelector from '../hooks/useAppSelector';
import useAuth from '../hooks/useAuth';
import {
  downVoteThread,
  fetchThreads,
  selectActiveCategory,
  selectAllCategories,
  selectFilteredThreads,
  selectThreadsError,
  selectThreadsStatus,
  setActiveCategory,
  upVoteThread,
} from '../store/slices/threadsSlice';
import { fetchAllUsers, selectAllUsers } from '../store/slices/usersSlice';

const HomePage = () => {
  const dispatch = useDispatch();

  // Selectors
  const threads = useAppSelector(selectFilteredThreads);
  const allCategories = useAppSelector(selectAllCategories);
  const activeCategory = useAppSelector(selectActiveCategory);
  const status = useAppSelector(selectThreadsStatus);
  const error = useAppSelector(selectThreadsError);
  const users = useAppSelector(selectAllUsers);
  const { authUser } = useAuth();

  // Fetch data saat mount
  useEffect(() => {
    dispatch(fetchThreads());
    dispatch(fetchAllUsers());
  }, [dispatch]);

  // Vote handlers
  const handleUpVote = (threadId) => {
    if (!authUser) return;
    dispatch(upVoteThread({ threadId, userId: authUser.id }));
  };

  const handleDownVote = (threadId) => {
    if (!authUser) return;
    dispatch(downVoteThread({ threadId, userId: authUser.id }));
  };

  // Category handler
  const handleSelectCategory = (category) => {
    dispatch(setActiveCategory(category));
  };

  // Render states
  const isLoading = status === 'loading';
  const isFailed = status === 'failed';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="mx-auto max-w-3xl px-4 py-8">

        {/*  Page Header  */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Forum Diskusi
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Temukan dan ikuti diskusi yang menarik
          </p>
        </div>

        {/* Category Filter ─ */}
        {!isLoading && !isFailed && (
          <div className="mb-6">
            <CategoryFilter
              categories={allCategories}
              activeCategory={activeCategory}
              onSelect={handleSelectCategory}
            />
          </div>
        )}

        {/* Loading State ─ */}
        {isLoading && (
          <div className="flex flex-col items-center gap-4 py-20">
            <LoadingSpinner size="lg" />
            <p className="text-sm text-gray-400">Memuat thread...</p>
          </div>
        )}

        {/* Error State */}
        {isFailed && !isLoading && (
          <div className="flex flex-col items-center gap-4 rounded-xl border border-red-200 bg-red-50 p-8 text-center">
            <span className="text-4xl" aria-hidden="true">⚠️</span>
            <p className="font-medium text-red-700">Gagal memuat thread</p>
            <p className="text-sm text-red-500">{error}</p>
            <button
              type="button"
              onClick={() => dispatch(fetchThreads())}
              className="
                rounded-lg bg-red-600 px-4 py-2
                text-sm font-medium text-white
                hover:bg-red-700 transition-colors
              "
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* Thread List */}
        {!isLoading && !isFailed && (
          <ThreadList
            threads={threads}
            users={users}
            authUserId={authUser?.id ?? null}
            activeCategory={activeCategory}
            onUpVote={handleUpVote}
            onDownVote={handleDownVote}
          />
        )}

      </main>
    </div>
  );
};

export default HomePage;
