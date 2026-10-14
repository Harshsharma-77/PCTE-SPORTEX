export type UserRole = 'SUPER_ADMIN' | 'SPORTS_ADMIN' | 'COACH' | 'STUDENT' | 'REFEREE' | 'VIEWER';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  phone?: string;
  isActive: boolean;
  isVerified: boolean;
  studentProfile?: {
    rollNumber: string;
    department: string;
    semester: number;
    batchYear: number;
    gender: string;
  };
  coachProfile?: {
    specialization: string;
    qualification?: string;
    experienceYears: number;
  };
  refereeProfile?: {
    licenseNumber?: string;
    officiatingLevel: string;
    certifiedSports: string[];
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
  error?: string;
  details?: any;
}

export interface HealthStatus {
  service: string;
  status: string;
  version: string;
  environment: string;
  timestamp: string;
  uptimeSeconds: number;
  database: {
    provider: string;
    status: 'CONNECTED' | 'DISCONNECTED' | 'ERROR';
    latencyMs: number;
  };
  performance: {
    responseTimeMs: number;
    memoryUsageMB: number;
  };
}
