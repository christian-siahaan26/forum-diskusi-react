import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/shared/Navbar';
import ThreadForm from '../components/threads/ThreadForm';
import useAppSelector from '../hooks/useAppSelector';
import {
  clearThreadsError,
  createThread,
  selectThreadsError,
  selectThreadsStatus,
} from '../store/slices/threadsSlice';

const CreateThreadPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const status = useAppSelector(selectThreadsStatus);
  const error = useAppSelector(selectThreadsError);

  const isLoading = status === 'loading';

  useEffect(() => () => dispatch(clearThreadsError()), [dispatch]);

  // Submit handler
  const handleSubmit = async (threadData) => {
    const resultAction = await dispatch(createThread(threadData));

    if (createThread.fulfilled.match(resultAction)) {
      const newThread = resultAction.payload;
      navigate(`/threads/${newThread.id}`, { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="mx-auto max-w-2xl px-4 py-8">

        {/* Back Button */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="
            mb-6 flex items-center gap-1.5 text-sm
            text-gray-500 transition-colors hover:text-gray-800
          "
        >
          <span aria-hidden="true">←</span>
          Kembali
        </button>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Buat Thread Baru
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Mulai diskusi baru dan ajak komunitas ikut berpartisipasi
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <ThreadForm
            onSubmit={handleSubmit}
            isLoading={isLoading}
            apiError={error}
            onCancel={() => navigate(-1)}
          />
        </div>

        {/* Tips Card */}
        <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-5">
          <h2 className="mb-3 text-sm font-semibold text-blue-800">
            Tips menulis thread yang baik
          </h2>
          <ul className="flex flex-col gap-1.5 text-xs text-blue-700">
            <li className="flex items-start gap-2">
              <span aria-hidden="true" className="mt-0.5 shrink-0">✓</span>
              Tulis judul yang spesifik dan mudah dipahami
            </li>
            <li className="flex items-start gap-2">
              <span aria-hidden="true" className="mt-0.5 shrink-0">✓</span>
              Pilih kategori yang tepat agar mudah ditemukan
            </li>
            <li className="flex items-start gap-2">
              <span aria-hidden="true" className="mt-0.5 shrink-0">✓</span>
              Jelaskan konteks dan pertanyaan secara lengkap di isi thread
            </li>
            <li className="flex items-start gap-2">
              <span aria-hidden="true" className="mt-0.5 shrink-0">✓</span>
              Gunakan bahasa yang sopan dan mudah dipahami semua orang
            </li>
          </ul>
        </div>

      </main>
    </div>
  );
};

export default CreateThreadPage;
