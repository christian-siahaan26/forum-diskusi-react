// src/tests/components/LoginForm.test.jsx
import {
  describe, it, expect, vi,
} from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginForm from '../../components/auth/LoginForm';

// ─────────────────────────────────────────────────────────────────────────────
// SETUP
//
// userEvent.setup() membuat instance user yang mensimulasikan
// interaksi lebih realistis dibanding fireEvent — termasuk focus,
// keyboard events, dan pointer events secara berurutan seperti user nyata.
// ─────────────────────────────────────────────────────────────────────────────

const renderLoginForm = (overrideProps = {}) => {
  // Default props yang valid — bisa di-override per test
  const defaultProps = {
    onSubmit: vi.fn(),
    isLoading: false,
    apiError: null,
    onNavigateRegister: vi.fn(),
  };

  const props = { ...defaultProps, ...overrideProps };
  const user = userEvent.setup();

  render(<LoginForm {...props} />);

  // Kembalikan user instance dan props agar bisa diakses di test
  return { user, ...props };
};

// ─────────────────────────────────────────────────────────────────────────────
// TEST SUITE
// ─────────────────────────────────────────────────────────────────────────────

describe('LoginForm component', () => {
  // ── Render awal ─────────────────────────────────────────────────────────────

  describe('initial render', () => {
    it('should render email input, password input, and submit button', () => {
      // Act
      renderLoginForm();

      // Assert — cari elemen berdasarkan role/label seperti yang user lihat
      // getByLabelText memastikan label dan input terhubung dengan benar (accessibility)
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /masuk/i })).toBeInTheDocument();
    });

    it('should render navigation link to register page', () => {
      // Act
      renderLoginForm();

      // Assert
      expect(screen.getByRole('button', { name: /daftar sekarang/i })).toBeInTheDocument();
    });

    it('should not show any validation error on initial render', () => {
      // Act
      renderLoginForm();

      // Assert — error message belum muncul sebelum user berinteraksi
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  // ── Validasi Form ───────────────────────────────────────────────────────────

  describe('form validation', () => {
    it('should show validation errors for both fields when form is submitted empty', async () => {
      // Arrange
      const { user, onSubmit } = renderLoginForm();

      // Act — klik submit tanpa mengisi apapun
      await user.click(screen.getByRole('button', { name: /masuk/i }));

      // Assert — kedua error harus muncul
      await waitFor(() => {
        expect(screen.getByText(/email tidak boleh kosong/i)).toBeInTheDocument();
        expect(screen.getByText(/password tidak boleh kosong/i)).toBeInTheDocument();
      });

      // Assert — onSubmit TIDAK boleh dipanggil jika validasi gagal
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('should show email format error when email is invalid', async () => {
      // Arrange
      const { user, onSubmit } = renderLoginForm();

      // Act — isi email dengan format yang salah
      await user.type(screen.getByLabelText(/email/i), 'bukan-email-valid');
      await user.type(screen.getByLabelText(/password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /masuk/i }));

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/format email tidak valid/i)).toBeInTheDocument();
      });

      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('should clear validation error when user starts typing in the field', async () => {
      // Arrange — trigger error dulu
      const { user } = renderLoginForm();
      await user.click(screen.getByRole('button', { name: /masuk/i }));

      await waitFor(() => {
        expect(screen.getByText(/email tidak boleh kosong/i)).toBeInTheDocument();
      });

      // Act — mulai mengetik di field email
      await user.type(screen.getByLabelText(/email/i), 'j');

      // Assert — error email harus hilang saat user mulai mengetik
      await waitFor(() => {
        expect(screen.queryByText(/email tidak boleh kosong/i)).not.toBeInTheDocument();
      });
    });
  });

  // ── Submit Sukses ───────────────────────────────────────────────────────────

  describe('successful form submission', () => {
    it('should call onSubmit with trimmed email and password when form is valid', async () => {
      // Arrange
      const { user, onSubmit } = renderLoginForm();

      const testEmail = '  john@example.com  '; // dengan spasi — harus di-trim
      const testPassword = 'secret123';

      // Act — isi form dengan data valid
      await user.type(screen.getByLabelText(/email/i), testEmail);
      await user.type(screen.getByLabelText(/password/i), testPassword);
      await user.click(screen.getByRole('button', { name: /masuk/i }));

      // Assert — onSubmit dipanggil dengan data yang benar
      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledOnce();
        expect(onSubmit).toHaveBeenCalledWith({
          email: testEmail.trim(), // email sudah di-trim
          password: testPassword,
        });
      });
    });

    it('should be able to submit after fixing validation errors', async () => {
      // Arrange
      const { user, onSubmit } = renderLoginForm();

      // Langkah 1: submit kosong → error muncul
      await user.click(screen.getByRole('button', { name: /masuk/i }));
      await waitFor(() => {
        expect(screen.getByText(/email tidak boleh kosong/i)).toBeInTheDocument();
      });

      // Langkah 2: isi form dengan benar
      await user.type(screen.getByLabelText(/email/i), 'john@example.com');
      await user.type(screen.getByLabelText(/password/i), 'secret123');

      // Langkah 3: submit ulang
      await user.click(screen.getByRole('button', { name: /masuk/i }));

      // Assert — submit berhasil
      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledOnce();
      });
    });
  });

  // ── Loading State ────────────────────────────────────────────────────────────

  describe('loading state', () => {
    it('should disable submit button and show loading text when isLoading is true', () => {
      // Act
      renderLoginForm({ isLoading: true });

      // Assert — button disabled saat loading
      const submitButton = screen.getByRole('button', { name: /memproses/i });
      expect(submitButton).toBeDisabled();
    });

    it('should disable email and password inputs while loading', () => {
      // Act
      renderLoginForm({ isLoading: true });

      // Assert — input tidak bisa diinteraksi saat loading
      expect(screen.getByLabelText(/email/i)).toBeDisabled();
      expect(screen.getByLabelText(/password/i)).toBeDisabled();
    });
  });

  // ── API Error Banner ─────────────────────────────────────────────────────────

  describe('API error display', () => {
    it('should display API error message as alert banner when apiError prop is provided', () => {
      // Arrange
      const apiErrorMessage = 'Email atau password salah.';

      // Act
      renderLoginForm({ apiError: apiErrorMessage });

      // Assert — banner error dari server harus muncul
      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveTextContent(apiErrorMessage);
    });

    it('should not render alert banner when apiError is null', () => {
      // Act
      renderLoginForm({ apiError: null });

      // Assert
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  // ── Navigasi ──────────────────────────────────────────────────────────────────

  describe('navigation', () => {
    it('should call onNavigateRegister when register link is clicked', async () => {
      // Arrange
      const { user, onNavigateRegister } = renderLoginForm();

      // Act
      await user.click(screen.getByRole('button', { name: /daftar sekarang/i }));

      // Assert
      expect(onNavigateRegister).toHaveBeenCalledOnce();
    });
  });
});
