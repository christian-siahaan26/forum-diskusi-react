import PropTypes from 'prop-types';

/**
 * @param {{
 *   type: 'up' | 'down',
 *   count: number,
 *   isActive: boolean,
 *   isDisabled: boolean,
 *   onClick: () => void,
 * }} props
 */
const VoteButton = ({
  type, count, isActive, isDisabled, onClick,
}) => {
  const isUp = type === 'up';

  const icon = isUp ? '▲' : '▼';

  const activeClass = isUp
    ? 'text-blue-600 bg-blue-50 border-blue-300'
    : 'text-red-500 bg-red-50 border-red-300';

  const inactiveClass = 'text-gray-400 bg-white border-gray-200 hover:border-gray-300 hover:text-gray-600';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      aria-label={`${isUp ? 'Up' : 'Down'} vote, jumlah: ${count}`}
      aria-pressed={isActive}
      className={`
        flex items-center gap-1.5 rounded-full border
        px-3 py-1 text-xs font-medium
        transition-all duration-150
        disabled:cursor-not-allowed disabled:opacity-50
        ${isActive ? activeClass : inactiveClass}
      `}
    >
      <span aria-hidden="true">{icon}</span>
      <span>{count}</span>
    </button>
  );
};

VoteButton.propTypes = {
  type: PropTypes.string.isRequired,
  count: PropTypes.number.isRequired,
  isActive: PropTypes.bool.isRequired,
  isDisabled: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default VoteButton;
