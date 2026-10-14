import { prisma } from '../config/database';
import { AppError } from '../middleware/error.middleware';

export class StudentService {
  /**
   * Helper to resolve Student record for a given user ID (or specific student ID for Admin inspection)
   */
  private static async resolveStudent(userId: string, targetStudentId?: string) {
    if (targetStudentId) {
      const student = await prisma.student.findUnique({
        where: { id: targetStudentId },
        include: { user: true },
      });
      if (!student) throw new AppError('Student profile not found.', 404);
      return student;
    }

    let student = await prisma.student.findUnique({
      where: { userId },
      include: { user: true },
    });

    if (!student) {
      // Fallback: If student profile doesn't exist yet, create a default profile for the user
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw new AppError('User not found.', 404);

      student = await prisma.student.create({
        data: {
          userId: user.id,
          rollNumber: `TEMP-${Date.now().toString().slice(-6)}`,
          department: 'CSE',
          batchYear: new Date().getFullYear(),
          semester: 1,
        },
        include: { user: true },
      });
    }

    return student;
  }

  /**
   * 1. Get full personalized Student Athlete Dashboard Summary
   */
  static async getStudentDashboard(userId: string, targetStudentId?: string) {
    const student = await this.resolveStudent(userId, targetStudentId);

    // Fetch team memberships
    const teamMemberships = await prisma.teamMember.findMany({
      where: { studentId: student.id, isActive: true },
      include: {
        team: {
          include: {
            sport: true,
            coach: {
              include: {
                user: { select: { name: true, email: true, phone: true } },
              },
            },
          },
        },
      },
    });

    const teamIds = teamMemberships.map((m) => m.teamId);

    // Fetch Upcoming Matches for the student's teams
    const upcomingMatches = await prisma.match.findMany({
      where: {
        OR: [{ homeTeamId: { in: teamIds } }, { awayTeamId: { in: teamIds } }],
        status: { in: ['SCHEDULED', 'WARMUP', 'LIVE'] },
      },
      include: {
        homeTeam: { select: { id: true, name: true, logoUrl: true, jerseyColor: true } },
        awayTeam: { select: { id: true, name: true, logoUrl: true, jerseyColor: true } },
        tournament: { select: { id: true, name: true, sport: { select: { name: true } } } },
        venue: { select: { id: true, name: true, location: true } },
      },
      orderBy: { scheduledDate: 'asc' },
      take: 6,
    });

    // Fetch Recent Completed Results for the student's teams
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
        venue: { select: { id: true, name: true } },
        events: {
          where: { studentId: student.id },
          select: { eventType: true, scoreValue: true, period: true, commentary: true },
        },
      },
      orderBy: { scheduledDate: 'desc' },
      take: 6,
    });

    // Fetch Attendance records
    const attendanceRecords = await prisma.attendance.findMany({
      where: { studentId: student.id },
      include: {
        sport: { select: { name: true } },
        coach: { select: { user: { select: { name: true } } } },
      },
      orderBy: { sessionDate: 'desc' },
    });

    const totalSessions = attendanceRecords.length;
    const presentSessions = attendanceRecords.filter((a) => a.status === 'PRESENT').length;
    const attendanceRate = totalSessions > 0 ? Math.round((presentSessions / totalSessions) * 100) : 100;

    // Fetch Player Statistics
    const statistics = await prisma.playerStatistic.findMany({
      where: { studentId: student.id },
      include: { sport: true },
    });

    // Fetch Certificates
    const certificates = await prisma.certificate.findMany({
      where: { studentId: student.id, isRevoked: false },
      include: { sport: true, tournament: true },
      orderBy: { issueDate: 'desc' },
    });

    // Fetch Notifications & Bulletins
    const [notifications, announcements] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: student.userId },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      prisma.announcement.findMany({
        where: {
          targetAudience: { in: ['ALL', 'STUDENTS'] },
          OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }],
        },
        orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
        take: 5,
        include: { author: { select: { name: true } } },
      }),
    ]);

    // Aggregate key stats
    const totalGoals = statistics.reduce((acc, s) => acc + s.goalsScored + s.pointsScored + s.runsScored, 0);
    const totalMatchesPlayed = statistics.reduce((acc, s) => acc + s.matchesPlayed, 0);

    return {
      profile: {
        studentId: student.id,
        userId: student.userId,
        name: student.user.name,
        email: student.user.email,
        phone: student.user.phone,
        avatarUrl: student.user.avatarUrl,
        rollNumber: student.rollNumber,
        department: student.department,
        batchYear: student.batchYear,
        semester: student.semester,
        gender: student.gender,
        bloodGroup: student.bloodGroup || 'Not Specified',
        emergencyContact: student.emergencyContact || 'Not Specified',
        isEligible: student.isEligible,
        createdAt: student.createdAt,
      },
      metrics: {
        activeTeamsCount: teamMemberships.length,
        totalMatchesPlayed,
        totalGoals,
        attendanceRate,
        certificatesCount: certificates.length,
      },
      teams: teamMemberships.map((tm) => ({
        id: tm.id,
        teamId: tm.team.id,
        teamName: tm.team.name,
        sportName: tm.team.sport.name,
        sportCategory: tm.team.sport.category,
        jerseyNumber: tm.jerseyNumber,
        position: tm.position || 'General Squad',
        isCaptain: tm.isCaptain,
        isViceCaptain: tm.isViceCaptain,
        jerseyColor: tm.team.jerseyColor,
        coach: tm.team.coach
          ? {
              name: tm.team.coach.user.name,
              email: tm.team.coach.user.email,
              phone: tm.team.coach.user.phone,
            }
          : null,
      })),
      upcomingMatches,
      recentResults: recentResults.map((match) => {
        let outcome: 'WON' | 'LOST' | 'DRAW' = 'DRAW';
        if (match.winnerTeamId) {
          const isHomeWinner = match.winnerTeamId === match.homeTeamId;
          const isStudentHome = teamIds.includes(match.homeTeamId);
          outcome = (isHomeWinner && isStudentHome) || (!isHomeWinner && !isStudentHome) ? 'WON' : 'LOST';
        }

        return {
          id: match.id,
          roundName: match.roundName,
          scheduledDate: match.scheduledDate,
          homeTeam: match.homeTeam.name,
          awayTeam: match.awayTeam.name,
          homeScore: match.homeScore,
          awayScore: match.awayScore,
          winnerTeam: match.winnerTeam?.name || null,
          outcome,
          tournamentName: match.tournament.name,
          sportName: match.tournament.sport.name,
          venueName: match.venue?.name || 'Main Stadium',
          myEvents: match.events,
        };
      }),
      attendance: {
        totalSessions,
        presentSessions,
        attendanceRate,
        records: attendanceRecords.map((a) => ({
          id: a.id,
          sessionDate: a.sessionDate,
          sportName: a.sport.name,
          coachName: a.coach.user.name,
          status: a.status,
          sessionType: a.sessionType,
          remarks: a.remarks,
        })),
      },
      statistics,
      certificates: certificates.map((c) => ({
        id: c.id,
        certificateNo: c.certificateNo,
        verificationUuid: c.verificationUuid,
        title: c.title,
        achievement: c.achievement,
        type: c.type,
        sportName: c.sport.name,
        tournamentName: c.tournament.name,
        issueDate: c.issueDate,
        issuedByAdmin: c.issuedByAdmin,
      })),
      notifications,
      announcements,
    };
  }

  /**
   * 2. Update Student Profile Contact & Medical Information
   */
  static async updateStudentProfile(
    userId: string,
    data: {
      phone?: string;
      emergencyContact?: string;
      bloodGroup?: string;
    }
  ) {
    const student = await this.resolveStudent(userId);

    // Update phone on User if provided
    if (data.phone !== undefined) {
      await prisma.user.update({
        where: { id: student.userId },
        data: { phone: data.phone },
      });
    }

    // Update emergency contact and blood group on Student
    const updatedStudent = await prisma.student.update({
      where: { id: student.id },
      data: {
        emergencyContact: data.emergencyContact,
        bloodGroup: data.bloodGroup,
      },
      include: { user: true },
    });

    return updatedStudent;
  }

  /**
   * 3. Mark Notification as Read
   */
  static async markNotificationRead(userId: string, notificationId: string) {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification || notification.userId !== userId) {
      throw new AppError('Notification not found or access denied.', 404);
    }

    return prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }
}
