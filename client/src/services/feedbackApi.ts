import { apiClient } from './api';
import { FeedbackTicket } from '../types/feedback';

export const feedbackApi = {
  submitFeedback: async (data: {
    category: string;
    priority?: string;
    subject: string;
    description: string;
    attachmentUrl?: string;
  }): Promise<FeedbackTicket> => {
    const response = await apiClient.post('/feedback', data);
    return response.data.data;
  },

  getUserFeedback: async (): Promise<FeedbackTicket[]> => {
    const response = await apiClient.get('/feedback/my-tickets');
    return response.data.data;
  },

  getAllFeedback: async (filters?: {
    status?: string;
    category?: string;
    priority?: string;
  }): Promise<FeedbackTicket[]> => {
    const response = await apiClient.get('/feedback', { params: filters });
    return response.data.data;
  },

  respondToFeedback: async (
    id: string,
    data: {
      status: string;
      resolutionNotes: string;
    }
  ): Promise<FeedbackTicket> => {
    const response = await apiClient.patch(`/feedback/${id}/respond`, data);
    return response.data.data;
  },
};
