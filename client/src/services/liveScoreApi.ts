import { apiClient } from './api';
import { LiveMatch } from '../types/liveScore';

export const liveScoreApi = {
  getLiveMatchesFeed: async (): Promise<LiveMatch[]> => {
    const response = await apiClient.get('/live/matches');
    return response.data.data;
  },

  getLiveMatchById: async (matchId: string): Promise<LiveMatch> => {
    const response = await apiClient.get(`/live/matches/${matchId}`);
    return response.data.data;
  },

  startMatch: async (matchId: string) => {
    const response = await apiClient.post(`/live/matches/${matchId}/start`);
    return response.data;
  },

  updateScoreAndLogEvent: async (
    matchId: string,
    payload: {
      teamId?: string;
      studentId?: string;
      eventType: string;
      scoreDelta?: number;
      subScoreText?: string;
      currentPeriod?: string;
      timestampSec?: number;
      commentary?: string;
      metadata?: any;
    }
  ) => {
    const response = await apiClient.post(`/live/matches/${matchId}/score`, payload);
    return response.data;
  },

  syncClock: async (
    matchId: string,
    data: {
      isClockRunning: boolean;
      matchTimerSec?: number;
      currentPeriod?: string;
      status?: string;
    }
  ) => {
    const response = await apiClient.patch(`/live/matches/${matchId}/clock`, data);
    return response.data;
  },

  undoLastEvent: async (matchId: string, eventId: string) => {
    const response = await apiClient.delete(`/live/matches/${matchId}/events/${eventId}`);
    return response.data;
  },

  concludeMatch: async (
    matchId: string,
    data: {
      homeScore: number;
      awayScore: number;
      winnerTeamId?: string;
      isDraw?: boolean;
      notes?: string;
    }
  ) => {
    const response = await apiClient.post(`/live/matches/${matchId}/conclude`, data);
    return response.data;
  },
};
