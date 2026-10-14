export interface TournamentItem {
  id: string;
  name: string;
  slug: string;
  academicYear: string;
  sportId: string;
  format: 'KNOCKOUT' | 'ROUND_ROBIN' | 'LEAGUE_CUM_KNOCKOUT' | 'DOUBLE_ELIMINATION' | 'SWISS';
  status: 'UPCOMING' | 'REGISTRATION_OPEN' | 'REGISTRATION_CLOSED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
  description?: string | null;
  bannerUrl?: string | null;
  startDate: string;
  endDate: string;
  maxTeams: number;
  createdAt: string;
  sport?: {
    id: string;
    name: string;
    category: string;
  };
  _count?: {
    registeredTeams: number;
    matches: number;
  };
  registeredTeams?: Array<{
    id: string;
    teamId: string;
    seed?: number | null;
    groupName?: string | null;
    team: {
      id: string;
      name: string;
      department?: string | null;
      coach?: { user: { name: string } } | null;
      _count?: { members: number };
    };
  }>;
  matches?: any[];
  pointsTable?: any[];
}
