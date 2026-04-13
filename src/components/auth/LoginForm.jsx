import { useState } from 'react';
import PropTypes from 'prop-types';
import LoadingSpinner from '../shared/LoadingSpinner';
import InputField from '../shared/InputField';

/**
 *
 * @param {{
 *   onSubmit: (data: { email, password }) => void,
 *   isLoading: boolean,
 *   apiError: string | null,
 *   onNavigateRegister: () => void,
 * }} props
 */
const LoginForm = ({
  onSubmit, isLoading, apiError, onNavigateRegister,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = 'Email tidak boleh kosong.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Format email tidak valid.';
    }

    if (!password) {
      newErrors.password = 'Password tidak boleh kosong.';
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
    onSubmit({ email: email.trim(), password });
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
        id="login-email"
        label="Email"
        type="email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
        }}
        placeholder="john@example.com"
        error={errors.email}
        disabled={isLoading}
        autoComplete="email"
      />

      <InputField
        id="login-password"
        label="Password"
        type="password"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
          if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
        }}
        placeholder="Password kamu"
        error={errors.password}
        disabled={isLoading}
        autoComplete="current-password"
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
        {isLoading ? 'Memproses...' : 'Masuk'}
      </button>

      <p className="text-center text-sm text-gray-500">
        Belum punya akun?
        {' '}
        <button
          type="button"
          onClick={onNavigateRegister}
          className="font-medium text-blue-600 hover:underline"
        >
          Daftar sekarang
        </button>
      </p>
    </form>
  );
};

LoginForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  apiError: PropTypes.string,
  onNavigateRegister: PropTypes.func.isRequired,
};

export default LoginForm;
