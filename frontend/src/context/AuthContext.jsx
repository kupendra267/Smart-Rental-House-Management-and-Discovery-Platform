import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('smart_rental_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('smart_rental_token') || null);
  const [loading, setLoading] = useState(true);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    if (token) {
      refreshUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data.success && res.data.data.user) {
        setUser(res.data.data.user);
        localStorage.setItem('smart_rental_user', JSON.stringify(res.data.data.user));
      }
    } catch (err) {
      console.error('Failed to refresh user profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        const { user: userData, token: jwtToken } = res.data.data;
        setUser(userData);
        setToken(jwtToken);
        localStorage.setItem('smart_rental_token', jwtToken);
        localStorage.setItem('smart_rental_user', JSON.stringify(userData));
        showSuccess(`Welcome back, ${userData.fullName}!`);
        return userData;
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Please check your credentials.';
      showError(message);
      throw err;
    }
  };

  const register = async (payload) => {
    try {
      const res = await api.post('/auth/register', payload);
      if (res.data.success) {
        const { user: userData, token: jwtToken } = res.data.data;
        setUser(userData);
        setToken(jwtToken);
        localStorage.setItem('smart_rental_token', jwtToken);
        localStorage.setItem('smart_rental_user', JSON.stringify(userData));
        showSuccess('Account registered successfully!');
        return userData;
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed.';
      showError(message);
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('smart_rental_token');
    localStorage.removeItem('smart_rental_user');
    showSuccess('Logged out successfully');
  };

  // One-click demo login helpers for student Viva & presentation
  const loginAsAdmin = () => login('admin@smartrental.com', 'Admin@12345');
  const loginAsOwner = (num = 1) => login(`owner${num}@smartrental.com`, 'Owner@12345');
  const loginAsTenant = (num = 1) => login(`tenant${num}@smartrental.com`, 'Tenant@12345');

  const value = {
    user,
    token,
    role: user?.role || 'GUEST',
    isAuthenticated: !!token && !!user,
    loading,
    login,
    register,
    logout,
    refreshUser,
    loginAsAdmin,
    loginAsOwner,
    loginAsTenant
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
