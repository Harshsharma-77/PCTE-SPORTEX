import { apiClient } from './api';
import { TournamentItem } from '../types/tournament';

export const tournamentApi = {
  getAllTournaments: async (filters?: { sportId?: string; status?: string }): Promise<TournamentItem[]> => {
    const response = await apiClient.get('/tournaments', { params: filters });
    return response.data.data;
  },

  getTournamentById: async (id: string): Promise<TournamentItem> => {
    const response = await apiClient.get(`/tournaments/${id}`);
    return response.data.data;
  },

  createTournament: async (data: {
    name: string;
    academicYear: string;
    sportId: string;
    format?: string;
    startDate: string;
    endDate: string;
    maxTeams?: number;
    description?: string;
  }): Promise<TournamentItem> => {
    const response = await apiClient.post('/tournaments', data);
    return response.data.data;
  },

  registerTeam: async (
    tournamentId: string,
    data: {
      teamId: string;
      seed?: number;
      groupName?: string;
    }
  ): Promise<any> => {
    const response = await apiClient.post(`/tournaments/${tournamentId}/register-team`, data);
    return response.data.data;
  },

  generateFixtures: async (tournamentId: string): Promise<{ message: string; matches: any[] }> => {
    const response = await apiClient.post(`/tournaments/${tournamentId}/generate-fixtures`);
    return response.data;
  },
};
