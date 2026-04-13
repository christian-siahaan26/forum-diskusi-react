import { useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 px-4 text-center">
      <span className="text-7xl" aria-hidden="true">🧭</span>
      <h1 className="text-4xl font-bold text-gray-900">404</h1>
      <p className="text-base text-gray-600">
        Halaman yang kamu cari tidak ditemukan.
      </p>
      <div className="mt-2 flex gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="
            rounded-xl border border-gray-200 px-5 py-2.5
            text-sm font-medium text-gray-600
            transition-colors hover:bg-gray-100
          "
        >
          Kembali
        </button>
        <button
          type="button"
          onClick={() => navigate('/', { replace: true })}
          className="
            rounded-xl bg-blue-600 px-5 py-2.5
            text-sm font-medium text-white
            transition-colors hover:bg-blue-700
          "
        >
          Ke Beranda
        </button>
      </div>
    </div>
  );
};

export default NotFoundPage;
