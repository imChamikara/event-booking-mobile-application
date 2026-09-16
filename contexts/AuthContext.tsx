import React, { createContext, useContext, useReducer, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { User } from '../types';
import api from '../services/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
}

type AuthAction =
  | { type: 'RESTORE_TOKEN'; token: string | null; user: User | null }
  | { type: 'SIGN_IN'; token: string; user: User }
  | { type: 'SIGN_OUT' }
  | { type: 'UPDATE_USER'; user: User };

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: true,
};

const AuthContext = createContext<{
  state: AuthState;
  signIn: (data: { token: string; user: User }) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (user: User) => void;
}>({
  state: initialState,
  signIn: async () => {},
  signOut: async () => {},
  updateUser: () => {},
});

const authReducer = (prevState: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'RESTORE_TOKEN':
      return {
        ...prevState,
        user: action.user,
        token: action.token,
        isLoading: false,
      };
    case 'SIGN_IN':
      return {
        ...prevState,
        token: action.token,
        user: action.user,
      };
    case 'SIGN_OUT':
      return {
        ...prevState,
        token: null,
        user: null,
      };
    case 'UPDATE_USER':
      return {
        ...prevState,
        user: action.user,
      };
    default:
      return prevState;
  }
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const bootstrapAsync = async () => {
      let userToken;
      let userData = null;

      try {
        userToken = await SecureStore.getItemAsync('token');
        if (userToken) {
          // Verify token and get latest user data
          const response = await api.get('/auth/me');
          userData = response.data.data;
        }
      } catch (e) {
        // Restoring token failed or token expired
        userToken = null;
        await SecureStore.deleteItemAsync('token');
      }

      dispatch({ type: 'RESTORE_TOKEN', token: userToken, user: userData });
    };

    bootstrapAsync();
  }, []);

  // Intercept 401 globally to sign out
  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response && error.response.status === 401) {
          await SecureStore.deleteItemAsync('token');
          dispatch({ type: 'SIGN_OUT' });
        }
        return Promise.reject(error);
      }
    );
    return () => api.interceptors.response.eject(interceptor);
  }, []);

  const signIn = async ({ token, user }: { token: string; user: User }) => {
    await SecureStore.setItemAsync('token', token);
    dispatch({ type: 'SIGN_IN', token, user });
  };

  const signOut = async () => {
    await SecureStore.deleteItemAsync('token');
    dispatch({ type: 'SIGN_OUT' });
  };
  
  const updateUser = (user: User) => {
    dispatch({ type: 'UPDATE_USER', user });
  };

  return (
    <AuthContext.Provider value={{ state, signIn, signOut, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
