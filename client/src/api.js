import axios from 'axios';

const baseURL = process.env.REACT_APP_API_URL !== undefined
  ? process.env.REACT_APP_API_URL
  : (window.location.hostname === 'localhost' ? 'http://localhost:5000' : '');

const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('petnest_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
