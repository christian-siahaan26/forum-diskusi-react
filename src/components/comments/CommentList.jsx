import PropTypes from 'prop-types';
import CommentItem from './CommentItem';

/**
 * @param {{
 *   comments: object[],
 *   authUserId: string | null,
 *   threadId: string,
 *   onUpVote: (commentId: string) => void,
 *   onDownVote: (commentId: string) => void,
 * }} props
 */
const CommentList = ({
  comments,
  authUserId,
  threadId,
  onUpVote,
  onDownVote,
}) => {
  if (comments.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-10 text-center">
        <span className="text-4xl" aria-hidden="true">💬</span>
        <p className="text-sm text-gray-500">
          Belum ada komentar. Jadilah yang pertama!
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          authUserId={authUserId}
          threadId={threadId}
          onUpVote={onUpVote}
          onDownVote={onDownVote}
        />
      ))}
    </div>
  );
};

CommentList.propTypes = {
  comments: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    createdAt: PropTypes.string.isRequired,
    owner: PropTypes.shape({
      name: PropTypes.string.isRequired,
      avatar: PropTypes.string,
    }).isRequired,
    upVotesBy: PropTypes.arrayOf(PropTypes.string).isRequired,
    downVotesBy: PropTypes.arrayOf(PropTypes.string).isRequired,
  })).isRequired,
  authUserId: PropTypes.string,
  threadId: PropTypes.string.isRequired,
  onUpVote: PropTypes.func.isRequired,
  onDownVote: PropTypes.func.isRequired,
};

export default CommentList;
