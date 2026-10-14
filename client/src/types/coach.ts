export interface CoachProfile {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  specialization: string;
  qualification?: string | null;
  experienceYears: number;
  bio?: string | null;
}

export interface CoachPlayer {
  membershipId: string;
  studentId: string;
  name: string;
  rollNumber: string;
  department: string;
  semester: number;
  jerseyNumber?: number | null;
  position?: string | null;
  isCaptain: boolean;
  isViceCaptain: boolean;
  isEligible: boolean;
  phone?: string | null;
  emergencyContact?: string | null;
  goals: number;
}

export interface CoachTeam {
  id: string;
  name: string;
  sportName: string;
  sportCategory: string;
  department?: string | null;
  jerseyColor?: string | null;
  playersCount: number;
  players: CoachPlayer[];
}

export interface CoachDashboardData {
  coach: CoachProfile;
  metrics: {
    assignedTeamsCount: number;
    totalPlayers: number;
    upcomingMatchesCount: number;
    totalSessions: number;
    attendanceRate: number;
    wins: number;
    losses: number;
    draws: number;
  };
  assignedTeams: CoachTeam[];
  upcomingMatches: Array<{
    id: string;
    roundName: string;
    scheduledDate: string;
    homeTeam: { id: string; name: string; logoUrl?: string };
    awayTeam: { id: string; name: string; logoUrl?: string };
    tournament: { id: string; name: string; sport: { name: string } };
    venue?: { id: string; name: string; location: string } | null;
  }>;
  recentResults: Array<{
    id: string;
    homeScore: number;
    awayScore: number;
    isDraw: boolean;
    homeTeam: { id: string; name: string };
    awayTeam: { id: string; name: string };
    winnerTeam?: { id: string; name: string } | null;
    tournament: { id: string; name: string; sport: { name: string } };
  }>;
  attendanceHistory: Array<{
    id: string;
    sessionDate: string;
    status: string;
    sessionType: string;
    remarks?: string | null;
    sport: { name: string };
    student: { user: { name: string } };
  }>;
}
