import axiosInstance from './axiosInstance';

/**
 * @param {{ name: string, email: string, password: string }} credentials
 */
export const registerUserApi = async (credentials) => {
  const response = await axiosInstance.post('/register', credentials);
  return response.data;
};

/**
 * @param {{ email: string, password: string }} credentials
 * @returns {{ token: string }}
 */
export const loginUserApi = async (credentials) => {
  const response = await axiosInstance.post('/login', credentials);
  return response.data;
};

/**
 * @returns {{ user: object }}
 */
export const fetchCurrentUserApi = async () => {
  const response = await axiosInstance.get('/users/me');
  return response.data;
};
