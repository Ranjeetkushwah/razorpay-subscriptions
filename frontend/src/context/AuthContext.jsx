import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { authAPI } from '../services/api'

// Initial state
const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  isLoading: false,
  error: null,
}

// Action types
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  REGISTER_START: 'REGISTER_START',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  REGISTER_FAILURE: 'REGISTER_FAILURE',
  LOAD_USER_START: 'LOAD_USER_START',
  LOAD_USER_SUCCESS: 'LOAD_USER_SUCCESS',
  LOAD_USER_FAILURE: 'LOAD_USER_FAILURE',
  UPDATE_PROFILE_START: 'UPDATE_PROFILE_START',
  UPDATE_PROFILE_SUCCESS: 'UPDATE_PROFILE_SUCCESS',
  UPDATE_PROFILE_FAILURE: 'UPDATE_PROFILE_FAILURE',
  CLEAR_ERROR: 'CLEAR_ERROR',
}

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
    case AUTH_ACTIONS.REGISTER_START:
    case AUTH_ACTIONS.LOAD_USER_START:
    case AUTH_ACTIONS.UPDATE_PROFILE_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      }

    case AUTH_ACTIONS.LOGIN_SUCCESS:
    case AUTH_ACTIONS.REGISTER_SUCCESS:
    case AUTH_ACTIONS.LOAD_USER_SUCCESS:
    case AUTH_ACTIONS.UPDATE_PROFILE_SUCCESS:
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        error: null,
      }

    case AUTH_ACTIONS.LOGIN_FAILURE:
    case AUTH_ACTIONS.REGISTER_FAILURE:
    case AUTH_ACTIONS.LOAD_USER_FAILURE:
    case AUTH_ACTIONS.UPDATE_PROFILE_FAILURE:
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        token: null,
        error: action.payload,
      }

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        error: null,
      }

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      }

    default:
      return state
  }
}

// Create context
const AuthContext = createContext()

// Provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Save token to localStorage whenever it changes
  useEffect(() => {
    if (state.token) {
      localStorage.setItem('token', state.token)
      // Set default axios authorization header
      authAPI.defaults.headers.common['Authorization'] = `Bearer ${state.token}`
    } else {
      localStorage.removeItem('token')
      delete authAPI.defaults.headers.common['Authorization']
    }
  }, [state.token])

  // Load user from localStorage on app start
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      authAPI.defaults.headers.common['Authorization'] = `Bearer ${token}`
      dispatch({
        type: AUTH_ACTIONS.LOAD_USER_START,
      })
      // Load user data with token
      authAPI.getMe().then(response => {
        if (response.success) {
          dispatch({
            type: AUTH_ACTIONS.LOAD_USER_SUCCESS,
            payload: {
              user: response.data.user,
              token,
            },
          })
        } else {
          dispatch({
            type: AUTH_ACTIONS.LOAD_USER_FAILURE,
            payload: response.message,
          })
        }
      }).catch(error => {
        dispatch({
          type: AUTH_ACTIONS.LOAD_USER_FAILURE,
          payload: error.message || 'Failed to load user',
        })
      })
    }
  }, [])

  const value = {
    ...state,
    dispatch,
    login: async (credentials) => {
      dispatch({ type: AUTH_ACTIONS.LOGIN_START })
      try {
        const response = await authAPI.login(credentials)
        if (response.success) {
          dispatch({
            type: AUTH_ACTIONS.LOGIN_SUCCESS,
            payload: {
              user: response.data.user,
              token: response.data.token,
            },
          })
          return { success: true, data: response.data }
        } else {
          dispatch({
            type: AUTH_ACTIONS.LOGIN_FAILURE,
            payload: response.message,
          })
          return { success: false, message: response.message }
        }
      } catch (error) {
        dispatch({
          type: AUTH_ACTIONS.LOGIN_FAILURE,
          payload: error.message || 'Login failed',
        })
        return { success: false, message: error.message || 'Login failed' }
      }
    },
    register: async (userData) => {
      dispatch({ type: AUTH_ACTIONS.REGISTER_START })
      try {
        const response = await authAPI.register(userData)
        if (response.success) {
          dispatch({
            type: AUTH_ACTIONS.REGISTER_SUCCESS,
            payload: {
              user: response.data.user,
              token: response.data.token,
            },
          })
          return { success: true, data: response.data }
        } else {
          dispatch({
            type: AUTH_ACTIONS.REGISTER_FAILURE,
            payload: response.message,
          })
          return { success: false, message: response.message }
        }
      } catch (error) {
        dispatch({
          type: AUTH_ACTIONS.REGISTER_FAILURE,
          payload: error.message || 'Registration failed',
        })
        return { success: false, message: error.message || 'Registration failed' }
      }
    },
    logout: () => {
      dispatch({ type: AUTH_ACTIONS.LOGOUT })
      localStorage.removeItem('token')
      delete authAPI.defaults.headers.common['Authorization']
    },
    updateProfile: async (profileData) => {
      dispatch({ type: AUTH_ACTIONS.UPDATE_PROFILE_START })
      try {
        const response = await authAPI.updateProfile(profileData)
        if (response.success) {
          dispatch({
            type: AUTH_ACTIONS.UPDATE_PROFILE_SUCCESS,
            payload: {
              user: response.data.user,
              token: state.token,
            },
          })
          return { success: true, data: response.data }
        } else {
          dispatch({
            type: AUTH_ACTIONS.UPDATE_PROFILE_FAILURE,
            payload: response.message,
          })
          return { success: false, message: response.message }
        }
      } catch (error) {
        dispatch({
          type: AUTH_ACTIONS.UPDATE_PROFILE_FAILURE,
          payload: error.message || 'Profile update failed',
        })
        return { success: false, message: error.message || 'Profile update failed' }
      }
    },
    clearError: () => {
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR })
    },
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
