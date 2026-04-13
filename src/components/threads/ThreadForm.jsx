import { useState } from 'react';
import PropTypes from 'prop-types';
import LoadingSpinner from '../shared/LoadingSpinner';

/**
 * @param {{
 *   onSubmit: (data: { title, category, body }) => void,
 *   isLoading: boolean,
 *   apiError: string | null,
 *   onCancel: () => void,
 * }} props
 */
const ThreadForm = ({
  onSubmit, isLoading, apiError, onCancel,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [body, setBody] = useState('');
  const [errors, setErrors] = useState({});

  // Validation
  const validate = () => {
    const newErrors = {};

    if (!title.trim()) {
      newErrors.title = 'Judul tidak boleh kosong.';
    } else if (title.trim().length < 5) {
      newErrors.title = 'Judul minimal 5 karakter.';
    } else if (title.trim().length > 100) {
      newErrors.title = 'Judul maksimal 100 karakter.';
    }

    if (!category.trim()) {
      newErrors.category = 'Kategori tidak boleh kosong.';
    } else if (/\s/.test(category.trim())) {
      newErrors.category = 'Kategori tidak boleh mengandung spasi.';
    }

    if (!body.trim()) {
      newErrors.body = 'Isi thread tidak boleh kosong.';
    } else if (body.trim().length < 10) {
      newErrors.body = 'Isi thread minimal 10 karakter.';
    }

    return newErrors;
  };

  // Submit
  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    onSubmit({
      title: title.trim(),
      category: category.trim().toLowerCase(),
      body: body.trim(),
    });
  };

  // Character counters
  const titleRemaining = 100 - title.length;

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">

      {/* API Error Banner */}
      {apiError && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
        >
          {apiError}
        </div>
      )}

      {/* Judul */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor="thread-title"
            className="text-sm font-medium text-gray-700"
          >
            Judul Thread
          </label>
          <span
            className={`text-xs ${
              titleRemaining < 20 ? 'text-orange-500' : 'text-gray-400'
            }`}
          >
            {titleRemaining}
            {' '}
            karakter tersisa
          </span>
        </div>
        <input
          id="thread-title"
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (errors.title) setErrors((prev) => ({ ...prev, title: '' }));
          }}
          disabled={isLoading}
          placeholder="Tulis judul yang jelas dan menarik..."
          maxLength={100}
          className={`
            rounded-xl border px-4 py-3 text-sm outline-none
            transition-colors placeholder:text-gray-400
            focus:border-blue-400 focus:ring-2 focus:ring-blue-100
            disabled:cursor-not-allowed disabled:bg-gray-50
            ${errors.title ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'}
          `}
        />
        {errors.title && (
          <p role="alert" className="text-xs text-red-500">
            {errors.title}
          </p>
        )}
      </div>

      {/* Kategori */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="thread-category"
          className="text-sm font-medium text-gray-700"
        >
          Kategori
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">
            #
          </span>
          <input
            id="thread-category"
            type="text"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value.toLowerCase().replace(/\s/g, ''));
              if (errors.category) setErrors((prev) => ({ ...prev, category: '' }));
            }}
            disabled={isLoading}
            placeholder="misal: react, javascript, diskusi-umum"
            className={`
              w-full rounded-xl border py-3 pl-8 pr-4 text-sm outline-none
              transition-colors placeholder:text-gray-400
              focus:border-blue-400 focus:ring-2 focus:ring-blue-100
              disabled:cursor-not-allowed disabled:bg-gray-50
              ${errors.category ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'}
            `}
          />
        </div>
        {errors.category && (
          <p role="alert" className="text-xs text-red-500">
            {errors.category}
          </p>
        )}
        <p className="text-xs text-gray-400">
          Gunakan huruf kecil tanpa spasi. Pisahkan kata dengan tanda strip (-).
        </p>
      </div>

      {/* Isi Thread */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor="thread-body"
            className="text-sm font-medium text-gray-700"
          >
            Isi Thread
          </label>
          <span className="text-xs text-gray-400">
            {body.length}
            {' '}
            karakter
          </span>
        </div>
        <textarea
          id="thread-body"
          value={body}
          onChange={(e) => {
            setBody(e.target.value);
            if (errors.body) setErrors((prev) => ({ ...prev, body: '' }));
          }}
          disabled={isLoading}
          placeholder="Jelaskan topik diskusi kamu secara detail..."
          rows={8}
          className={`
            w-full resize-y rounded-xl border px-4 py-3 text-sm
            outline-none transition-colors placeholder:text-gray-400
            focus:border-blue-400 focus:ring-2 focus:ring-blue-100
            disabled:cursor-not-allowed disabled:bg-gray-50
            ${errors.body ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'}
          `}
        />
        {errors.body && (
          <p role="alert" className="text-xs text-red-500">
            {errors.body}
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="
            rounded-xl border border-gray-200 px-5 py-2.5
            text-sm font-medium text-gray-600
            transition-colors hover:bg-gray-50
            disabled:cursor-not-allowed disabled:opacity-50
          "
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="
            flex items-center gap-2 rounded-xl bg-blue-600
            px-5 py-2.5 text-sm font-medium text-white
            transition-colors hover:bg-blue-700
            disabled:cursor-not-allowed disabled:opacity-60
          "
        >
          {isLoading && <LoadingSpinner size="sm" />}
          {isLoading ? 'Menerbitkan...' : 'Terbitkan Thread'}
        </button>
      </div>
    </form>
  );
};

ThreadForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  apiError: PropTypes.string,
  onCancel: PropTypes.func.isRequired,
};

export default ThreadForm;
