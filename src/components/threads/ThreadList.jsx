import PropTypes from 'prop-types';
import ThreadCard from './ThreadCard';

/**
 * @param {{
 *   threads: object[],
 *   users: object[],
 *   authUserId: string | null,
 *   activeCategory: string,
 *   onUpVote: (threadId: string) => void,
 *   onDownVote: (threadId: string) => void,
 * }} props
 */
const ThreadList = ({
  threads,
  users,
  authUserId,
  activeCategory,
  onUpVote,
  onDownVote,
}) => {
  const getUserById = (ownerId) => users.find((user) => user.id === ownerId) ?? null;

  if (threads.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-center">
        <span className="text-5xl" aria-hidden="true">🗂️</span>
        <p className="text-base font-medium text-gray-700">
          {activeCategory === 'all'
            ? 'Belum ada thread sama sekali.'
            : `Tidak ada thread dengan kategori #${activeCategory}.`}
        </p>
        <p className="text-sm text-gray-400">
          Jadilah yang pertama membuat diskusi!
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {threads.map((thread) => (
        <ThreadCard
          key={thread.id}
          thread={thread}
          owner={getUserById(thread.ownerId)}
          authUserId={authUserId}
          onUpVote={onUpVote}
          onDownVote={onDownVote}
        />
      ))}
    </div>
  );
};

ThreadList.propTypes = {
  threads: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    ownerId: PropTypes.string.isRequired,
  })).isRequired,
  users: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    avatar: PropTypes.string,
  })).isRequired,
  authUserId: PropTypes.string,
  activeCategory: PropTypes.string.isRequired,
  onUpVote: PropTypes.func.isRequired,
  onDownVote: PropTypes.func.isRequired,
};

export default ThreadList;
