import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    api.fetch('/api/auth/me')
      .then(data => setUser(data.user))
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await api.fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem('token', data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const signup = useCallback(async ({ name, email, password }) => {
    const data = await api.fetch('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });

    if (data.requiresVerification) {
      return { requiresVerification: true };
    }

    localStorage.setItem('token', data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const resendVerification = useCallback(async (email) => {
    return api.fetch('/api/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (data) => {
    const result = await api.fetch('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    setUser(result.user);
    return result.user;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateProfile, resendVerification }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
