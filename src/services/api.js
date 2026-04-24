import axios from 'axios';
import router from '@/router';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => {
    if (response.data?.error) {
      if (response.data.message === 'Unauthenticated.') {
        localStorage.removeItem('token');

        if (router.currentRoute.value.path !== '/login') {
          router.push('/login');
        }
      }
    }

    return response;
  },
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      localStorage.removeItem('token');

      if (router.currentRoute.value.path !== '/login') {
        router.push('/login');
      }
    }

    if (status === 403) {
      console.warn('Acesso negado');
    }

    if (status === 500) {
      console.error('Erro interno do servidor');
    }

    return Promise.reject(error);
  }
);

export { api };
