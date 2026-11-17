import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

// Helper to safely access localStorage in all environments
const storage = {
  getItem: (key) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch (e) {
      return null;
    }
    return null;
  },
  setItem: (key, val) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, val);
      }
    } catch (e) {}
  },
  removeItem: (key) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch (e) {}
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = storage.getItem('tradex_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => storage.getItem('tradex_token') || null);
  const [loading, setLoading] = useState(true);

  // Synchronize user profile on initial load
  const refreshUser = useCallback(async () => {
    const storedToken = storage.getItem('tradex_token');
    if (!storedToken) {
      setLoading(false);
      return;
    }
    try {
      const res = await authAPI.getMe();
      if (res.data && res.data.success) {
        setUser(res.data.data);
        storage.setItem('tradex_user', JSON.stringify(res.data.data));
      }
    } catch (err) {
      console.error('[AuthContext] Session expired or invalid:', err.message);
      setUser(null);
      setToken(null);
      storage.removeItem('tradex_token');
      storage.removeItem('tradex_user');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    if (res.data && res.data.success) {
      const { token: receivedToken, user: receivedUser } = res.data.data;
      setToken(receivedToken);
      setUser(receivedUser);
      storage.setItem('tradex_token', receivedToken);
      storage.setItem('tradex_user', JSON.stringify(receivedUser));
      return res.data;
    }
  };

  const register = async (name, email, password, confirmPassword) => {
    const res = await authAPI.register({ name, email, password, confirmPassword });
    if (res.data && res.data.success) {
      const { token: receivedToken, user: receivedUser } = res.data.data;
      setToken(receivedToken);
      setUser(receivedUser);
      storage.setItem('tradex_token', receivedToken);
      storage.setItem('tradex_user', JSON.stringify(receivedUser));
      return res.data;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    storage.removeItem('tradex_token');
    storage.removeItem('tradex_user');
    window.location.href = '/login';
  };

  const updateUser = (updatedFields) => {
    setUser((prev) => {
      const updated = { ...prev, ...updatedFields };
      storage.setItem('tradex_user', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token && !!user,
        login,
        register,
        logout,
        updateUser,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
