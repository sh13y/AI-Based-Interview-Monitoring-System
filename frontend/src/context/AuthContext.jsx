import React, { createContext, useContext, useState, useEffect } from 'react';
import * as authService from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        const result = await authService.getCurrentUser();
        if (result.success) {
          setUser(result.data);
          setIsAuthenticated(true);
        } else {
          // Token is invalid, clear it
          authService.logout();
          setIsAuthenticated(false);
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (credentials) => {
    const result = await authService.login(credentials);
    if (result.success) {
      setUser({
        user_id: result.data.user_id,
        email: result.data.email,
      });
      setIsAuthenticated(true);
    }
    return result;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const signup = async (formData) => {
    return await authService.signup(formData);
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    signup,
  };

  return (
    <AuthContext.Provider value={value}>
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
