import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env?.VITE_API_BASE_URL || 'http://localhost:8000/api',
    withCredentials: true,
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const loginUser = async (email, password) => {
    try {
        const response = await api.post('/auth/login', { email, password });
        
        if (response.data.accessToken) {
            localStorage.setItem('accessToken', response.data.accessToken);
        }
        
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : new Error("Server Error");
    }
};

export const signupUser = async (name, email, password) => {
  const response = await api.post('/auth/signup', { name, email, password });
  if (response.data.accessToken) localStorage.setItem('accessToken', response.data.accessToken);
  return response.data;
};

export const getMe = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const refreshToken = async () => {
  const response = await api.post('/auth/refresh');
  if (response.data.accessToken) localStorage.setItem('accessToken', response.data.accessToken);
  return response.data;
};

export const logoutUser = async () => {
  const response = await api.post('/auth/logout');
  return response.data;
};

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response && error.response.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const { accessToken } = await refreshToken();
        if (accessToken) {
          original.headers.Authorization = `Bearer ${accessToken}`;
          return api(original);
        }
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
