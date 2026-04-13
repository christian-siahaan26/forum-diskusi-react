import PropTypes from 'prop-types';
import Avatar from '../shared/Avatar';
import VoteButton from '../votes/VoteButton';
import formatDate from '../../utils/formatDate';

/**
 * @param {{
 *   comment: object,
 *   authUserId: string | null,
 *   threadId: string,
 *   onUpVote: (commentId: string) => void,
 *   onDownVote: (commentId: string) => void,
 * }} props
 */
const CommentItem = ({
  comment, authUserId, onUpVote, onDownVote,
}) => {
  const isUpVoted = authUserId ? comment.upVotesBy.includes(authUserId) : false;
  const isDownVoted = authUserId
    ? comment.downVotesBy.includes(authUserId)
    : false;
  const isGuest = !authUserId;

  return (
    <article className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-white p-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Avatar
          src={comment.owner?.avatar}
          name={comment.owner?.name ?? 'Unknown'}
          size="sm"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-gray-800">
            {comment.owner?.name ?? 'Pengguna tidak diketahui'}
          </p>
          <p className="text-xs text-gray-400">
            {formatDate(comment.createdAt)}
          </p>
        </div>
      </div>

      {/* Content */}
      <div
        className="text-sm leading-relaxed text-gray-700"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: comment.content }}
      />

      {/* Vote */}
      <div className="flex items-center gap-2 pt-1">
        <VoteButton
          type="up"
          count={comment.upVotesBy.length}
          isActive={isUpVoted}
          isDisabled={isGuest}
          onClick={() => onUpVote(comment.id)}
        />
        <VoteButton
          type="down"
          count={comment.downVotesBy.length}
          isActive={isDownVoted}
          isDisabled={isGuest}
          onClick={() => onDownVote(comment.id)}
        />
      </div>
    </article>
  );
};

CommentItem.propTypes = {
  comment: PropTypes.shape({
    id: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    createdAt: PropTypes.string.isRequired,
    owner: PropTypes.shape({
      name: PropTypes.string.isRequired,
      avatar: PropTypes.string,
    }).isRequired,
    upVotesBy: PropTypes.arrayOf(PropTypes.string).isRequired,
    downVotesBy: PropTypes.arrayOf(PropTypes.string).isRequired,
  }).isRequired,
  authUserId: PropTypes.string,
  onUpVote: PropTypes.func.isRequired,
  onDownVote: PropTypes.func.isRequired,
};

export default CommentItem;
