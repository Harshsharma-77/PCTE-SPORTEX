export interface MatchEventItem {
  id: string;
  matchId: string;
  eventType: string;
  timestampSec: number;
  period?: string | null;
  teamId?: string | null;
  studentId?: string | null;
  scoreValue: number;
  commentary?: string | null;
  metadata?: any;
  createdAt: string;
  student?: {
    user: {
      name: string;
      avatarUrl?: string | null;
    };
  } | null;
}

export interface LiveMatchPlayer {
  membershipId: string;
  studentId: string;
  name: string;
  jerseyNumber?: number | null;
  position?: string | null;
  isCaptain: boolean;
  avatarUrl?: string | null;
}

export interface LiveMatchTeam {
  id: string;
  name: string;
  logoUrl?: string | null;
  jerseyColor?: string | null;
  members?: Array<{
    id: string;
    jerseyNumber?: number | null;
    position?: string | null;
    isCaptain: boolean;
    student: {
      id: string;
      user: {
        name: string;
        avatarUrl?: string | null;
      };
    };
  }>;
}

export interface LiveMatch {
  id: string;
  matchNumber?: number | null;
  roundName: string;
  bracketLevel: number;
  scheduledDate: string;
  actualStartTime?: string | null;
  actualEndTime?: string | null;
  status: 'SCHEDULED' | 'WARMUP' | 'LIVE' | 'PAUSED' | 'COMPLETED' | 'POSTPONED' | 'DISPUTED';
  currentPeriod?: string | null;
  matchTimerSec: number;
  isClockRunning: boolean;
  homeScore: number;
  awayScore: number;
  homeSubScore?: string | null;
  awaySubScore?: string | null;
  scoreBreakdown?: any;
  notes?: string | null;
  homeTeamId: string;
  awayTeamId: string;
  homeTeam: LiveMatchTeam;
  awayTeam: LiveMatchTeam;
  winnerTeam?: { id: string; name: string } | null;
  isDraw: boolean;
  tournament: {
    id: string;
    name: string;
    sport: {
      name: string;
      category: string;
      scoringType: string;
    };
  };
  venue?: {
    id: string;
    name: string;
    location: string;
  } | null;
  referee?: {
    id: string;
    user: {
      name: string;
    };
  } | null;
  events: MatchEventItem[];
}
