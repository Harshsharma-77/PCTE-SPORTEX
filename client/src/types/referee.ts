export interface RefereeProfile {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  licenseNumber?: string | null;
  officiatingLevel: string;
  certifiedSports: string[];
}

export interface RefereeMatch {
  id: string;
  matchNumber?: number | null;
  roundName: string;
  scheduledDate: string;
  actualStartTime?: string | null;
  actualEndTime?: string | null;
  status: 'SCHEDULED' | 'WARMUP' | 'LIVE' | 'PAUSED' | 'COMPLETED' | 'POSTPONED' | 'DISPUTED';
  currentPeriod?: string | null;
  matchTimerSec: number;
  isClockRunning: boolean;
  homeScore: number;
  awayScore: number;
  homeTeam: { id: string; name: string; logoUrl?: string; jerseyColor?: string };
  awayTeam: { id: string; name: string; logoUrl?: string; jerseyColor?: string };
  tournament: { id: string; name: string; sport: { name: string; scoringType: string } };
  venue?: { id: string; name: string; location: string } | null;
  winnerTeam?: { id: string; name: string } | null;
  events?: Array<{
    id: string;
    eventType: string;
    scoreValue: number;
    period?: string | null;
    timestampSec: number;
    commentary?: string | null;
    student?: { user: { name: string } } | null;
  }>;
}

export interface RefereeDashboardData {
  referee: RefereeProfile;
  metrics: {
    totalAssigned: number;
    liveMatchesCount: number;
    upcomingCount: number;
    completedCount: number;
  };
  liveMatches: RefereeMatch[];
  upcomingMatches: RefereeMatch[];
  completedMatches: RefereeMatch[];
}
