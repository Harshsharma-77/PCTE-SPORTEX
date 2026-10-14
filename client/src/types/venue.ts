export interface VenueItem {
  id: string;
  name: string;
  location: string;
  capacity?: number | null;
  supportedSports: string[];
  isIndoor: boolean;
  isActive: boolean;
  notes?: string | null;
  activeMatchesCount?: number;
  createdAt: string;
}

export interface VenueConflictResult {
  hasConflict: boolean;
  conflictCount: number;
  conflictingMatches: Array<{
    id: string;
    matchTitle: string;
    roundName: string;
    tournamentName: string;
    scheduledDate: string;
  }>;
}
