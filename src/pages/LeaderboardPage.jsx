import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import Navbar from '../components/shared/Navbar';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import LeaderboardItem from '../components/leaderboard/LeaderboardItem';
import useAppSelector from '../hooks/useAppSelector';
import {
  fetchLeaderboard,
  selectLeaderboard,
  selectLeaderboardError,
  selectLeaderboardStatus,
} from '../store/slices/leaderboardSlice';

const LeaderboardPage = () => {
  const dispatch = useDispatch();
  const leaderboard = useAppSelector(selectLeaderboard);
  const status = useAppSelector(selectLeaderboardStatus);
  const error = useAppSelector(selectLeaderboardError);

  const isLoading = status === 'loading';
  const isFailed = status === 'failed';

  useEffect(() => {
    dispatch(fetchLeaderboard());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="mx-auto max-w-2xl px-4 py-8">

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            🏆 Papan Peringkat
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Pengguna paling aktif di forum
          </p>
        </div>

        {/* Loading */}
        {isLoading && <LoadingSpinner fullPage />}

        {/* Error */}
        {isFailed && !isLoading && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
            <p className="font-medium text-red-600">Gagal memuat leaderboard</p>
            <p className="mt-1 text-sm text-red-400">{error}</p>
            <button
              type="button"
              onClick={() => dispatch(fetchLeaderboard())}
              className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* List */}
        {!isLoading && !isFailed && (
          <div className="flex flex-col gap-3">
            {leaderboard.map((entry, index) => (
              <LeaderboardItem
                key={entry.user.id}
                entry={entry}
                rank={index + 1}
              />
            ))}

            {leaderboard.length === 0 && (
              <p className="py-12 text-center text-sm text-gray-400">
                Belum ada data leaderboard.
              </p>
            )}
          </div>
        )}

      </main>
    </div>
  );
};

export default LeaderboardPage;
