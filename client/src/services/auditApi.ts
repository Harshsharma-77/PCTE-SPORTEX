import { apiClient } from './api';
import { AuditLogItem } from '../types/audit';

export const auditApi = {
  getAuditLogs: async (filters?: {
    userId?: string;
    action?: string;
    entity?: string;
    limit?: number;
  }): Promise<AuditLogItem[]> => {
    const response = await apiClient.get('/audit', { params: filters });
    return response.data.data;
  },
};
