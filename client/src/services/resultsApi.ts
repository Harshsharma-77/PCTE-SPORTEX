import { apiClient } from './api';
import { CompletedMatch, TournamentStandingsData } from '../types/results';

export const resultsApi = {
  getCompletedResults: async (filters?: {
    tournamentId?: string;
    sportId?: string;
    teamId?: string;
    limit?: number;
  }): Promise<CompletedMatch[]> => {
    const response = await apiClient.get('/results', { params: filters });
    return response.data.data;
  },

  getTournamentStandings: async (
    tournamentId?: string,
    sportId?: string
  ): Promise<TournamentStandingsData> => {
    const params: any = {};
    if (tournamentId) params.tournamentId = tournamentId;
    if (sportId) params.sportId = sportId;

    const response = await apiClient.get('/results/standings', { params });
    return response.data.data;
  },

  getMatchDetails: async (matchId: string): Promise<CompletedMatch> => {
    const response = await apiClient.get(`/results/${matchId}`);
    return response.data.data;
  },

  syncMatchFinalization: async (matchId: string) => {
    const response = await apiClient.post(`/results/${matchId}/sync`);
    return response.data;
  },
};
