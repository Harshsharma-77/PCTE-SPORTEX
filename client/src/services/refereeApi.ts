import { apiClient } from './api';
import { RefereeDashboardData, RefereeMatch } from '../types/referee';

export const refereeApi = {
  getDashboard: async (refereeId?: string): Promise<RefereeDashboardData> => {
    const params = refereeId ? { refereeId } : {};
    const response = await apiClient.get('/referee/dashboard', { params });
    return response.data.data;
  },

  getMatchDetails: async (matchId: string): Promise<RefereeMatch> => {
    const response = await apiClient.get(`/referee/matches/${matchId}`);
    return response.data.data;
  },

  startMatch: async (matchId: string) => {
    const response = await apiClient.post(`/referee/matches/${matchId}/start`);
    return response.data;
  },

  updateMatchStatus: async (
    matchId: string,
    data: {
      status?: string;
      currentPeriod?: string;
      matchTimerSec?: number;
      isClockRunning?: boolean;
    }
  ) => {
    const response = await apiClient.patch(`/referee/matches/${matchId}/status`, data);
    return response.data;
  },

  logMatchEvent: async (
    matchId: string,
    data: {
      eventType: string;
      timestampSec: number;
      period?: string;
      teamId?: string;
      studentId?: string;
      scoreValue?: number;
      commentary?: string;
    }
  ) => {
    const response = await apiClient.post(`/referee/matches/${matchId}/events`, data);
    return response.data;
  },

  submitMatchReport: async (
    matchId: string,
    data: {
      homeScore: number;
      awayScore: number;
      winnerTeamId?: string;
      isDraw?: boolean;
      notes?: string;
    }
  ) => {
    const response = await apiClient.post(`/referee/matches/${matchId}/submit-report`, data);
    return response.data;
  },
};
