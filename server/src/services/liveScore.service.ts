import { prisma } from '../config/database';
import { getIO } from '../config/socket';
import { SOCKET_EVENTS } from '../constants';
import { AppError } from '../middleware/error.middleware';
import { MatchStatus, MatchEventType } from '@prisma/client';

export class LiveScoreService {
  /**
   * 1. Get all active and upcoming live matches (Public & Spectator Feed)
   */
  static async getLiveMatchesFeed() {
    const matches = await prisma.match.findMany({
      where: {
        status: { in: [MatchStatus.LIVE, MatchStatus.WARMUP, MatchStatus.PAUSED, MatchStatus.SCHEDULED] },
      },
      include: {
        homeTeam: { select: { id: true, name: true, logoUrl: true, jerseyColor: true } },
        awayTeam: { select: { id: true, name: true, logoUrl: true, jerseyColor: true } },
        tournament: { select: { id: true, name: true, sport: { select: { name: true, category: true, scoringType: true } } } },
        venue: { select: { id: true, name: true, location: true } },
        events: {
          orderBy: { timestampSec: 'desc' },
          take: 3,
          include: { student: { select: { user: { select: { name: true } } } } },
        },
      },
      orderBy: [{ status: 'asc' }, { scheduledDate: 'asc' }],
    });

    return matches;
  }

