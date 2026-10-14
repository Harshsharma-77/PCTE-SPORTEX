export interface CompletedMatch {
  id: string;
  matchNumber?: number | null;
  roundName: string;
  scheduledDate: string;
  actualEndTime?: string | null;
  homeScore: number;
  awayScore: number;
  homeSubScore?: string | null;
  awaySubScore?: string | null;
  isDraw: boolean;
  notes?: string | null;
  homeTeam: {
    id: string;
    name: string;
    logoUrl?: string | null;
    jerseyColor?: string | null;
    department?: string | null;
  };
  awayTeam: {
    id: string;
    name: string;
    logoUrl?: string | null;
    jerseyColor?: string | null;
    department?: string | null;
  };
  winnerTeam?: {
    id: string;
    name: string;
  } | null;
  tournament: {
    id: string;
    name: string;
    sport: {
      id: string;
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
  events?: Array<{
    id: string;
    eventType: string;
    scoreValue: number;
    period?: string | null;
    timestampSec: number;
    commentary?: string | null;
    student?: {
      id: string;
      user: {
        name: string;
      };
    } | null;
  }>;
}

export interface StandingsEntry {
  id: string;
  rank: number;
  teamId: string;
  teamName: string;
  department?: string | null;
  jerseyColor?: string | null;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  pointsFor: number;
  pointsAgainst: number;
  goalDifference: number;
  totalPoints: number;
  form: string[];
}

export interface TournamentStandingsData {
  tournament: {
    id: string;
    name: string;
    sportName: string;
    scoringType: string;
    academicYear: string;
    format: string;
  } | null;
  standings: StandingsEntry[];
}
