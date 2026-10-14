import { apiClient } from './api';
import { FixtureItem } from '../types/fixture';

export const fixtureApi = {
  getAllFixtures: async (filters?: {
    tournamentId?: string;
    status?: string;
    venueId?: string;
    refereeId?: string;
  }): Promise<FixtureItem[]> => {
    const response = await apiClient.get('/fixtures', { params: filters });
    return response.data.data;
  },

  createFixture: async (data: {
    tournamentId: string;
    homeTeamId: string;
    awayTeamId: string;
    roundName: string;
    scheduledDate: string;
    venueId?: string;
    refereeId?: string;
  }): Promise<FixtureItem> => {
    const response = await apiClient.post('/fixtures', data);
    return response.data.data;
  },

  updateFixture: async (id: string, data: any): Promise<FixtureItem> => {
    const response = await apiClient.patch(`/fixtures/${id}`, data);
    return response.data.data;
  },

  deleteFixture: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete(`/fixtures/${id}`);
    return response.data.data;
  },
};
