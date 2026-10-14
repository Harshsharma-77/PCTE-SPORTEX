export type UserRole = 'SUPER_ADMIN' | 'SPORTS_ADMIN' | 'COACH' | 'STUDENT' | 'REFEREE' | 'VIEWER';

export interface StudentProfile {
  id: string;
  rollNumber: string;
  department: string;
  batchYear: number;
  semester: number;
  gender: string;
  bloodGroup?: string;
  emergencyContact?: string;
  isEligible: boolean;
}

export interface CoachProfile {
  id: string;
  specialization: string;
  qualification?: string;
  experienceYears: number;
  bio?: string;
}

export interface RefereeProfile {
  id: string;
  licenseNumber?: string;
  officiatingLevel: string;
  certifiedSports: string[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  phone?: string;
  isVerified: boolean;
  createdAt?: string;
  student?: StudentProfile;
  coach?: CoachProfile;
  referee?: RefereeProfile;
  permissions?: string[];
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken?: string;
}

export interface LoginDTO {
  identifier: string; // Email or Roll Number
  password: string;
}

export interface RegisterStudentDTO {
  name: string;
  email: string;
  password: string;
  rollNumber: string;
  department: string;
  batchYear: number;
  semester: number;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  phone?: string;
  bloodGroup?: string;
  emergencyContact?: string;
}
