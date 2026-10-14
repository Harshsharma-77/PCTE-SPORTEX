import { apiClient } from './api';
import { VenueItem, VenueConflictResult } from '../types/venue';

export const venueApi = {
  getAllVenues: async (): Promise<VenueItem[]> => {
    const response = await apiClient.get('/venues');
    return response.data.data;
  },

  createVenue: async (data: {
    name: string;
    location: string;
    capacity?: number;
    supportedSports?: string[];
    isIndoor?: boolean;
    notes?: string;
  }): Promise<VenueItem> => {
    const response = await apiClient.post('/venues', data);
    return response.data.data;
  },

  checkConflict: async (
    venueId: string,
    date: string,
    duration?: number,
    excludeMatchId?: string
  ): Promise<VenueConflictResult> => {
    const params: any = { date };
    if (duration) params.duration = duration;
    if (excludeMatchId) params.excludeMatchId = excludeMatchId;

    const response = await apiClient.get(`/venues/${venueId}/conflict`, { params });
    return response.data.data;
  },

  getVenueSchedule: async (venueId: string): Promise<any> => {
    const response = await apiClient.get(`/venues/${venueId}/schedule`);
    return response.data.data;
  },
};
