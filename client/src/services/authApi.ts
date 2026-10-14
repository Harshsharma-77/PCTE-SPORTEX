import { apiClient } from './api';
import { ApiResponse } from '../types';
import { AuthResponse, LoginDTO, RegisterStudentDTO, User } from '../types/auth';

export const authApi = {
  login: async (credentials: LoginDTO): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
    return response.data.data;
  },

  registerStudent: async (data: RegisterStudentDTO): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', data);
    return response.data.data;
  },

  refreshToken: async (refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> => {
    const response = await apiClient.post<ApiResponse<{ accessToken: string; refreshToken: string }>>(
      '/auth/refresh-token',
      { refreshToken }
    );
    return response.data.data;
  },

  logout: async (): Promise<void> => {
    const refreshToken = localStorage.getItem('sportex_refresh_token');
    await apiClient.post('/auth/logout', { refreshToken }).catch(() => null);
  },

  getMe: async (): Promise<User> => {
    const response = await apiClient.get<ApiResponse<User>>('/auth/me');
    return response.data.data;
  },

  changePassword: async (passwords: { currentPassword: string; newPassword: string; confirmPassword: string }) => {
    const response = await apiClient.post<ApiResponse<{ message: string }>>('/auth/change-password', passwords);
    return response.data;
  },

  forgotPassword: async (email: string) => {
    const response = await apiClient.post<ApiResponse<{ message: string; resetToken?: string }>>(
      '/auth/forgot-password',
      { email }
    );
    return response.data.data;
  },

  resetPassword: async (data: { token: string; newPassword: string; confirmPassword: string }) => {
    const response = await apiClient.post<ApiResponse<{ message: string }>>('/auth/reset-password', data);
    return response.data;
  },

  // RBAC Test endpoints
  testRbac: async (endpoint: string) => {
    const response = await apiClient.get<ApiResponse<any>>(`/rbac-test/${endpoint}`);
    return response.data;
  },
};
