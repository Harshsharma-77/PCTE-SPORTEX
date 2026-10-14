import { apiClient } from './api';
import { CertificateItem, VerificationResult } from '../types/certificate';

export const certificateApi = {
  generateCertificate: async (data: {
    studentId: string;
    tournamentId: string;
    sportId: string;
    type: string;
    title: string;
    achievement: string;
    issuedByAdmin?: string;
  }): Promise<CertificateItem> => {
    const response = await apiClient.post('/certificates', data);
    return response.data.data;
  },

  verifyCertificate: async (identifier: string): Promise<VerificationResult> => {
    const response = await apiClient.get(`/certificates/verify/${identifier}`);
    return response.data.data;
  },

  getAllCertificates: async (filters?: {
    tournamentId?: string;
    sportId?: string;
    studentId?: string;
    type?: string;
  }): Promise<CertificateItem[]> => {
    const response = await apiClient.get('/certificates', { params: filters });
    return response.data.data;
  },

  revokeCertificate: async (certificateId: string): Promise<CertificateItem> => {
    const response = await apiClient.patch(`/certificates/${certificateId}/revoke`);
    return response.data.data;
  },
};
