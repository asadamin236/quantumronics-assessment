import React, { useEffect, useState } from 'react';
import api, { getMe, logoutUser } from './api';
import { AuthContext } from './contextCore';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          try {
            const refreshed = await api.post('/auth/refresh');
            if (refreshed.data?.accessToken) localStorage.setItem('accessToken', refreshed.data.accessToken);
          } catch (error) {
            void error;
          }
        }
        const data = await getMe();
        setUser(data.user);
      } catch (error) {
        void error;
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data?.accessToken) localStorage.setItem('accessToken', res.data.accessToken);
    setUser(res.data.user);
    return res.data;
  };

  const signup = async (payload) => {
    const res = await api.post('/auth/signup', payload);
    if (res.data?.accessToken) localStorage.setItem('accessToken', res.data.accessToken);
    setUser(res.data.user);
    return res.data;
  };

  const logout = async () => {
    await logoutUser();
    localStorage.removeItem('accessToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
