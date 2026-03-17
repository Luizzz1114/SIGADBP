import axios from 'axios';
import nprogress from 'nprogress';
import 'nprogress/nprogress.css';

nprogress.configure({ showSpinner: false });

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

api.interceptors.request.use(
  (config) => {
    nprogress.start();
    const token = JSON.parse(localStorage.getItem('user_session'))?.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    nprogress.done();
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  response => {
    nprogress.done();
    return response;
  },
  error => {
    nprogress.done();
    return Promise.reject(error);
  }
);

export default api;