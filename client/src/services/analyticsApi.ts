import { apiClient } from './api';
import { LeaderboardsData, CampusAnalyticsData } from '../types/analytics';

export const analyticsApi = {
  getLeaderboards: async (sportId?: string, limit?: number): Promise<LeaderboardsData> => {
    const params: any = {};
    if (sportId) params.sportId = sportId;
    if (limit) params.limit = limit;

    const response = await apiClient.get('/analytics/leaderboards', { params });
    return response.data.data;
  },

  getPerformanceAnalytics: async (): Promise<CampusAnalyticsData> => {
    const response = await apiClient.get('/analytics/performance');
    return response.data.data;
  },
};
