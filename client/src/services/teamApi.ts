import { apiClient } from './api';
import { TeamItem, TeamMemberItem } from '../types/team';

export const teamApi = {
  getAllTeams: async (filters?: { sportId?: string; department?: string }): Promise<TeamItem[]> => {
    const response = await apiClient.get('/teams', { params: filters });
    return response.data.data;
  },

  getTeamById: async (id: string): Promise<TeamItem> => {
    const response = await apiClient.get(`/teams/${id}`);
    return response.data.data;
  },

  createTeam: async (data: {
    name: string;
    sportId: string;
    department?: string;
    coachId?: string;
    jerseyColor?: string;
    logoUrl?: string;
  }): Promise<TeamItem> => {
    const response = await apiClient.post('/teams', data);
    return response.data.data;
  },

  updateTeam: async (id: string, data: any): Promise<TeamItem> => {
    const response = await apiClient.patch(`/teams/${id}`, data);
    return response.data.data;
  },

  addMember: async (
    teamId: string,
    data: {
      studentId: string;
      jerseyNumber?: number;
      position?: string;
      isCaptain?: boolean;
    }
  ): Promise<TeamMemberItem> => {
    const response = await apiClient.post(`/teams/${teamId}/members`, data);
    return response.data.data;
  },

  removeMember: async (teamId: string, memberId: string): Promise<{ message: string }> => {
    const response = await apiClient.delete(`/teams/${teamId}/members/${memberId}`);
    return response.data.data;
  },
};
