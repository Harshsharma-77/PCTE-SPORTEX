import { apiClient } from './api';
import { EquipmentItem, EquipmentIssueItem } from '../types/inventory';

export const inventoryApi = {
  getAllEquipment: async (filters?: { sportId?: string; lowStock?: boolean }): Promise<EquipmentItem[]> => {
    const response = await apiClient.get('/inventory', { params: filters });
    return response.data.data;
  },

  createEquipment: async (data: {
    name: string;
    sku: string;
    sportId: string;
    totalQuantity: number;
    condition?: string;
    storageLocation?: string;
    costPerItem?: number;
    notes?: string;
  }): Promise<EquipmentItem> => {
    const response = await apiClient.post('/inventory', data);
    return response.data.data;
  },

  issueEquipment: async (data: {
    equipmentId: string;
    issuedToUserId: string;
    quantity: number;
    dueDate: string;
    remarks?: string;
  }): Promise<EquipmentIssueItem> => {
    const response = await apiClient.post('/inventory/issue', data);
    return response.data.data;
  },

  returnEquipment: async (
    issueId: string,
    data: {
      returnCondition?: string;
      fineAmount?: number;
      remarks?: string;
    }
  ): Promise<EquipmentIssueItem> => {
    const response = await apiClient.post(`/inventory/issues/${issueId}/return`, data);
    return response.data.data;
  },

  getEquipmentIssues: async (filters?: { status?: string; userId?: string }): Promise<EquipmentIssueItem[]> => {
    const response = await apiClient.get('/inventory/issues', { params: filters });
    return response.data.data;
  },
};
