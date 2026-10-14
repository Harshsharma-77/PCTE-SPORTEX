export interface TopScorer {
  id: string;
  studentId: string;
  name: string;
  avatarUrl?: string | null;
  department: string;
  teamName: string;
  sportName: string;
  scoringType: string;
  matchesPlayed: number;
  totalScore: number;
  goals: number;
  runs: number;
  points: number;
  assists: number;
  scoringAverage: string;
}

export interface MvpEntry {
  id: string;
  name: string;
  department: string;
  teamName: string;
  sportName: string;
  mvpAwards: number;
  totalContribution: number;
  matchesPlayed: number;
}

export interface AssistEntry {
  id: string;
  name: string;
  department: string;
  teamName: string;
  sportName: string;
  assists: number;
  matchesPlayed: number;
}

export interface TeamLeaderboardEntry {
  rank: number;
  teamId: string;
  teamName: string;
  department?: string | null;
  sportName: string;
  played: number;
  won: number;
  lost: number;
  drawn: number;
  winRate: number;
  totalPoints: number;
  goalDifference: number;
}

export interface CampusAnalyticsData {
  departmentDistribution: Array<{
    department: string;
    athletesCount: number;
  }>;
  sportParticipation: Array<{
    sport: string;
    category: string;
    teamsCount: number;
    tournamentsCount: number;
  }>;
  attendanceCompliance: Array<{
    status: string;
    count: number;
  }>;
}

export interface LeaderboardsData {
  topScorers: TopScorer[];
  mvpPodium: MvpEntry[];
  topAssists: AssistEntry[];
  teamLeaderboard: TeamLeaderboardEntry[];
}
