export interface CertificateItem {
  id: string;
  certificateNo: string;
  verificationUuid: string;
  studentId: string;
  tournamentId: string;
  sportId: string;
  type: 'WINNER' | 'RUNNER_UP' | 'THIRD_PLACE' | 'PARTICIPATION' | 'BEST_PLAYER' | 'BEST_GOALKEEPER' | 'FAIR_PLAY' | 'CUSTOM';
  title: string;
  achievement: string;
  issueDate: string;
  issuedByAdmin: string;
  isRevoked: boolean;
  createdAt: string;
  student: {
    id?: string;
    rollNumber?: string;
    department?: string;
    batchYear?: number;
    user: {
      name: string;
      email?: string;
      avatarUrl?: string | null;
    };
  };
  tournament: {
    id?: string;
    name: string;
    academicYear?: string;
  };
  sport: {
    id?: string;
    name: string;
    category?: string;
  };
}

export interface VerificationResult {
  isValid: boolean;
  isRevoked: boolean;
  message: string;
  certificate: {
    id?: string;
    certificateNo: string;
    verificationUuid?: string;
    type?: string;
    title: string;
    achievement?: string;
    issueDate?: string;
    issuedByAdmin?: string;
    studentName?: string;
    revokedAt?: string;
    student?: {
      name: string;
      rollNumber: string;
      department: string;
      batchYear: number;
    };
    tournament?: {
      name: string;
      academicYear: string;
    };
    sport?: {
      name: string;
      category: string;
    };
  } | null;
  verifiedAt?: string;
}
