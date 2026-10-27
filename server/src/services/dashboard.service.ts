import { prisma } from '../config/database';
import { AppError } from '../middleware/error.middleware';
import { hashPassword } from '../utils/password';
import {
  SportCategory,
  ScoringType,
  TournamentFormat,
  TournamentStatus,
  Priority,
  UserRoleEnum,
  Gender,
} from '@prisma/client';

export class DashboardService {
  /**
   * Get main Admin Dashboard Summary statistics and lists
   */
  static async getAdminSummary() {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    // Parallel aggregate count queries
    const [
      totalAthletes,
      totalTeams,
      totalSports,
      activeTournaments,
      upcomingMatchesCount,
      matchesTodayCount,
      pendingFeedbackCount,
      overdueEquipmentCount,
      unassignedMatchesCount,
      ineligibleAthletesCount,
    ] = await Promise.all([
      prisma.student.count(),
      prisma.team.count({ where: { isActive: true } }),
      prisma.sport.count({ where: { isActive: true } }),
      prisma.tournament.count({
        where: {
          status: { in: [TournamentStatus.ONGOING, TournamentStatus.REGISTRATION_OPEN, TournamentStatus.UPCOMING] },
        },
      }),
      prisma.match.count({ where: { status: 'SCHEDULED' } }),
      prisma.match.count({
        where: {
          scheduledDate: { gte: startOfToday, lte: endOfToday },
        },
      }),
      prisma.feedback.count({ where: { status: 'PENDING' } }),
      prisma.equipmentIssue.count({ where: { status: 'OVERDUE' } }),
      prisma.match.count({ where: { status: 'SCHEDULED', refereeId: null } }),
      prisma.student.count({ where: { isEligible: false } }),
    ]);

    // Matches Today List
    const matchesToday = await prisma.match.findMany({
      where: {
        scheduledDate: { gte: startOfToday, lte: endOfToday },
      },
      include: {
        homeTeam: { select: { id: true, name: true, logoUrl: true, jerseyColor: true } },
        awayTeam: { select: { id: true, name: true, logoUrl: true, jerseyColor: true } },
        tournament: { select: { id: true, name: true, sport: { select: { name: true } } } },
        venue: { select: { id: true, name: true, location: true } },
        referee: { select: { user: { select: { name: true } } } },
      },
      orderBy: { scheduledDate: 'asc' },
    });

    // Upcoming Matches (Next 5)
    const upcomingMatches = await prisma.match.findMany({
      where: {
        status: { in: ['SCHEDULED', 'WARMUP'] },
        scheduledDate: { gte: now },
      },
      take: 5,
      include: {
        homeTeam: { select: { id: true, name: true, logoUrl: true } },
        awayTeam: { select: { id: true, name: true, logoUrl: true } },
        tournament: { select: { id: true, name: true, sport: { select: { name: true } } } },
        venue: { select: { id: true, name: true } },
      },
      orderBy: { scheduledDate: 'asc' },
    });

    // Recent Completed Results (Last 5)
    const recentResults = await prisma.match.findMany({
      where: { status: 'COMPLETED' },
      take: 5,
      include: {
        homeTeam: { select: { id: true, name: true } },
        awayTeam: { select: { id: true, name: true } },
        winnerTeam: { select: { id: true, name: true } },
        tournament: { select: { id: true, name: true, sport: { select: { name: true } } } },
        venue: { select: { id: true, name: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Recent Student Athlete Registrations (Last 6)
    const recentRegistrations = await prisma.student.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true, avatarUrl: true, createdAt: true } },
        teamMemberships: {
          take: 1,
          include: {
            team: { select: { name: true, sport: { select: { name: true } } } },
          },
        },
      },
    });

    // Active Announcements (Top 5)
    const announcements = await prisma.announcement.findMany({
      take: 5,
      where: {
        OR: [{ expiresAt: null }, { expiresAt: { gte: now } }],
      },
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
      include: {
        author: { select: { name: true } },
      },
    });

    return {
      metrics: {
        totalAthletes,
        totalTeams,
        totalSports,
        activeTournaments,
        upcomingMatches: upcomingMatchesCount,
        matchesToday: matchesTodayCount,
      },
      pendingActions: {
        pendingFeedback: pendingFeedbackCount,
        overdueEquipment: overdueEquipmentCount,
        unassignedMatches: unassignedMatchesCount,
        ineligibleAthletes: ineligibleAthletesCount,
        totalPending:
          pendingFeedbackCount + overdueEquipmentCount + unassignedMatchesCount + ineligibleAthletesCount,
      },
      matchesToday,
      upcomingMatches,
      recentResults,
      recentRegistrations: recentRegistrations.map((s) => ({
        id: s.id,
        name: s.user.name,
        email: s.user.email,
        rollNumber: s.rollNumber,
        department: s.department,
        batchYear: s.batchYear,
        semester: s.semester,
        gender: s.gender,
        isEligible: s.isEligible,
        primarySport: s.teamMemberships[0]?.team.sport.name || 'Unassigned',
        registeredAt: s.createdAt,
      })),
      announcements,
    };
  }

