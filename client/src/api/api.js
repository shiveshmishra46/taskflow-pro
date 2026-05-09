import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api'
});

api.interceptors.request.use((config) => {
  const storedUser = localStorage.getItem('taskflowUser');

  if (storedUser) {
    const user = JSON.parse(storedUser);
    config.headers.Authorization = `Bearer ${user.token}`;
  }

  return config;
});

export default api;
