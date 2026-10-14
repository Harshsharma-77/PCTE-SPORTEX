import { apiClient } from './api';
import { NotificationsResponse, InAppNotification, Announcement } from '../types/notification';

export const notificationApi = {
  getUserNotifications: async (): Promise<NotificationsResponse> => {
    const response = await apiClient.get('/notifications');
    return response.data.data;
  },

  markAsRead: async (id: string): Promise<InAppNotification> => {
    const response = await apiClient.patch(`/notifications/${id}/read`);
    return response.data.data;
  },

  markAllAsRead: async (): Promise<{ message: string }> => {
    const response = await apiClient.patch('/notifications/read-all');
    return response.data.data;
  },

  deleteNotification: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete(`/notifications/${id}`);
    return response.data.data;
  },

  getAnnouncements: async (audience?: string): Promise<Announcement[]> => {
    const params: any = {};
    if (audience) params.audience = audience;
    const response = await apiClient.get('/notifications/announcements', { params });
    return response.data.data;
  },

  createAnnouncement: async (data: {
    title: string;
    content: string;
    priority?: string;
    targetAudience?: string;
    isPinned?: boolean;
    expiresAt?: string;
  }): Promise<Announcement> => {
    const response = await apiClient.post('/notifications/announcements', data);
    return response.data.data;
  },
};
