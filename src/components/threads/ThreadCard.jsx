import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import Avatar from '../shared/Avatar';
import VoteButton from '../votes/VoteButton';
import formatDate from '../../utils/formatDate';

/**
 * @param {{
 *   thread: object,
 *   owner: object | null,
 *   authUserId: string | null,
 *   onUpVote: (threadId: string) => void,
 *   onDownVote: (threadId: string) => void,
 * }} props
 */
const ThreadCard = ({
  thread, owner, authUserId, onUpVote, onDownVote,
}) => {
  const navigate = useNavigate();

  const isUpVoted = authUserId ? thread.upVotesBy.includes(authUserId) : false;
  const isDownVoted = authUserId
    ? thread.downVotesBy.includes(authUserId)
    : false;
  const isGuest = !authUserId;

  const bodyPreview = thread.body.length > 200 ? `${thread.body.slice(0, 200)}...` : thread.body;

  return (
    <article
      className="
        flex flex-col gap-3 rounded-xl border border-gray-200
        bg-white p-5 transition-shadow duration-150 hover:shadow-md
      "
    >
      {/* Header: Avatar + Owner + Tanggal */}
      <div className="flex items-center gap-3">
        <Avatar src={owner?.avatar} name={owner?.name ?? 'Unknown'} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-gray-800">
            {owner?.name ?? 'Pengguna tidak diketahui'}
          </p>
          <p className="text-xs text-gray-400">
            {formatDate(thread.createdAt)}
          </p>
        </div>

        {/* Kategori badge */}
        <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-600">
          #
          {thread.category}
        </span>
      </div>

      {/* Body: Judul + Preview  */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => navigate(`/threads/${thread.id}`)}
        onKeyDown={(e) => e.key === 'Enter' && navigate(`/threads/${thread.id}`)}
        className="cursor-pointer"
        aria-label={`Buka thread: ${thread.title}`}
      >
        <h2 className="text-base font-semibold text-gray-900 hover:text-blue-600 transition-colors">
          {thread.title}
        </h2>

        <p
          className="mt-1 text-sm leading-relaxed text-gray-500"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: bodyPreview }}
        />
      </div>

      {/* Footer: Vote + Komentar  */}
      <div className="flex items-center gap-3 pt-1">
        <VoteButton
          type="up"
          count={thread.upVotesBy.length}
          isActive={isUpVoted}
          isDisabled={isGuest}
          onClick={() => onUpVote(thread.id)}
        />
        <VoteButton
          type="down"
          count={thread.downVotesBy.length}
          isActive={isDownVoted}
          isDisabled={isGuest}
          onClick={() => onDownVote(thread.id)}
        />

        {/* Jumlah komentar */}
        <span className="ml-auto flex items-center gap-1.5 text-xs text-gray-400">
          <span aria-hidden="true">💬</span>
          <span>
            {thread.totalComments ?? 0}
            {' '}
            komentar
          </span>
        </span>
      </div>

      {/* Tooltip untuk guest */}
      {isGuest && (
        <p className="text-center text-xs text-gray-400">
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="text-blue-500 hover:underline"
          >
            Masuk
          </button>
          {' '}
          untuk memberikan vote
        </p>
      )}
    </article>
  );
};

ThreadCard.propTypes = {
  thread: PropTypes.shape({
    id: PropTypes.string.isRequired,
    body: PropTypes.string.isRequired,
    createdAt: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    totalComments: PropTypes.number.isRequired,
    upVotesBy: PropTypes.arrayOf(PropTypes.string).isRequired,
    downVotesBy: PropTypes.arrayOf(PropTypes.string).isRequired,
  }).isRequired,
  owner: PropTypes.shape({
    name: PropTypes.string.isRequired,
    avatar: PropTypes.string,
  }).isRequired,
  authUserId: PropTypes.string,
  onUpVote: PropTypes.func.isRequired,
  onDownVote: PropTypes.func.isRequired,
};

export default ThreadCard;
