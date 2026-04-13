import { useState } from 'react';
import PropTypes from 'prop-types';
import LoadingSpinner from '../shared/LoadingSpinner';

/**
 * @param {{
 *   onSubmit: (content: string) => void,
 *   isLoading: boolean,
 *   error: string | null,
 *   isDisabled: boolean,
 * }} props
 */
const CommentForm = ({
  onSubmit, isLoading, error, isDisabled,
}) => {
  const [content, setContent] = useState('');
  const [localError, setLocalError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) {
      setLocalError('Komentar tidak boleh kosong.');
      return;
    }
    if (content.trim().length < 5) {
      setLocalError('Komentar minimal 5 karakter.');
      return;
    }
    setLocalError('');
    onSubmit(content.trim());
    setContent('');
  };

  const displayError = localError || error;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <textarea
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          if (localError) setLocalError('');
        }}
        disabled={isDisabled || isLoading}
        placeholder={
          isDisabled
            ? 'Masuk untuk menulis komentar...'
            : 'Tulis komentar kamu...'
        }
        rows={3}
        className={`
          w-full resize-none rounded-xl border px-4 py-3
          text-sm outline-none transition-colors
          placeholder:text-gray-400
          focus:border-blue-400 focus:ring-2 focus:ring-blue-100
          disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400
          ${displayError ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'}
        `}
      />

      {displayError && (
        <p className="text-xs text-red-500" role="alert">
          {displayError}
        </p>
      )}

      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">
          {content.length > 0 && `${content.length} karakter`}
        </span>
        <button
          type="submit"
          disabled={isDisabled || isLoading}
          className="
            flex items-center gap-2 rounded-lg bg-blue-600
            px-4 py-2 text-sm font-medium text-white
            transition-colors hover:bg-blue-700
            disabled:cursor-not-allowed disabled:opacity-50
          "
        >
          {isLoading && <LoadingSpinner size="sm" />}
          {isLoading ? 'Mengirim...' : 'Kirim Komentar'}
        </button>
      </div>
    </form>
  );
};

CommentForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  error: PropTypes.string,
  isDisabled: PropTypes.bool.isRequired,
};

export default CommentForm;
