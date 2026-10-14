export interface DashboardMetrics {
  totalAthletes: number;
  totalTeams: number;
  totalSports: number;
  activeTournaments: number;
  upcomingMatches: number;
  matchesToday: number;
}

export interface PendingActions {
  pendingFeedback: number;
  overdueEquipment: number;
  unassignedMatches: number;
  ineligibleAthletes: number;
  totalPending: number;
}

export interface MatchSummaryItem {
  id: string;
  roundName: string;
  scheduledDate: string;
  status: string;
  homeScore: number;
  awayScore: number;
  homeTeam: { id: string; name: string; logoUrl?: string; jerseyColor?: string };
  awayTeam: { id: string; name: string; logoUrl?: string; jerseyColor?: string };
  tournament: { id: string; name: string; sport: { name: string } };
  venue?: { id: string; name: string; location: string } | null;
  referee?: { user: { name: string } } | null;
  winnerTeam?: { id: string; name: string } | null;
}

export interface RecentRegistrationItem {
  id: string;
  name: string;
  email: string;
  rollNumber: string;
  department: string;
  batchYear: number;
  semester: number;
  gender: string;
  isEligible: boolean;
  primarySport: string;
  registeredAt: string;
}

export interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  targetAudience: string;
  isPinned: boolean;
  expiresAt?: string | null;
  createdAt: string;
  author: { name: string };
}

export interface AdminSummaryData {
  metrics: DashboardMetrics;
  pendingActions: PendingActions;
  matchesToday: MatchSummaryItem[];
  upcomingMatches: MatchSummaryItem[];
  recentResults: MatchSummaryItem[];
  recentRegistrations: RecentRegistrationItem[];
  announcements: AnnouncementItem[];
}

export interface AdminChartsData {
  athleteDistribution: Array<{ department: string; count: number }>;
  sportParticipation: Array<{ id: string; sport: string; category: string; teamsCount: number; tournamentsCount: number }>;
  tournamentFormats: Array<{ format: string; status: string; count: number }>;
  teamLeaderboard: Array<{
    id: string;
    teamName: string;
    department: string;
    sport: string;
    tournament: string;
    played: number;
    won: number;
    lost: number;
    drawn: number;
    points: number;
    winRate: number;
  }>;
  attendanceBreakdown: Array<{ status: string; count: number }>;
}

export interface QuickLookupsData {
  sports: Array<{ id: string; name: string; category: string }>;
  teams: Array<{ id: string; name: string; sportId: string; department?: string }>;
  coaches: Array<{ id: string; name: string; specialization: string }>;
  venues: Array<{ id: string; name: string; location: string }>;
  tournaments: Array<{ id: string; name: string; sportId: string }>;
  students: Array<{ id: string; name: string; rollNumber: string; department: string }>;
}