  /**
   * 2. Get Single Live Match with complete real-time payload
   */
  static async getLiveMatchById(matchId: string) {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        homeTeam: {
          include: {
            members: {
              where: { isActive: true },
              include: { student: { include: { user: { select: { name: true, avatarUrl: true } } } } },
            },
          },
        },
        awayTeam: {
          include: {
            members: {
              where: { isActive: true },
              include: { student: { include: { user: { select: { name: true, avatarUrl: true } } } } },
            },
          },
        },
        tournament: { include: { sport: true } },
        venue: true,
        referee: { include: { user: { select: { name: true } } } },
        events: {
          orderBy: { createdAt: 'desc' },
          include: { student: { include: { user: { select: { name: true } } } } },
        },
      },
    });

    if (!match) throw new AppError('Match fixture not found.', 404);
    return match;
  }

  /**
   * Helper: Verify user has permission to score this match (Assigned Referee or Admin)
   */
  private static async verifyScoringPermission(userId: string, matchId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('User not found.', 404);

    // Super Admin and Sports Admin always have bypass permission
    if (user.roleEnum === 'SUPER_ADMIN' || user.roleEnum === 'SPORTS_ADMIN') {
      return true;
    }

    // Check if user is the assigned referee
    const referee = await prisma.referee.findUnique({ where: { userId } });
    if (!referee) {
      throw new AppError('Access denied. Only referees or sports administrators can score matches.', 403);
    }

    const match = await prisma.match.findUnique({ where: { id: matchId } });
    if (!match) throw new AppError('Match not found.', 404);

    if (match.refereeId && match.refereeId !== referee.id) {
      throw new AppError('Access denied. You are not assigned to officiate this match.', 403);
    }

    return true;
  }

  /**
   * 3. Start Match (Transitions status to LIVE and broadcasts event)
   */
  static async startMatch(userId: string, matchId: string) {
    await this.verifyScoringPermission(userId, matchId);

    const match = await prisma.match.update({
      where: { id: matchId },
      data: {
        status: MatchStatus.LIVE,
        actualStartTime: new Date(),
        isClockRunning: true,
        currentPeriod: '1st Half',
      },
      include: {
        homeTeam: true,
        awayTeam: true,
        tournament: { include: { sport: true } },
      },
    });

    // Broadcast WebSocket Event to Match Room & Global Channel
    try {
      const io = getIO();
      io.to(`match:${matchId}`).emit(SOCKET_EVENTS.MATCH_STATUS_CHANGE, {
        matchId,
        status: match.status,
        isClockRunning: match.isClockRunning,
        currentPeriod: match.currentPeriod,
      });
      io.emit('live:match_started', { matchId, match });
    } catch (err) {
      console.warn('Socket broadcast failed:', err);
    }

    return match;
  }

  /**
   * 4. Update Score & Log Sport-Specific Match Event
   */
  static async updateScoreAndLogEvent(
    userId: string,
    matchId: string,
    payload: {
      teamId?: string;
      studentId?: string;
      eventType: MatchEventType;
      scoreDelta?: number; // Delta to apply to home or away score
      subScoreText?: string; // Optional updated subscore string (e.g. "156/4 (18.2 ov)")
      currentPeriod?: string;
      timestampSec?: number;
      commentary?: string;
      metadata?: any;
    }
  ) {
    await this.verifyScoringPermission(userId, matchId);

    const match = await prisma.match.findUnique({ where: { id: matchId } });
    if (!match) throw new AppError('Match not found.', 404);

    const scoreValue = payload.scoreDelta || 0;
    const isHome = payload.teamId ? payload.teamId === match.homeTeamId : true;

    // Database updates within transaction
    const [updatedMatch, newEvent] = await prisma.$transaction(async (tx) => {
      // 1. Create MatchEvent
      const event = await tx.matchEvent.create({
        data: {
          matchId,
          eventType: payload.eventType,
          timestampSec: payload.timestampSec || match.matchTimerSec || 0,
          period: payload.currentPeriod || match.currentPeriod || 'Match',
          teamId: payload.teamId,
          studentId: payload.studentId,
          scoreValue: scoreValue,
          commentary: payload.commentary,
          metadata: payload.metadata,
        },
        include: {
          student: { include: { user: { select: { name: true } } } },
        },
      });

      // 2. Update Match Scores
      const updateData: any = {};
      if (scoreValue !== 0 && payload.teamId) {
        if (isHome) {
          updateData.homeScore = { increment: scoreValue };
        } else {
          updateData.awayScore = { increment: scoreValue };
        }
      }

      if (payload.subScoreText) {
        if (isHome) updateData.homeSubScore = payload.subScoreText;
        else updateData.awaySubScore = payload.subScoreText;
      }

      if (payload.currentPeriod) {
        updateData.currentPeriod = payload.currentPeriod;
      }

      if (payload.timestampSec !== undefined) {
        updateData.matchTimerSec = payload.timestampSec;
      }

      const updated = await tx.match.update({
        where: { id: matchId },
        data: updateData,
        include: {
          homeTeam: true,
          awayTeam: true,
        },
      });

      return [updated, event];
    });

    // 3. Broadcast Real-Time WebSocket Updates
    try {
      const io = getIO();
      // Emit Score Update
      io.to(`match:${matchId}`).emit(SOCKET_EVENTS.SCORE_UPDATE, {
        matchId,
        homeScore: updatedMatch.homeScore,
        awayScore: updatedMatch.awayScore,
        homeSubScore: updatedMatch.homeSubScore,
        awaySubScore: updatedMatch.awaySubScore,
        currentPeriod: updatedMatch.currentPeriod,
        matchTimerSec: updatedMatch.matchTimerSec,
      });

      // Emit Event Triggered (Commentary & Feed)
      io.to(`match:${matchId}`).emit(SOCKET_EVENTS.EVENT_TRIGGERED, {
        matchId,
        event: newEvent,
      });

      // Global Live update ticker
      io.emit('live:score_ticker', {
        matchId,
        homeScore: updatedMatch.homeScore,
        awayScore: updatedMatch.awayScore,
        homeTeam: updatedMatch.homeTeam.name,
        awayTeam: updatedMatch.awayTeam.name,
        latestEvent: newEvent.commentary || `${newEvent.eventType} recorded`,
      });
    } catch (err) {
      console.warn('Socket broadcast failed:', err);
    }

    return { match: updatedMatch, event: newEvent };
  }

  /**
   * 5. Sync Match Clock (Play / Pause / Timer sync)
   */
  static async syncClock(
    userId: string,
    matchId: string,
    data: {
      isClockRunning: boolean;
      matchTimerSec?: number;
      currentPeriod?: string;
      status?: MatchStatus;
    }
  ) {
    await this.verifyScoringPermission(userId, matchId);

    const updated = await prisma.match.update({
      where: { id: matchId },
      data: {
        isClockRunning: data.isClockRunning,
        matchTimerSec: data.matchTimerSec,
        currentPeriod: data.currentPeriod,
        status: data.status,
      },
    });

    // Broadcast Clock Sync
    try {
      const io = getIO();
      io.to(`match:${matchId}`).emit('match:clock_sync', {
        matchId,
        isClockRunning: updated.isClockRunning,
        matchTimerSec: updated.matchTimerSec,
        currentPeriod: updated.currentPeriod,
        status: updated.status,
      });
    } catch (err) {
      console.warn('Socket broadcast failed:', err);
    }

    return updated;
  }

  /**
   * 6. Undo Last Match Event
   */
  static async undoLastEvent(userId: string, matchId: string, eventId: string) {
    await this.verifyScoringPermission(userId, matchId);

    const event = await prisma.matchEvent.findUnique({ where: { id: eventId } });
    if (!event || event.matchId !== matchId) {
      throw new AppError('Match event not found.', 404);
    }

    const match = await prisma.match.findUnique({ where: { id: matchId } });
    if (!match) throw new AppError('Match not found.', 404);

    const isHome = event.teamId === match.homeTeamId;

    // Transaction to remove event and reverse score
    const updatedMatch = await prisma.$transaction(async (tx) => {
      await tx.matchEvent.delete({ where: { id: eventId } });

      const scoreDelta = event.scoreValue || 0;
      if (scoreDelta > 0 && event.teamId) {
        return tx.match.update({
          where: { id: matchId },
          data: isHome
            ? { homeScore: { decrement: scoreDelta } }
            : { awayScore: { decrement: scoreDelta } },
          include: { homeTeam: true, awayTeam: true },
        });
      }

      return tx.match.findUnique({
        where: { id: matchId },
        include: { homeTeam: true, awayTeam: true },
      });
    });

    // Broadcast Event Undone
    try {
      const io = getIO();
      io.to(`match:${matchId}`).emit(SOCKET_EVENTS.EVENT_UNDONE, {
        matchId,
        eventId,
        homeScore: updatedMatch?.homeScore,
        awayScore: updatedMatch?.awayScore,
      });
    } catch (err) {
      console.warn('Socket broadcast failed:', err);
    }

    return { message: 'Event undone successfully', match: updatedMatch };
  }

  /**
   * 7. Conclude Match & Finalize Official Report
   */
  static async concludeMatch(
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
    await this.verifyScoringPermission(userId, matchId);

    const match = await prisma.match.findUnique({ where: { id: matchId } });
    if (!match) throw new AppError('Match not found.', 404);

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

    // Broadcast Match Concluded
    try {
      const io = getIO();
      io.to(`match:${matchId}`).emit('match:completed', {
        matchId,
        completedMatch: completed,
      });
      io.emit(SOCKET_EVENTS.MATCH_STATUS_CHANGE, {
        matchId,
        status: MatchStatus.COMPLETED,
      });
    } catch (err) {
      console.warn('Socket broadcast failed:', err);
    }

    return completed;
  }
}
