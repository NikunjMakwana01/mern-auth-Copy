import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';

const AuthContext = createContext();

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  isLoading: true,
  error: null
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null
      };
    
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null
      };
    
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload
      };
    
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      };
    
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload
      };
    
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const navigate = useNavigate();

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          const response = await api.get('/api/auth/me');
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: {
              user: response.data.data.user,
              token
            }
          });
        } catch (error) {
          localStorage.removeItem('token');
          dispatch({ type: 'AUTH_FAILURE', payload: 'Session expired' });
        }
      } else {
        dispatch({ type: 'AUTH_FAILURE', payload: null });
      }
    };

    checkAuth();
  }, []);

  // Set auth token in axios headers when token changes
  useEffect(() => {
    if (state.token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
      localStorage.setItem('token', state.token);
    } else {
      delete api.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  }, [state.token]);

  const login = async (email, password) => {
    dispatch({ type: 'AUTH_START' });
    
    try {
      const response = await api.post('/api/auth/login', { email, password });
      
      if (response.data.success) {
        toast.success('OTP sent to your email for verification');
        return { success: true, email };
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Login failed';
      dispatch({ type: 'AUTH_FAILURE', payload: message });
      toast.error(message);
      return { success: false, message };
    }
  };

  const verifyLoginOTP = async (email, otp) => {
    dispatch({ type: 'AUTH_START' });
    
    try {
      const response = await api.post('/api/auth/verify-login', { email, otp });
      
      if (response.data.success) {
        const { user, token } = response.data.data;
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user, token }
        });
        
        toast.success('Login successful! Welcome back.');
        navigate('/dashboard');
        return { success: true };
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'OTP verification failed';
      dispatch({ type: 'AUTH_FAILURE', payload: message });
      toast.error(message);
      return { success: false, message };
    }
  };

  const register = async (userData) => {
    dispatch({ type: 'AUTH_START' });
    
    try {
      const response = await api.post('/api/auth/generate-registration-otp', userData);
      
      if (response.data.success) {
        toast.success('OTP sent to your email for verification');
        return { success: true, email: userData.email };
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Registration failed';
      dispatch({ type: 'AUTH_FAILURE', payload: message });
      toast.error(message);
      return { success: false, message };
    }
  };

  const verifyRegistration = async (userData, otp) => {
    dispatch({ type: 'AUTH_START' });
    
    try {
      const response = await api.post('/api/auth/verify-registration', { ...userData, otp });
      
      if (response.data.success) {
        const { user, token } = response.data.data;
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user, token }
        });
        
        toast.success('Registration successful! Welcome to DigiVote App.');
        navigate('/dashboard');
        return { success: true };
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Registration verification failed';
      dispatch({ type: 'AUTH_FAILURE', payload: message });
      toast.error(message);
      return { success: false, message };
    }
  };

  const logout = async () => {
    try {
      if (state.token) {
        await api.post('/api/auth/logout');
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch({ type: 'LOGOUT' });
      navigate('/');
      toast.success('Logged out successfully');
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await api.put('/api/users/profile', profileData);
      
      if (response.data.success) {
        dispatch({
          type: 'UPDATE_USER',
          payload: response.data.data.user
        });
        
        toast.success('Profile updated successfully');
        return { success: true };
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Profile update failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  // changePassword removed per requirements

  // changePassword removed

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const updateUser = (userData) => {
    dispatch({
      type: 'UPDATE_USER',
      payload: userData
    });
  };

  const value = {
    ...state,
    login,
    verifyLoginOTP,
    register,
    verifyRegistration,
    logout,
    updateProfile,
    clearError,
    updateUser
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
