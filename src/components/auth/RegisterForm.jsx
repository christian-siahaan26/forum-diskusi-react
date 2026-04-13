import { useState } from 'react';
import PropTypes from 'prop-types';
import LoadingSpinner from '../shared/LoadingSpinner';
import InputField from '../shared/InputField';

/**
 * @param {{
 *   onSubmit: (data: { name, email, password }) => void,
 *   isLoading: boolean,
 *   apiError: string | null,
 *   onNavigateLogin: () => void,
 * }} props
 */
const RegisterForm = ({
  onSubmit, isLoading, apiError, onNavigateLogin,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = 'Nama tidak boleh kosong.';
    } else if (name.trim().length < 3) {
      newErrors.name = 'Nama minimal 3 karakter.';
    }

    if (!email.trim()) {
      newErrors.email = 'Email tidak boleh kosong.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Format email tidak valid.';
    }

    if (!password) {
      newErrors.password = 'Password tidak boleh kosong.';
    } else if (password.length < 6) {
      newErrors.password = 'Password minimal 6 karakter.';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Konfirmasi password wajib diisi.';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Password tidak cocok.';
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    onSubmit({ name: name.trim(), email: email.trim(), password });
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col gap-4"
    >
      {/* API Error Banner */}
      {apiError && (
        <div
          className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600"
          role="alert"
        >
          {apiError}
        </div>
      )}

      <InputField
        id="register-name"
        label="Nama Lengkap"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="John Doe"
        error={errors.name}
        disabled={isLoading}
        autoComplete="name"
      />

      <InputField
        id="register-email"
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="john@example.com"
        error={errors.email}
        disabled={isLoading}
        autoComplete="email"
      />

      <InputField
        id="register-password"
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Minimal 6 karakter"
        error={errors.password}
        disabled={isLoading}
        autoComplete="new-password"
      />

      <InputField
        id="register-confirm-password"
        label="Konfirmasi Password"
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder="Ulangi password"
        error={errors.confirmPassword}
        disabled={isLoading}
        autoComplete="new-password"
      />

      <button
        type="submit"
        disabled={isLoading}
        className="
          mt-2 flex items-center justify-center gap-2
          rounded-lg bg-blue-600 px-4 py-2.5
          text-sm font-medium text-white
          transition-colors hover:bg-blue-700
          disabled:cursor-not-allowed disabled:opacity-60
        "
      >
        {isLoading && <LoadingSpinner size="sm" />}
        {isLoading ? 'Mendaftarkan...' : 'Daftar'}
      </button>

      <p className="text-center text-sm text-gray-500">
        Sudah punya akun?
        {' '}
        <button
          type="button"
          onClick={onNavigateLogin}
          className="font-medium text-blue-600 hover:underline"
        >
          Masuk di sini
        </button>
      </p>
    </form>
  );
};

RegisterForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  apiError: PropTypes.string,
  onNavigateLogin: PropTypes.func.isRequired,
};

export default RegisterForm;
