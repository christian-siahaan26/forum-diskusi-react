import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RegisterForm from '../components/auth/RegisterForm';
import useAuth from '../hooks/useAuth';
import { registerUser } from '../store/slices/authSlice';

const RegisterPage = () => {
  const navigate = useNavigate();
  const {
    isAuthenticated,
    isLoading,
    error,
    handleRegister,
    handleClearError,
  } = useAuth();

  useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true });
  }, [isAuthenticated, navigate]);

  useEffect(() => () => handleClearError(), [handleClearError]);

  const handleSubmit = async (credentials) => {
    const resultAction = await handleRegister(credentials);

    if (registerUser.fulfilled.match(resultAction)) {
      navigate('/login', {
        state: { successMessage: 'Akun berhasil dibuat! Silakan masuk.' },
      });
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
              Buat Akun Baru
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Bergabung dan mulai berdiskusi
            </p>
          </div>

          {/* Form — presentational */}
          <RegisterForm
            onSubmit={handleSubmit}
            isLoading={isLoading}
            apiError={error}
            onNavigateLogin={() => navigate('/login')}
          />

        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
