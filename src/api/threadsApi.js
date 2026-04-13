import axiosInstance from './axiosInstance';

export const fetchThreadsApi = async () => {
  const response = await axiosInstance.get('/threads');
  return response.data;
};

/**
 * @param {{ title: string, body: string, category: string }} threadData
 */
export const createThreadApi = async (threadData) => {
  const response = await axiosInstance.post('/threads', threadData);
  return response.data; // { data: { thread } }
};

export const upVoteThreadApi = async (threadId) => {
  const response = await axiosInstance.post(`/threads/${threadId}/up-vote`);
  return response.data;
};

export const downVoteThreadApi = async (threadId) => {
  const response = await axiosInstance.post(`/threads/${threadId}/down-vote`);
  return response.data;
};

export const neutralVoteThreadApi = async (threadId) => {
  const response = await axiosInstance.post(`/threads/${threadId}/neutral-vote`);
  return response.data;
};

export const fetchThreadDetailApi = async (threadId) => {
  const response = await axiosInstance.get(`/threads/${threadId}`);
  return response.data; // { data: { detailThread } }
};
