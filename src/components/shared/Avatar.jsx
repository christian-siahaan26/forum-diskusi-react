import PropTypes from 'prop-types';

/**
 * @param {{
 *   src?: string,
 *   name: string,
 *   size?: 'sm' | 'md' | 'lg',
 * }} props
 */
const Avatar = ({ src, name, size = 'md' }) => {
  const sizeMap = {
    sm: 'h-7 w-7 text-xs',
    md: 'h-9 w-9 text-sm',
    lg: 'h-12 w-12 text-base',
  };

  const initials = name
    ?.split(' ')
    .map((word) => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() ?? '?';

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${sizeMap[size]} rounded-full object-cover ring-1 ring-gray-200`}
      />
    );
  }

  return (
    <div
      className={`
        ${sizeMap[size]} flex items-center justify-center
        rounded-full bg-blue-100 font-semibold text-blue-700
        ring-1 ring-blue-200
      `}
      aria-label={name}
    >
      {initials}
    </div>
  );
};

Avatar.propTypes = {
  src: PropTypes.string,
  name: PropTypes.string.isRequired,
  size: PropTypes.string,
};

export default Avatar;
