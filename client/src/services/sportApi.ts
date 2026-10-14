import { apiClient } from './api';
import { SportItem } from '../types/sport';

export const sportApi = {
  getAllSports: async (): Promise<SportItem[]> => {
    const response = await apiClient.get('/sports');
    return response.data.data;
  },

  getSportById: async (id: string): Promise<SportItem> => {
    const response = await apiClient.get(`/sports/${id}`);
    return response.data.data;
  },

  createSport: async (data: {
    name: string;
    category?: string;
    scoringType?: string;
    minPlayers?: number;
    maxPlayers?: number;
    benchSize?: number;
  }): Promise<SportItem> => {
    const response = await apiClient.post('/sports', data);
    return response.data.data;
  },

  updateSport: async (id: string, data: any): Promise<SportItem> => {
    const response = await apiClient.patch(`/sports/${id}`, data);
    return response.data.data;
  },

  deleteSport: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete(`/sports/${id}`);
    return response.data.data;
  },
};