  /**
   * Get Chart Analytics data for Admin Dashboard
   */
  static async getAdminCharts() {
    // 1. Athlete Distribution by Department
    const departmentStats = await prisma.student.groupBy({
      by: ['department'],
      _count: { id: true },
    });

    // 2. Sport Participation (Teams count & Sports)
    const sportsWithCounts = await prisma.sport.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        category: true,
        _count: {
          select: {
            teams: true,
            tournaments: true,
          },
        },
      },
    });

    // 3. Tournament Activity by Format
    const tournamentFormats = await prisma.tournament.groupBy({
      by: ['format', 'status'],
      _count: { id: true },
    });

    // 4. Team Performance Leaderboard (Top 6 teams by totalPoints)
    const topTeams = await prisma.pointsTableEntry.findMany({
      take: 6,
      orderBy: [{ totalPoints: 'desc' }, { goalDifference: 'desc' }],
      include: {
        team: { select: { id: true, name: true, department: true, sport: { select: { name: true } } } },
        tournament: { select: { name: true } },
      },
    });

    // 5. Overall Attendance Distribution
    const attendanceStats = await prisma.attendance.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    return {
      athleteDistribution: departmentStats.map((d) => ({
        department: d.department,
        count: d._count.id,
      })),
      sportParticipation: sportsWithCounts.map((s) => ({
        id: s.id,
        sport: s.name,
        category: s.category,
        teamsCount: s._count.teams,
        tournamentsCount: s._count.tournaments,
      })),
      tournamentFormats: tournamentFormats.map((t) => ({
        format: t.format,
        status: t.status,
        count: t._count.id,
      })),
      teamLeaderboard: topTeams.map((entry) => ({
        id: entry.id,
        teamName: entry.team.name,
        department: entry.team.department || 'Varsity',
        sport: entry.team.sport.name,
        tournament: entry.tournament.name,
        played: entry.played,
        won: entry.won,
        lost: entry.lost,
        drawn: entry.drawn,
        points: entry.totalPoints,
        winRate: entry.played > 0 ? Math.round((entry.won / entry.played) * 100) : 0,
      })),
      attendanceBreakdown: attendanceStats.map((a) => ({
        status: a.status,
        count: a._count.id,
      })),
    };
  }

  /**
   * Get Quick Lookups for Populating Admin Modals
   */
  static async getQuickLookups() {
    const [sports, teams, coaches, venues, tournaments, students] = await Promise.all([
      prisma.sport.findMany({
        where: { isActive: true },
        select: { id: true, name: true, category: true },
        orderBy: { name: 'asc' },
      }),
      prisma.team.findMany({
        where: { isActive: true },
        select: { id: true, name: true, sportId: true, department: true },
        orderBy: { name: 'asc' },
      }),
      prisma.coach.findMany({
        select: { id: true, specialization: true, user: { select: { name: true } } },
        orderBy: { user: { name: 'asc' } },
      }),
      prisma.venue.findMany({
        where: { isActive: true },
        select: { id: true, name: true, location: true },
        orderBy: { name: 'asc' },
      }),
      prisma.tournament.findMany({
        where: { status: { in: ['ONGOING', 'REGISTRATION_OPEN', 'UPCOMING'] } },
        select: { id: true, name: true, sportId: true },
        orderBy: { startDate: 'asc' },
      }),
      prisma.student.findMany({
        take: 50,
        select: { id: true, rollNumber: true, department: true, user: { select: { name: true } } },
        orderBy: { rollNumber: 'asc' },
      }),
    ]);

    return {
      sports,
      teams,
      coaches: coaches.map((c) => ({ id: c.id, name: c.user.name, specialization: c.specialization })),
      venues,
      tournaments,
      students: students.map((s) => ({
        id: s.id,
        name: s.user.name,
        rollNumber: s.rollNumber,
        department: s.department,
      })),
    };
  }

  /**
   * Quick Action 1: Add Sport
   */
  static async quickAddSport(data: {
    name: string;
    category?: SportCategory;
    scoringType?: ScoringType;
    minPlayers?: number;
    maxPlayers?: number;
    benchSize?: number;
  }) {
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const existing = await prisma.sport.findUnique({ where: { name: data.name } });
    if (existing) throw new AppError('Sport with this name already exists.', 409);

    const sport = await prisma.sport.create({
      data: {
        name: data.name,
        slug,
        category: data.category || SportCategory.TEAM,
        scoringType: data.scoringType || ScoringType.POINTS,
        minPlayers: data.minPlayers || 1,
        maxPlayers: data.maxPlayers || 11,
        benchSize: data.benchSize || 5,
        isActive: true,
      },
    });

    return sport;
  }

  /**
   * Quick Action 2: Add Team
   */
  static async quickAddTeam(data: {
    name: string;
    sportId: string;
    department?: string;
    coachId?: string;
    jerseyColor?: string;
  }) {
    const slug = `${data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`;

    const team = await prisma.team.create({
      data: {
        name: data.name,
        slug,
        sportId: data.sportId,
        department: data.department,
        coachId: data.coachId || null,
        jerseyColor: data.jerseyColor || '#0284c7',
        isActive: true,
      },
      include: {
        sport: { select: { name: true } },
      },
    });

    return team;
  }

  /**
   * Quick Action 3: Add Player to Team
   */
  static async quickAddPlayer(data: {
    studentId: string;
    teamId: string;
    jerseyNumber?: number;
    position?: string;
    isCaptain?: boolean;
  }) {
    const existing = await prisma.teamMember.findUnique({
      where: {
        teamId_studentId: {
          teamId: data.teamId,
          studentId: data.studentId,
        },
      },
    });

    if (existing) {
      throw new AppError('Student is already enrolled in this squad roster.', 409);
    }

    const member = await prisma.teamMember.create({
      data: {
        teamId: data.teamId,
        studentId: data.studentId,
        jerseyNumber: data.jerseyNumber ? Number(data.jerseyNumber) : null,
        position: data.position,
        isCaptain: data.isCaptain || false,
      },
      include: {
        student: { include: { user: { select: { name: true } } } },
        team: { select: { name: true } },
      },
    });

    return member;
  }

  /**
   * Quick Action: Register New Student Athlete directly from Admin Console
   */
  static async quickRegisterAthlete(data: {
    name: string;
    email: string;
    rollNumber: string;
    department: string;
    batchYear: number;
    semester: number;
    gender?: Gender;
    phone?: string;
    bloodGroup?: string;
    teamId?: string;
    jerseyNumber?: number;
    position?: string;
  }) {
    const existingEmail = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase().trim() },
    });
    if (existingEmail) {
      throw new AppError('An account with this email address already exists.', 409);
    }

    const existingRoll = await prisma.student.findUnique({
      where: { rollNumber: data.rollNumber.trim().toUpperCase() },
    });
    if (existingRoll) {
      throw new AppError('A student with this roll number is already registered.', 409);
    }

    const studentRole = await prisma.role.findUnique({
      where: { name: UserRoleEnum.STUDENT },
    });

    const passwordHash = await hashPassword('Student@2026');

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email.toLowerCase().trim(),
          passwordHash,
          name: data.name.trim(),
          roleId: studentRole?.id,
          roleEnum: UserRoleEnum.STUDENT,
          phone: data.phone,
          isVerified: true,
          student: {
            create: {
              rollNumber: data.rollNumber.trim().toUpperCase(),
              department: data.department.trim().toUpperCase(),
              batchYear: Number(data.batchYear),
              semester: Number(data.semester),
              gender: data.gender || Gender.MALE,
              bloodGroup: data.bloodGroup,
            },
          },
        },
        include: {
          student: true,
        },
      });

      if (data.teamId && user.student) {
        await tx.teamMember.create({
          data: {
            teamId: data.teamId,
            studentId: user.student.id,
            jerseyNumber: data.jerseyNumber ? Number(data.jerseyNumber) : null,
            position: data.position || 'Player',
          },
        });
      }

      return user;
    });

    return result;
  }

  /**
   * Quick Action 4: Create Tournament
   */
  static async quickCreateTournament(data: {
    name: string;
    sportId: string;
    academicYear: string;
    format?: TournamentFormat;
    startDate: string;
    endDate: string;
    maxTeams?: number;
  }) {
    const slug = `${data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`;

    const tournament = await prisma.tournament.create({
      data: {
        name: data.name,
        slug,
        academicYear: data.academicYear || '2025-2026',
        sportId: data.sportId,
        format: data.format || TournamentFormat.KNOCKOUT,
        status: TournamentStatus.UPCOMING,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        maxTeams: data.maxTeams ? Number(data.maxTeams) : 16,
      },
      include: {
        sport: { select: { name: true } },
      },
    });

    return tournament;
  }

  /**
   * Quick Action 5: Schedule Match
   */
  static async quickScheduleMatch(data: {
    tournamentId: string;
    homeTeamId: string;
    awayTeamId: string;
    roundName: string;
    scheduledDate: string;
    venueId?: string;
  }) {
    if (data.homeTeamId === data.awayTeamId) {
      throw new AppError('Home and Away teams must be different.', 400);
    }

    const match = await prisma.match.create({
      data: {
        tournamentId: data.tournamentId,
        homeTeamId: data.homeTeamId,
        awayTeamId: data.awayTeamId,
        roundName: data.roundName || 'Group Stage',
        scheduledDate: new Date(data.scheduledDate),
        venueId: data.venueId || null,
        status: 'SCHEDULED',
      },
      include: {
        homeTeam: { select: { name: true } },
        awayTeam: { select: { name: true } },
        tournament: { select: { name: true } },
      },
    });

    return match;
  }

  /**
   * Quick Action 6: Publish Announcement
   */
  static async quickPublishAnnouncement(
    userId: string,
    data: {
      title: string;
      content: string;
      priority?: Priority;
      targetAudience?: string;
      isPinned?: boolean;
      expiresAt?: string;
    }
  ) {
    const announcement = await prisma.announcement.create({
      data: {
        authorId: userId,
        title: data.title,
        content: data.content,
        priority: data.priority || Priority.MEDIUM,
        targetAudience: data.targetAudience || 'ALL',
        isPinned: data.isPinned || false,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      },
    });

    return announcement;
  }

  /**
   * Institutional Directory (Athletes, Coaches, Match Officials, All Users)
   */
  static async getInstitutionalDirectory() {
    const [users, students, coaches, referees] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          roleEnum: true,
          phone: true,
          isActive: true,
          isVerified: true,
          createdAt: true,
          lastLoginAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 100,
      }),
      prisma.student.findMany({
        include: {
          user: { select: { name: true, email: true, phone: true, isActive: true } },
          teamMemberships: {
            include: {
              team: {
                include: { sport: true },
              },
            },
          },
        },
        orderBy: { rollNumber: 'asc' },
        take: 100,
      }),
      prisma.coach.findMany({
        include: {
          user: { select: { name: true, email: true, phone: true, isActive: true } },
          teams: {
            include: { sport: true },
          },
        },
        orderBy: { user: { name: 'asc' } },
      }),
      prisma.referee.findMany({
        include: {
          user: { select: { name: true, email: true, phone: true, isActive: true } },
          _count: {
            select: { matchesOfficiated: true },
          },
        },
        orderBy: { user: { name: 'asc' } },
      }),
    ]);

    return { users, students, coaches, referees };
  }
}
