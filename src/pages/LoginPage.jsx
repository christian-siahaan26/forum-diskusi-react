import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { loginUser } from '../store/slices/authSlice';
import LoginForm from '../components/auth/LoginForm';
import useAuth from '../hooks/useAuth';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    isAuthenticated,
    isLoading,
    error,
    handleLogin,
    handleClearError,
  } = useAuth();

  const successMessage = location.state?.successMessage ?? null;

  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname ?? '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  useEffect(() => () => handleClearError(), [handleClearError]);

  const handleSubmit = async (credentials) => {
    const resultAction = await handleLogin(credentials);
    if (loginUser.rejected.match(resultAction)) {
      // Error masuk ke state Redux
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">

        {/* Card */}
        <div className="rounded-2xl bg-white px-8 py-10 shadow-sm ring-1 ring-gray-200">

          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-semibold text-gray-900">
              Selamat Datang
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Masuk untuk melanjutkan ke Forum
            </p>
          </div>

          {/* Pesan sukses */}
          {successMessage && (
            <div className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
              {successMessage}
            </div>
          )}

          {/* Form — presentational */}
          <LoginForm
            onSubmit={handleSubmit}
            isLoading={isLoading}
            apiError={error}
            onNavigateRegister={() => navigate('/register')}
          />

        </div>
      </div>
    </div>
  );
};

export default LoginPage;
