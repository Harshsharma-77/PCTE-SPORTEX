export interface FixtureItem {
  id: string;
  matchNumber?: number | null;
  tournamentId: string;
  roundName: string;
  bracketLevel: number;
  homeTeamId: string;
  awayTeamId: string;
  venueId?: string | null;
  refereeId?: string | null;
  scheduledDate: string;
  actualStartTime?: string | null;
  actualEndTime?: string | null;
  status: 'SCHEDULED' | 'WARMUP' | 'LIVE' | 'PAUSED' | 'COMPLETED' | 'POSTPONED' | 'CANCELLED';
  homeScore: number;
  awayScore: number;
  homeSubScore?: string | null;
  awaySubScore?: string | null;
  winnerTeamId?: string | null;
  isDraw: boolean;
  tournament?: {
    id: string;
    name: string;
    sport?: { name: string };
  };
  homeTeam?: {
    id: string;
    name: string;
    jerseyColor?: string | null;
    department?: string | null;
  };
  awayTeam?: {
    id: string;
    name: string;
    jerseyColor?: string | null;
    department?: string | null;
  };
  venue?: {
    id: string;
    name: string;
    location: string;
  } | null;
  referee?: {
    id: string;
    user?: {
      id: string;
      name: string;
      email: string;
    };
  } | null;
}
