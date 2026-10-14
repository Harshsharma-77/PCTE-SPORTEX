import { prisma } from '../config/database';
import { AppError } from '../middleware/error.middleware';
import { AttendanceStatus } from '@prisma/client';

export class CoachService {
  /**
   * Resolve Coach entity for user (or specific coach ID for Admin inspection)
   */
  private static async resolveCoach(userId: string, targetCoachId?: string) {
    if (targetCoachId) {
      const coach = await prisma.coach.findUnique({
        where: { id: targetCoachId },
        include: { user: true },
      });
      if (!coach) throw new AppError('Coach profile not found.', 404);
      return coach;
    }

    let coach = await prisma.coach.findUnique({
      where: { userId },
      include: { user: true },
    });

    if (!coach) {
      // Auto-provision coach profile for demo/first-time login if user exists
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw new AppError('User not found.', 404);

      coach = await prisma.coach.create({
        data: {
          userId: user.id,
          specialization: 'Football',
          qualification: 'AFC License B',
          experienceYears: 4,
          bio: 'Varsity Head Coach at PCTE Sportex.',
        },
        include: { user: true },
      });
    }

    return coach;
  }

  /**
   * 1. Get Coach Dashboard Summary
   */
  static async getCoachDashboard(userId: string, targetCoachId?: string) {
    const coach = await this.resolveCoach(userId, targetCoachId);

    // Fetch assigned teams
    const assignedTeams = await prisma.team.findMany({
      where: { coachId: coach.id, isActive: true },
      include: {
        sport: true,
        members: {
          where: { isActive: true },
          include: {
            student: {
              include: {
                user: { select: { name: true, email: true, phone: true, avatarUrl: true } },
                playerStats: true,
              },
            },
          },
        },
      },
    });

    const teamIds = assignedTeams.map((t) => t.id);

    // Upcoming matches for coach's teams
    const upcomingMatches = await prisma.match.findMany({
      where: {
        OR: [{ homeTeamId: { in: teamIds } }, { awayTeamId: { in: teamIds } }],
        status: { in: ['SCHEDULED', 'WARMUP', 'LIVE'] },
      },
      include: {
        homeTeam: { select: { id: true, name: true, logoUrl: true } },
        awayTeam: { select: { id: true, name: true, logoUrl: true } },
        tournament: { select: { id: true, name: true, sport: { select: { name: true } } } },
        venue: { select: { id: true, name: true, location: true } },
      },
      orderBy: { scheduledDate: 'asc' },
      take: 6,
    });

    // Recent results for coach's teams
    const recentResults = await prisma.match.findMany({
      where: {
        OR: [{ homeTeamId: { in: teamIds } }, { awayTeamId: { in: teamIds } }],
        status: 'COMPLETED',
      },
      include: {
        homeTeam: { select: { id: true, name: true } },
        awayTeam: { select: { id: true, name: true } },
        winnerTeam: { select: { id: true, name: true } },
        tournament: { select: { id: true, name: true, sport: { select: { name: true } } } },
      },
      orderBy: { scheduledDate: 'desc' },
      take: 6,
    });

    // Attendance sessions recorded by this coach
    const attendanceRecords = await prisma.attendance.findMany({
      where: { coachId: coach.id },
      include: {
        student: { include: { user: { select: { name: true } } } },
        sport: { select: { name: true } },
      },
      orderBy: { sessionDate: 'desc' },
      take: 50,
    });

    // Compute metrics
    const totalPlayers = assignedTeams.reduce((acc, t) => acc + t.members.length, 0);
    const totalSessions = new Set(attendanceRecords.map((a) => a.sessionDate.toISOString().split('T')[0])).size;
    const presentRecords = attendanceRecords.filter((a) => a.status === 'PRESENT').length;
    const overallAttendanceRate =
      attendanceRecords.length > 0 ? Math.round((presentRecords / attendanceRecords.length) * 100) : 100;

    // Compute win/loss record
    let wins = 0;
    let losses = 0;
    let draws = 0;

    recentResults.forEach((m) => {
      if (m.isDraw) {
        draws++;
      } else if (m.winnerTeamId) {
        if (teamIds.includes(m.winnerTeamId)) wins++;
        else losses++;
      }
    });

    return {
      coach: {
        id: coach.id,
        name: coach.user.name,
        email: coach.user.email,
        phone: coach.user.phone,
        specialization: coach.specialization,
        qualification: coach.qualification,
        experienceYears: coach.experienceYears,
        bio: coach.bio,
      },
      metrics: {
        assignedTeamsCount: assignedTeams.length,
        totalPlayers,
        upcomingMatchesCount: upcomingMatches.length,
        totalSessions,
        attendanceRate: overallAttendanceRate,
        wins,
        losses,
        draws,
      },
      assignedTeams: assignedTeams.map((t) => ({
        id: t.id,
        name: t.name,
        sportName: t.sport.name,
        sportCategory: t.sport.category,
        department: t.department,
        jerseyColor: t.jerseyColor,
        playersCount: t.members.length,
        players: t.members.map((m) => ({
          membershipId: m.id,
          studentId: m.student.id,
          name: m.student.user.name,
          rollNumber: m.student.rollNumber,
          department: m.student.department,
          semester: m.student.semester,
          jerseyNumber: m.jerseyNumber,
          position: m.position,
          isCaptain: m.isCaptain,
          isViceCaptain: m.isViceCaptain,
          isEligible: m.student.isEligible,
          phone: m.student.user.phone,
          emergencyContact: m.student.emergencyContact,
          goals: m.student.playerStats.reduce((acc, s) => acc + s.goalsScored + s.pointsScored + s.runsScored, 0),
        })),
      })),
      upcomingMatches,
      recentResults,
      attendanceHistory: attendanceRecords,
    };
  }

