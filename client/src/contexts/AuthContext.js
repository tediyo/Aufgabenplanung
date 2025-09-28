import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI } from '../utils/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, loading: true, error: null };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        error: null,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        loading: false,
        isAuthenticated: false,
        user: null,
        token: null,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        error: null,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

const initialState = {
  isAuthenticated: false,
  user: null,
  token: null,
  loading: true,
  error: null,
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing token on app load
  useEffect(() => {
    // Skip localStorage check - always start as not authenticated
    dispatch({ type: 'LOGOUT' });
  }, []);

  const login = async (credentials) => {
    try {
      dispatch({ type: 'LOGIN_START' });
      const response = await authAPI.login(credentials);
      const { token, user } = response.data;

      // Skip localStorage - just store in memory
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { token, user },
      });

      toast.success('Login successful!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: message,
      });
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const register = async (userData) => {
    try {
      console.log('🔄 Starting registration with data:', userData);
      console.log('🔄 UserData type:', typeof userData);
      console.log('🔄 UserData keys:', Object.keys(userData));
      dispatch({ type: 'LOGIN_START' });
      
      // Test server connectivity first
      console.log('🔍 Testing server connectivity...');
      try {
        const testResponse = await fetch('https://aufgabenplanung.onrender.com/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData)
        });
        console.log('🔍 Test response status:', testResponse.status);
        console.log('🔍 Test response headers:', testResponse.headers);
        const testData = await testResponse.json();
        console.log('🔍 Test response data:', testData);
        
        if (testResponse.ok) {
          console.log('✅ Direct fetch registration successful!');
          const { token, user } = testData;
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: { token, user },
          });
          toast.success('Registration successful!');
          return { success: true };
        } else {
          // Handle specific error cases
          if (testResponse.status === 400 && testData.message === 'User already exists with this email') {
            throw new Error('An account with this email already exists. Please use a different email or try logging in.');
          } else if (testResponse.status === 400 && testData.errors) {
            // Handle validation errors
            const errorMessages = testData.errors.map(err => err.msg).join(', ');
            throw new Error(errorMessages);
          } else {
            throw new Error(`Server returned ${testResponse.status}: ${testData.message || 'Unknown error'}`);
          }
        }
      } catch (fetchError) {
        console.log('❌ Direct fetch failed:', fetchError);
        throw fetchError;
      }
    } catch (error) {
      console.log('❌ Registration failed:', error);
      console.log('❌ Error type:', typeof error);
      console.log('❌ Error message:', error.message);
      console.log('❌ Error stack:', error.stack);
      const message = error.message || 'Registration failed';
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: message,
      });
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    // Clear sessionStorage and memory
    sessionStorage.removeItem('authToken');
    dispatch({ type: 'LOGOUT' });
    toast.success('Logged out successfully');
  };

  const updateProfile = async (userData) => {
    try {
      const response = await authAPI.updateProfile(userData);
      const { user } = response.data;

      // Skip localStorage - just update memory
      dispatch({
        type: 'UPDATE_USER',
        payload: user,
      });

      toast.success('Profile updated successfully!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const changePassword = async (passwordData) => {
    try {
      await authAPI.changePassword(passwordData);
      toast.success('Password changed successfully!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Password change failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    clearError,
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



