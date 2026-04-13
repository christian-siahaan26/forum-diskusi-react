import axiosInstance from './axiosInstance';

export const fetchLeaderboardApi = async () => {
  const response = await axiosInstance.get('/leaderboards');
  return response.data;
};
