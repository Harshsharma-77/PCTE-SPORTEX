import { apiClient } from './api';
import { AdminSummaryData, AdminChartsData, QuickLookupsData } from '../types/dashboard';

export const dashboardApi = {
  getAdminSummary: async (): Promise<AdminSummaryData> => {
    const response = await apiClient.get('/dashboard/admin/summary');
    return response.data.data;
  },

  getAdminCharts: async (): Promise<AdminChartsData> => {
    const response = await apiClient.get('/dashboard/admin/charts');
    return response.data.data;
  },

  getQuickLookups: async (): Promise<QuickLookupsData> => {
    const response = await apiClient.get('/dashboard/admin/quick-lookups');
    return response.data.data;
  },

  getInstitutionalDirectory: async (): Promise<{
    users: any[];
    students: any[];
    coaches: any[];
    referees: any[];
  }> => {
    const response = await apiClient.get('/dashboard/admin/directory');
    return response.data.data;
  },

  quickAddSport: async (data: any) => {
    const response = await apiClient.post('/dashboard/admin/quick-sport', data);
    return response.data;
  },

  quickAddTeam: async (data: any) => {
    const response = await apiClient.post('/dashboard/admin/quick-team', data);
    return response.data;
  },

  quickAddPlayer: async (data: any) => {
    const response = await apiClient.post('/dashboard/admin/quick-player', data);
    return response.data;
  },

  quickCreateTournament: async (data: any) => {
    const response = await apiClient.post('/dashboard/admin/quick-tournament', data);
    return response.data;
  },

  quickScheduleMatch: async (data: any) => {
    const response = await apiClient.post('/dashboard/admin/quick-match', data);
    return response.data;
  },

  quickPublishAnnouncement: async (data: any) => {
    const response = await apiClient.post('/dashboard/admin/quick-announcement', data);
    return response.data;
  },
};
