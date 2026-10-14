import { prisma } from '../config/database';
import { AppError } from '../middleware/error.middleware';
import { MatchStatus, MatchEventType } from '@prisma/client';

export class RefereeService {
  /**
   * Resolve Referee profile for user
   */
  private static async resolveReferee(userId: string, targetRefereeId?: string) {
    if (targetRefereeId) {
      const referee = await prisma.referee.findUnique({
        where: { id: targetRefereeId },
        include: { user: true },
      });
      if (!referee) throw new AppError('Referee profile not found.', 404);
      return referee;
    }

    let referee = await prisma.referee.findUnique({
      where: { userId },
      include: { user: true },
    });

    if (!referee) {
      // Auto-provision referee profile for demo/first-time login if user exists
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw new AppError('User not found.', 404);

      referee = await prisma.referee.create({
        data: {
          userId: user.id,
          licenseNumber: 'AIFF-REF-2026',
          officiatingLevel: 'STATE',
          certifiedSports: ['Football', 'Cricket', 'Basketball', 'Badminton'],
        },
        include: { user: true },
      });
    }

    return referee;
  }

  /**
   * 1. Get Referee Dashboard Overview
   */
  static async getRefereeDashboard(userId: string, targetRefereeId?: string) {
    const referee = await this.resolveReferee(userId, targetRefereeId);

    // Fetch assigned matches
    const matches = await prisma.match.findMany({
      where: { refereeId: referee.id },
      include: {
        homeTeam: { select: { id: true, name: true, logoUrl: true, jerseyColor: true } },
        awayTeam: { select: { id: true, name: true, logoUrl: true, jerseyColor: true } },
        tournament: { select: { id: true, name: true, sport: { select: { name: true, scoringType: true } } } },
        venue: { select: { id: true, name: true, location: true } },
        winnerTeam: { select: { id: true, name: true } },
        events: {
          orderBy: { timestampSec: 'desc' },
          take: 10,
          include: { student: { select: { user: { select: { name: true } } } } },
        },
      },
      orderBy: { scheduledDate: 'asc' },
    });

    const liveMatches = matches.filter((m) => m.status === 'LIVE' || m.status === 'WARMUP' || m.status === 'PAUSED');
    const upcomingMatches = matches.filter((m) => m.status === 'SCHEDULED');
    const completedMatches = matches.filter((m) => m.status === 'COMPLETED');

    return {
      referee: {
        id: referee.id,
        name: referee.user.name,
        email: referee.user.email,
        phone: referee.user.phone,
        licenseNumber: referee.licenseNumber,
        officiatingLevel: referee.officiatingLevel,
        certifiedSports: referee.certifiedSports,
      },
      metrics: {
        totalAssigned: matches.length,
        liveMatchesCount: liveMatches.length,
        upcomingCount: upcomingMatches.length,
        completedCount: completedMatches.length,
      },
      liveMatches,
      upcomingMatches,
      completedMatches,
    };
  }

