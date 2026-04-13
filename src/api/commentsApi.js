import axiosInstance from './axiosInstance';

/**
 * @param {string} threadId
 * @param {{ content: string }} commentData
 */
export const createCommentApi = async (threadId, commentData) => {
  const response = await axiosInstance.post(
    `/threads/${threadId}/comments`,
    commentData,
  );
  return response.data;
};

export const upVoteCommentApi = async (threadId, commentId) => {
  const response = await axiosInstance.post(
    `/threads/${threadId}/comments/${commentId}/up-vote`,
  );
  return response.data;
};

export const downVoteCommentApi = async (threadId, commentId) => {
  const response = await axiosInstance.post(
    `/threads/${threadId}/comments/${commentId}/down-vote`,
  );
  return response.data;
};

export const neutralVoteCommentApi = async (threadId, commentId) => {
  const response = await axiosInstance.post(
    `/threads/${threadId}/comments/${commentId}/neutral-vote`,
  );
  return response.data;
};