  /**
   * 2. Mark Attendance for Team Training Session
   */
  static async markAttendance(
    userId: string,
    data: {
      sessionDate: string;
      sportId: string;
      sessionType?: string;
      records: Array<{
        studentId: string;
        status: AttendanceStatus;
        remarks?: string;
      }>;
    }
  ) {
    const coach = await this.resolveCoach(userId);
    const dateObj = new Date(data.sessionDate);

    // Upsert attendance records for all provided students
    const results = await prisma.$transaction(
      data.records.map((rec) =>
        prisma.attendance.upsert({
          where: {
            sessionDate_studentId_sportId: {
              sessionDate: dateObj,
              studentId: rec.studentId,
              sportId: data.sportId,
            },
          },
          update: {
            status: rec.status,
            sessionType: data.sessionType || 'TRAINING',
            remarks: rec.remarks,
            coachId: coach.id,
          },
          create: {
            sessionDate: dateObj,
            sportId: data.sportId,
            studentId: rec.studentId,
            coachId: coach.id,
            status: rec.status,
            sessionType: data.sessionType || 'TRAINING',
            remarks: rec.remarks,
          },
        })
      )
    );

    return {
      message: `Recorded attendance for ${results.length} squad athletes.`,
      sessionDate: data.sessionDate,
    };
  }

  /**
   * 3. Add Player to Coach's Team Roster
   */
  static async addPlayerToSquad(
    userId: string,
    data: {
      teamId: string;
      studentId: string;
      jerseyNumber?: number;
      position?: string;
      isCaptain?: boolean;
    }
  ) {
    const coach = await this.resolveCoach(userId);

    // Verify coach manages this team
    const team = await prisma.team.findUnique({
      where: { id: data.teamId },
    });

    if (!team) throw new AppError('Team not found.', 404);
    if (team.coachId !== coach.id) {
      throw new AppError('Access denied. You are not the assigned head coach for this team.', 403);
    }

    const existing = await prisma.teamMember.findUnique({
      where: {
        teamId_studentId: {
          teamId: data.teamId,
          studentId: data.studentId,
        },
      },
    });

    if (existing) {
      throw new AppError('Student is already registered in this squad roster.', 409);
    }

    const member = await prisma.teamMember.create({
      data: {
        teamId: data.teamId,
        studentId: data.studentId,
        jerseyNumber: data.jerseyNumber ? Number(data.jerseyNumber) : null,
        position: data.position || 'Player',
        isCaptain: data.isCaptain || false,
      },
      include: {
        student: { include: { user: { select: { name: true } } } },
      },
    });

    return member;
  }

  /**
   * 4. Update Player Roster Details (Jersey, Position, Captaincy)
   */
  static async updateSquadPlayer(
    userId: string,
    teamMemberId: string,
    data: {
      jerseyNumber?: number;
      position?: string;
      isCaptain?: boolean;
      isActive?: boolean;
    }
  ) {
    const coach = await this.resolveCoach(userId);

    const member = await prisma.teamMember.findUnique({
      where: { id: teamMemberId },
      include: { team: true },
    });

    if (!member) throw new AppError('Roster member not found.', 404);
    if (member.team.coachId !== coach.id) {
      throw new AppError('Access denied. You are not the head coach of this squad.', 403);
    }

    const updated = await prisma.teamMember.update({
      where: { id: teamMemberId },
      data: {
        jerseyNumber: data.jerseyNumber !== undefined ? Number(data.jerseyNumber) : undefined,
        position: data.position !== undefined ? data.position : undefined,
        isCaptain: data.isCaptain !== undefined ? data.isCaptain : undefined,
        isActive: data.isActive !== undefined ? data.isActive : undefined,
      },
    });

    return updated;
  }
}
