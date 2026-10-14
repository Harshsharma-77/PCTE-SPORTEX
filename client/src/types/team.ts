export interface TeamMemberItem {
  id: string;
  studentId: string;
  jerseyNumber?: number | null;
  position?: string | null;
  isCaptain: boolean;
  isViceCaptain: boolean;
  joinedAt: string;
  isActive: boolean;
  student: {
    id: string;
    rollNumber: string;
    department: string;
    user: {
      id: string;
      name: string;
      email: string;
      avatarUrl?: string | null;
    };
  };
}

export interface TeamItem {
  id: string;
  name: string;
  slug: string;
  sportId: string;
  department?: string | null;
  coachId?: string | null;
  jerseyColor?: string | null;
  logoUrl?: string | null;
  createdAt: string;
  sport?: {
    id: string;
    name: string;
    category: string;
  };
  coach?: {
    id: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  } | null;
  _count?: {
    members: number;
    homeMatches: number;
    awayMatches: number;
  };
  members?: TeamMemberItem[];
}
