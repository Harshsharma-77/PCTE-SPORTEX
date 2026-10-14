export interface SportItem {
  id: string;
  name: string;
  slug: string;
  category: 'TEAM' | 'INDIVIDUAL' | 'DUAL' | 'ESPORTS';
  scoringType: 'GOALS' | 'RUNS' | 'POINTS' | 'SETS' | 'ROUNDS' | 'TIME' | 'CUSTOM';
  minPlayers: number;
  maxPlayers: number;
  benchSize: number;
  rulesDocUrl?: string | null;
  rulesJson?: any;
  iconUrl?: string | null;
  bannerUrl?: string | null;
  isActive: boolean;
  createdAt: string;
  _count?: {
    teams: number;
    tournaments: number;
    equipment: number;
  };
}
