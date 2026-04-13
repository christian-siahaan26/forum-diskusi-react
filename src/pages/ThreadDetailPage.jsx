import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/shared/Navbar';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import Avatar from '../components/shared/Avatar';
import VoteButton from '../components/votes/VoteButton';
import CommentForm from '../components/comments/CommentForm';
import CommentList from '../components/comments/CommentList';
import useAppSelector from '../hooks/useAppSelector';
import useAuth from '../hooks/useAuth';
import {
  createComment,
  selectCommentSubmitError,
  selectCommentSubmitStatus,
} from '../store/slices/commentsSlice';
import {
  clearThreadDetail,
  downVoteComment,
  downVoteThreadDetail,
  fetchThreadDetail,
  selectComments,
  selectThreadDetail,
  selectThreadDetailError,
  selectThreadDetailStatus,
  upVoteComment,
  upVoteThreadDetail,
} from '../store/slices/threadDetailSlice';
import formatDate from '../utils/formatDate';

const ThreadDetailPage = () => {
  const { threadId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { authUser } = useAuth();

  // Selectors
  const thread = useAppSelector(selectThreadDetail);
  const comments = useAppSelector(selectComments);
  const status = useAppSelector(selectThreadDetailStatus);
  const error = useAppSelector(selectThreadDetailError);
  const commentStatus = useAppSelector(selectCommentSubmitStatus);
  const commentError = useAppSelector(selectCommentSubmitError);

  const isLoading = status === 'loading';
  const isFailed = status === 'failed';

  // Fetch on mount, cleanup on unmount
  useEffect(() => {
    dispatch(fetchThreadDetail(threadId));
    return () => dispatch(clearThreadDetail());
  }, [dispatch, threadId]);

  // Handlers
  const handleUpVoteThread = () => {
    if (!authUser) return;
    dispatch(upVoteThreadDetail({ threadId, userId: authUser.id }));
  };

  const handleDownVoteThread = () => {
    if (!authUser) return;
    dispatch(downVoteThreadDetail({ threadId, userId: authUser.id }));
  };

  const handleUpVoteComment = (commentId) => {
    if (!authUser) return;
    dispatch(upVoteComment({ threadId, commentId, userId: authUser.id }));
  };

  const handleDownVoteComment = (commentId) => {
    if (!authUser) return;
    dispatch(downVoteComment({ threadId, commentId, userId: authUser.id }));
  };

  const handleSubmitComment = (content) => {
    if (!authUser) return;
    dispatch(createComment({ threadId, content }));
  };

  const isUpVoted = authUser ? thread?.upVotesBy.includes(authUser.id) : false;
  const isDownVoted = authUser
    ? thread?.downVotesBy.includes(authUser.id)
    : false;

  // Loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <LoadingSpinner fullPage />
      </div>
    );
  }

  // Error
  if (isFailed) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="mx-auto max-w-3xl px-4 py-20 text-center">
          <p className="mb-4 text-lg font-medium text-red-600">
            Gagal memuat thread
          </p>
          <p className="mb-6 text-sm text-gray-500">{error}</p>
          <div className="flex justify-center gap-3">
            <button
              type="button"
              onClick={() => dispatch(fetchThreadDetail(threadId))}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Coba Lagi
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
            >
              Kembali
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Thread not found
  if (!thread) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="mx-auto max-w-3xl px-4 py-8">
        {/* Back Button */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <span aria-hidden="true">←</span>
          Kembali
        </button>

        {/* Thread Card */}
        <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          {/* Category + Date */}
          <div className="mb-4 flex items-center gap-2">
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
              #
              {thread.category}
            </span>
            <span className="text-xs text-gray-400">
              {formatDate(thread.createdAt)}
            </span>
          </div>

          {/* Title */}
          <h1 className="mb-4 text-2xl font-bold leading-snug text-gray-900">
            {thread.title}
          </h1>

          {/* Owner */}
          <div className="mb-5 flex items-center gap-3">
            <Avatar
              src={thread.owner?.avatar}
              name={thread.owner?.name ?? 'Unknown'}
              size="md"
            />
            <div>
              <p className="text-sm font-medium text-gray-800">
                {thread.owner?.name ?? 'Pengguna tidak diketahui'}
              </p>
              <p className="text-xs text-gray-400">Penulis</p>
            </div>
          </div>

          {/* Body */}
          <div
            className="
              prose prose-sm max-w-none text-gray-700
              prose-a:text-blue-600 prose-strong:text-gray-900
            "
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: thread.body }}
          />

          {/* Vote */}
          <div className="mt-6 flex items-center gap-3 border-t border-gray-100 pt-4">
            <VoteButton
              type="up"
              count={thread.upVotesBy.length}
              isActive={isUpVoted}
              isDisabled={!authUser}
              onClick={handleUpVoteThread}
            />
            <VoteButton
              type="down"
              count={thread.downVotesBy.length}
              isActive={isDownVoted}
              isDisabled={!authUser}
              onClick={handleDownVoteThread}
            />
            <span className="ml-auto text-xs text-gray-400">
              {comments.length}
              {' '}
              komentar
            </span>
          </div>
        </article>

        {/* Comment Section */}
        <section className="mt-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Komentar (
            {comments.length}
            )
          </h2>

          {/* Form */}
          <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5">
            {!authUser && (
              <p className="mb-3 text-sm text-gray-500">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="font-medium text-blue-600 hover:underline"
                >
                  Masuk
                </button>
                {' '}
                untuk ikut berkomentar.
              </p>
            )}
            <CommentForm
              onSubmit={handleSubmitComment}
              isLoading={commentStatus === 'loading'}
              error={commentError}
              isDisabled={!authUser}
            />
          </div>

          {/* List */}
          <CommentList
            comments={comments}
            authUserId={authUser?.id ?? null}
            threadId={threadId}
            onUpVote={handleUpVoteComment}
            onDownVote={handleDownVoteComment}
          />
        </section>
      </main>
    </div>
  );
};

export default ThreadDetailPage;
