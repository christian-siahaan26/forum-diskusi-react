import PropTypes from 'prop-types';
import Avatar from '../shared/Avatar';

/**
 * @param {{
 *   entry: { user: object, score: number },
 *   rank: number,
 * }} props
 */
const LeaderboardItem = ({ entry, rank }) => {
  const { user, score } = entry;

  const medalMap = { 1: '🥇', 2: '🥈', 3: '🥉' };
  const medal = medalMap[rank] ?? null;

  const isTopThree = rank <= 3;

  return (
    <div
      className={`
        flex items-center gap-4 rounded-xl border px-5 py-4
        transition-shadow hover:shadow-sm
        ${
          isTopThree
            ? 'border-yellow-200 bg-yellow-50'
            : 'border-gray-100 bg-white'
        }
      `}
    >
      {/* Rank */}
      <div className="flex w-8 shrink-0 items-center justify-center">
        {medal ? (
          <span className="text-2xl">{medal}</span>
        ) : (
          <span className="text-sm font-bold text-gray-400">{rank}</span>
        )}
      </div>

      {/* Avatar + Name */}
      <Avatar src={user.avatar} name={user.name} size="md" />
      <p className="flex-1 truncate text-sm font-medium text-gray-800">
        {user.name}
      </p>

      {/* Score */}
      <div className="text-right">
        <p className="text-base font-bold text-gray-900">{score}</p>
        <p className="text-xs text-gray-400">poin</p>
      </div>
    </div>
  );
};

LeaderboardItem.propTypes = {
  entry: PropTypes.shape({
    user: PropTypes.shape({
      name: PropTypes.string.isRequired,
      avatar: PropTypes.string,
    }).isRequired,
    score: PropTypes.number.isRequired,
  }).isRequired,
  rank: PropTypes.number.isRequired,
};

export default LeaderboardItem;