  /**
   * 2. Get Match Details & Squad Lineups for Live Scorer
   */
  static async getMatchDetails(userId: string, matchId: string) {
    const referee = await this.resolveReferee(userId);

    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        homeTeam: {
          include: {
            members: {
              where: { isActive: true },
              include: { student: { include: { user: { select: { name: true } } } } },
            },
          },
        },
        awayTeam: {
          include: {
            members: {
              where: { isActive: true },
              include: { student: { include: { user: { select: { name: true } } } } },
            },
          },
        },
        tournament: { include: { sport: true } },
        venue: true,
        referee: { include: { user: true } },
        events: {
          orderBy: { timestampSec: 'desc' },
          include: { student: { include: { user: { select: { name: true } } } } },
        },
      },
    });

    if (!match) throw new AppError('Match not found.', 404);

    // If referee is assigned, verify identity (allow Super Admin bypass)
    if (match.refereeId && match.refereeId !== referee.id) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user?.roleEnum !== 'SUPER_ADMIN') {
        throw new AppError('Access denied. You are not assigned to officiate this match.', 403);
      }
    }

    return match;
  }

  /**
   * 3. Start Match (Kickoff / First Period)
   */
  static async startMatch(userId: string, matchId: string) {
    await this.getMatchDetails(userId, matchId); // Enforces access

    const updated = await prisma.match.update({
      where: { id: matchId },
      data: {
        status: MatchStatus.LIVE,
        actualStartTime: new Date(),
        isClockRunning: true,
        currentPeriod: '1st Half',
      },
    });

    return updated;
  }

  /**
   * 4. Update Match Status / Period / Timer
   */
  static async updateMatchStatus(
    userId: string,
    matchId: string,
    data: {
      status?: MatchStatus;
      currentPeriod?: string;
      matchTimerSec?: number;
      isClockRunning?: boolean;
    }
  ) {
    await this.getMatchDetails(userId, matchId);

    const updated = await prisma.match.update({
      where: { id: matchId },
      data: {
        status: data.status,
        currentPeriod: data.currentPeriod,
        matchTimerSec: data.matchTimerSec,
        isClockRunning: data.isClockRunning,
      },
    });

    return updated;
  }

  /**
   * 5. Log Live Match Event & Increment Score
   */
  static async logMatchEvent(
    userId: string,
    matchId: string,
    data: {
      eventType: MatchEventType;
      timestampSec: number;
      period?: string;
      teamId?: string;
      studentId?: string;
      scoreValue?: number;
      commentary?: string;
    }
  ) {
    const match = await this.getMatchDetails(userId, matchId);
    const scoreVal = data.scoreValue || 1;

    // Create MatchEvent
    const event = await prisma.matchEvent.create({
      data: {
        matchId,
        eventType: data.eventType,
        timestampSec: data.timestampSec || 0,
        period: data.period || match.currentPeriod,
        teamId: data.teamId,
        studentId: data.studentId,
        scoreValue: scoreVal,
        commentary: data.commentary,
      },
      include: {
        student: { include: { user: { select: { name: true } } } },
      },
    });

    // Score mutating events
    const isScoreEvent =
      data.eventType === 'GOAL' ||
      data.eventType === 'POINT' ||
      data.eventType === 'RUNS' ||
      data.eventType === 'TRY';

    if (isScoreEvent && data.teamId) {
      if (data.teamId === match.homeTeamId) {
        await prisma.match.update({
          where: { id: matchId },
          data: { homeScore: { increment: scoreVal } },
        });
      } else if (data.teamId === match.awayTeamId) {
        await prisma.match.update({
          where: { id: matchId },
          data: { awayScore: { increment: scoreVal } },
        });
      }
    }

    return event;
  }

  /**
   * 6. Submit Official Match Report & Conclude Match
   */
  static async submitMatchReport(
    userId: string,
    matchId: string,
    data: {
      homeScore: number;
      awayScore: number;
      winnerTeamId?: string;
      isDraw?: boolean;
      notes?: string;
    }
  ) {
    const match = await this.getMatchDetails(userId, matchId);

    const isDraw = data.isDraw !== undefined ? data.isDraw : data.homeScore === data.awayScore;
    let winnerId = data.winnerTeamId;

    if (!isDraw && !winnerId) {
      if (data.homeScore > data.awayScore) winnerId = match.homeTeamId;
      else if (data.awayScore > data.homeScore) winnerId = match.awayTeamId;
    }

    const completed = await prisma.match.update({
      where: { id: matchId },
      data: {
        status: MatchStatus.COMPLETED,
        homeScore: data.homeScore,
        awayScore: data.awayScore,
        winnerTeamId: isDraw ? null : winnerId,
        isDraw,
        actualEndTime: new Date(),
        isClockRunning: false,
        notes: data.notes,
      },
      include: {
        homeTeam: true,
        awayTeam: true,
        winnerTeam: true,
      },
    });

    // Update Points Table Entry if part of a tournament
    if (match.tournamentId) {
      try {
        const homeEntry = await prisma.pointsTableEntry.findUnique({
          where: {
            tournamentId_teamId: {
              tournamentId: match.tournamentId,
              teamId: match.homeTeamId,
            },
          },
        });

        const awayEntry = await prisma.pointsTableEntry.findUnique({
          where: {
            tournamentId_teamId: {
              tournamentId: match.tournamentId,
              teamId: match.awayTeamId,
            },
          },
        });

        if (homeEntry) {
          const won = !isDraw && winnerId === match.homeTeamId ? 1 : 0;
          const lost = !isDraw && winnerId === match.awayTeamId ? 1 : 0;
          const drawn = isDraw ? 1 : 0;
          const pointsGained = won * 3 + drawn * 1;

          await prisma.pointsTableEntry.update({
            where: { id: homeEntry.id },
            data: {
              played: { increment: 1 },
              won: { increment: won },
              lost: { increment: lost },
              drawn: { increment: drawn },
              totalPoints: { increment: pointsGained },
              goalDifference: { increment: data.homeScore - data.awayScore },
            },
          });
        }

        if (awayEntry) {
          const won = !isDraw && winnerId === match.awayTeamId ? 1 : 0;
          const lost = !isDraw && winnerId === match.homeTeamId ? 1 : 0;
          const drawn = isDraw ? 1 : 0;
          const pointsGained = won * 3 + drawn * 1;

          await prisma.pointsTableEntry.update({
            where: { id: awayEntry.id },
            data: {
              played: { increment: 1 },
              won: { increment: won },
              lost: { increment: lost },
              drawn: { increment: drawn },
              totalPoints: { increment: pointsGained },
              goalDifference: { increment: data.awayScore - data.homeScore },
            },
          });
        }
      } catch (err) {
        console.warn('Points table update skipped or already finalized:', err);
      }
    }

    return completed;
  }
}
