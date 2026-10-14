import { apiClient } from './api';
import { StudentDashboardData } from '../types/student';

export const studentApi = {
  getDashboard: async (studentId?: string): Promise<StudentDashboardData> => {
    const params = studentId ? { studentId } : {};
    const response = await apiClient.get('/student/dashboard', { params });
    return response.data.data;
  },

  updateProfile: async (data: { phone?: string; emergencyContact?: string; bloodGroup?: string }) => {
    const response = await apiClient.patch('/student/profile', data);
    return response.data;
  },

  markNotificationRead: async (notificationId: string) => {
    const response = await apiClient.patch(`/student/notifications/${notificationId}/read`);
    return response.data;
  },
};
