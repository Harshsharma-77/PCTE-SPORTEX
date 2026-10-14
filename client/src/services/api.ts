import axios from 'axios';
import { ApiResponse, HealthStatus } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor to attach access token if present
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('sportex_access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Silent Refresh handling will be connected in Phase 2
    return Promise.reject(error);
  }
);

export const systemApi = {
  getHealth: async (): Promise<HealthStatus> => {
    const response = await apiClient.get<ApiResponse<HealthStatus>>('/health');
    return response.data.data;
  },
};
