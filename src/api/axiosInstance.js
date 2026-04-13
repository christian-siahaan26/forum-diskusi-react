import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'https://forum-api.dicoding.dev/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'Terjadi kesalahan, coba lagi.';
    return Promise.reject(new Error(message));
  },
);

export default axiosInstance;
