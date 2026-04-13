import PropTypes from 'prop-types';

/**
 * @param {{ size?: 'sm' | 'md' | 'lg', fullPage?: boolean }} props
 */
const LoadingSpinner = ({ size = 'md', fullPage = false }) => {
  const sizeMap = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-4',
  };

  const spinner = (
    <div
      className={`
        ${sizeMap[size]}
        animate-spin rounded-full
        border-gray-300 border-t-blue-600
      `}
      role="status"
      aria-label="Memuat..."
    />
  );

  if (fullPage) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        {spinner}
      </div>
    );
  }

  return spinner;
};

LoadingSpinner.propTypes = {
  size: PropTypes.string,
  fullPage: PropTypes.bool,
};

export default LoadingSpinner;
