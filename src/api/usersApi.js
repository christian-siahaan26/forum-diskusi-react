import axiosInstance from './axiosInstance';

export const fetchAllUsersApi = async () => {
  const response = await axiosInstance.get('/users');
  return response.data;
};
