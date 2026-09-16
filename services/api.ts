import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

// For physical devices, we need the LAN IP. We use the manifest or env var.
const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  
  // Fallback for development if EXPO_PUBLIC_API_URL is missing
  // Usually http://<your-ip>:3000/api
  return 'http://localhost:3000/api';
};

export const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 10000,
});

api.interceptors.request.use(async (config) => {
  try {
    const token = await SecureStore.getItemAsync('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    // Ignore secure store errors in dev
  }
  return config;
});

// We handle 401 Unauthorized globally in AuthContext but intercept it here if needed
export default api;
