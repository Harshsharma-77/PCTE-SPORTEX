export interface StudentProfile {
  studentId: string;
  userId: string;
  name: string;
  email: string;
  phone?: string | null;
  avatarUrl?: string | null;
  rollNumber: string;
  department: string;
  batchYear: number;
  semester: number;
  gender: string;
  bloodGroup: string;
  emergencyContact: string;
  isEligible: boolean;
  createdAt: string;
}

export interface StudentMetrics {
  activeTeamsCount: number;
  totalMatchesPlayed: number;
  totalGoals: number;
  attendanceRate: number;
  certificatesCount: number;
}

export interface StudentTeam {
  id: string;
  teamId: string;
  teamName: string;
  sportName: string;
  sportCategory: string;
  jerseyNumber?: number | null;
  position: string;
  isCaptain: boolean;
  isViceCaptain: boolean;
  jerseyColor?: string | null;
  coach?: {
    name: string;
    email: string;
    phone?: string | null;
  } | null;
}

export interface StudentUpcomingMatch {
  id: string;
  roundName: string;
  scheduledDate: string;
  homeTeam: { id: string; name: string; logoUrl?: string; jerseyColor?: string };
  awayTeam: { id: string; name: string; logoUrl?: string; jerseyColor?: string };
  tournament: { id: string; name: string; sport: { name: string } };
  venue?: { id: string; name: string; location: string } | null;
}

export interface StudentMatchResult {
  id: string;
  roundName: string;
  scheduledDate: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  winnerTeam?: string | null;
  outcome: 'WON' | 'LOST' | 'DRAW';
  tournamentName: string;
  sportName: string;
  venueName: string;
  myEvents?: Array<{
    eventType: string;
    scoreValue: number;
    period?: string | null;
    commentary?: string | null;
  }>;
}

export interface StudentAttendanceRecord {
  id: string;
  sessionDate: string;
  sportName: string;
  coachName: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  sessionType: string;
  remarks?: string | null;
}

export interface StudentStatistic {
  id: string;
  sportId: string;
  sport: { name: string; category: string };
  matchesPlayed: number;
  goalsScored: number;
  runsScored: number;
  wicketsTaken: number;
  pointsScored: number;
  assists: number;
  cleanSheets: number;
  yellowCards: number;
  redCards: number;
  mvpAwards: number;
  minutesPlayed: number;
}

export interface StudentCertificate {
  id: string;
  certificateNo: string;
  verificationUuid: string;
  title: string;
  achievement: string;
  type: string;
  sportName: string;
  tournamentName: string;
  issueDate: string;
  issuedByAdmin: string;
}

export interface StudentNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  actionUrl?: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface StudentAnnouncement {
  id: string;
  title: string;
  content: string;
  priority: string;
  targetAudience: string;
  isPinned: boolean;
  createdAt: string;
  author: { name: string };
}

export interface StudentDashboardData {
  profile: StudentProfile;
  metrics: StudentMetrics;
  teams: StudentTeam[];
  upcomingMatches: StudentUpcomingMatch[];
  recentResults: StudentMatchResult[];
  attendance: {
    totalSessions: number;
    presentSessions: number;
    attendanceRate: number;
    records: StudentAttendanceRecord[];
  };
  statistics: StudentStatistic[];
  certificates: StudentCertificate[];
  notifications: StudentNotification[];
  announcements: StudentAnnouncement[];
}
