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
          // Set token in headers first
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          const response = await api.get('/api/auth/me');
          if (response.data?.success && response.data?.data?.user) {
            dispatch({
              type: 'AUTH_SUCCESS',
              payload: {
                user: response.data.data.user,
                token
              }
            });
          } else {
            throw new Error('Invalid response format');
          }
        } catch (error) {
          const status = error?.response?.status;
          // Only clear token and fail auth on actual auth errors (401/403)
          if (status === 401 || status === 403) {
            localStorage.removeItem('token');
            delete api.defaults.headers.common['Authorization'];
            dispatch({ type: 'AUTH_FAILURE', payload: 'Session expired' });
          } else {
            // For network errors, retry once after a short delay
            console.warn('Network error during auth check, retrying...');
            setTimeout(async () => {
              try {
                const retryResponse = await api.get('/api/auth/me');
                if (retryResponse.data?.success && retryResponse.data?.data?.user) {
                  dispatch({
                    type: 'AUTH_SUCCESS',
                    payload: {
                      user: retryResponse.data.data.user,
                      token
                    }
                  });
                } else {
                  throw new Error('Invalid response format');
                }
              } catch (retryError) {
                // If retry fails, keep token but set user to null
                // Keep loading state so components wait for next successful call
                const retryStatus = retryError?.response?.status;
                if (retryStatus === 401 || retryStatus === 403) {
                  // Real auth error - clear token
                  localStorage.removeItem('token');
                  delete api.defaults.headers.common['Authorization'];
                  dispatch({ 
                    type: 'AUTH_FAILURE', 
                    payload: 'Session expired' 
                  });
                } else {
                  // Network error - keep token and keep loading state
                  // This allows components to keep showing loading spinner
                  console.warn('Retry failed, keeping loading state');
                  // Keep in loading state - user will load when network recovers
                  dispatch({ type: 'AUTH_START' });
                }
              }
            }, 2000);
          }
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
  
  // Load user data if we have token but no user (after initial load)
  useEffect(() => {
    // Only load if we have token, are authenticated, but user is null/loading
    if (state.token && state.isAuthenticated && !state.user && !state.isLoading) {
      const loadUser = async () => {
        try {
          const response = await api.get('/api/auth/me');
          if (response.data?.success && response.data?.data?.user) {
            dispatch({
              type: 'UPDATE_USER',
              payload: response.data.data.user
            });
          }
        } catch (error) {
          // If it fails, don't set user to null - keep current state
          console.warn('Failed to load user data:', error.message);
        }
      };
      
      loadUser();
    }
  }, [state.token, state.isAuthenticated, state.user, state.isLoading]);

  const login = async (email, password) => {
    dispatch({ type: 'AUTH_START' });
    
    try {
      const response = await api.post('/api/auth/login', { email, password });
      
      if (response.data.success) {
        toast.success('OTP sent to your email for verification', { id: 'login-otp-sent' });
        return { success: true, email };
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Login failed';
      dispatch({ type: 'AUTH_FAILURE', payload: message });
      toast.error(message, { id: 'login-error' });
      return { success: false, message };
    }
  };

  const verifyLoginOTP = async (email, otp) => {
    dispatch({ type: 'AUTH_START' });
    
    try {
      const response = await api.post('/api/auth/verify-login', { email, otp });
      
      if (response.data.success) {
        const { user, token } = response.data.data;
        // Ensure any existing admin session is cleared when user logs in
        localStorage.removeItem('adminToken');
        delete api.defaults.headers.common['Authorization'];
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user, token }
        });
        
        toast.success('Login successful! Welcome back.', { id: 'login-success' });
        navigate(user.role === 'admin' ? '/admin' : '/dashboard');
        return { success: true };
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'OTP verification failed';
      dispatch({ type: 'AUTH_FAILURE', payload: message });
      toast.error(message, { id: 'verify-login-error' });
      return { success: false, message };
    }
  };

  // Role-aware OTP verification without auto-redirect
  const verifyLoginOTPAs = async (email, otp, requiredRole) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const response = await api.post('/api/auth/verify-login', { email, otp });
      if (response.data.success) {
        const { user, token } = response.data.data;
        // Set auth state but do not navigate here
        dispatch({ type: 'AUTH_SUCCESS', payload: { user, token } });
        // Clear any existing admin token when a user session starts
        localStorage.removeItem('adminToken');
        delete api.defaults.headers.common['Authorization'];

        if (requiredRole && user.role !== requiredRole) {
          // Revert auth if role mismatch
          dispatch({ type: 'LOGOUT' });
          return { success: false, message: 'Access denied: not an admin account' };
        }
        return { success: true, user };
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'OTP verification failed';
      dispatch({ type: 'AUTH_FAILURE', payload: message });
      return { success: false, message };
    }
  };

  const register = async (userData) => {
    dispatch({ type: 'AUTH_START' });
    
    try {
      const response = await api.post('/api/auth/generate-registration-otp', userData);
      
      if (response.data.success) {
        toast.success('OTP sent to your email for verification', { id: 'register-otp-sent' });
        return { success: true, email: userData.email };
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Registration failed';
      dispatch({ type: 'AUTH_FAILURE', payload: message });
      toast.error(message, { id: 'register-error' });
      return { success: false, message };
    }
  };

  const verifyRegistration = async (userData, otp) => {
    dispatch({ type: 'AUTH_START' });
    
    try {
      const response = await api.post('/api/auth/verify-registration', { ...userData, otp });
      
      if (response.data.success) {
        const { user, token } = response.data.data;
        // Clear any existing admin token when a user session starts
        localStorage.removeItem('adminToken');
        delete api.defaults.headers.common['Authorization'];
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user, token }
        });
        
        toast.success('Registration successful! Welcome to DigiVote App.', { id: 'register-success' });
        navigate('/dashboard');
        return { success: true };
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Registration verification failed';
      dispatch({ type: 'AUTH_FAILURE', payload: message });
      toast.error(message, { id: 'register-verify-error' });
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
      toast.success('Logged out successfully', { id: 'logout-success' });
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
        
        toast.success('Profile updated successfully', { id: 'profile-update-success' });
        return { success: true };
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Profile update failed';
      toast.error(message, { id: 'profile-update-error' });
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
    verifyLoginOTPAs,
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
