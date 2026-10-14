import { apiClient } from './api';
import { OmnisearchResults } from '../types/search';

export const searchApi = {
  omnisearch: async (query: string, limit?: number): Promise<OmnisearchResults> => {
    const response = await apiClient.get('/search', { params: { q: query, limit } });
    return response.data.data;
  },
};
