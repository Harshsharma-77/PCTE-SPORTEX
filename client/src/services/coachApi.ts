import { apiClient } from './api';
import { CoachDashboardData } from '../types/coach';

export const coachApi = {
  getDashboard: async (coachId?: string): Promise<CoachDashboardData> => {
    const params = coachId ? { coachId } : {};
    const response = await apiClient.get('/coach/dashboard', { params });
    return response.data.data;
  },

  markAttendance: async (data: {
    sessionDate: string;
    sportId: string;
    sessionType?: string;
    records: Array<{ studentId: string; status: string; remarks?: string }>;
  }) => {
    const response = await apiClient.post('/coach/attendance', data);
    return response.data;
  },

  addPlayerToSquad: async (data: {
    teamId: string;
    studentId: string;
    jerseyNumber?: number;
    position?: string;
    isCaptain?: boolean;
  }) => {
    const response = await apiClient.post('/coach/players', data);
    return response.data;
  },

  updateSquadPlayer: async (
    memberId: string,
    data: {
      jerseyNumber?: number;
      position?: string;
      isCaptain?: boolean;
      isActive?: boolean;
    }
  ) => {
    const response = await apiClient.patch(`/coach/players/${memberId}`, data);
    return response.data;
  },
};
