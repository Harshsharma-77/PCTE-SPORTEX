import { prisma } from '../config/database';
import { AppError } from '../middleware/error.middleware';

export class ResultsService {
  /**
   * 1. Get Completed Match Results with filtering
   */
  static async getCompletedResults(filters: {
    tournamentId?: string;
    sportId?: string;
    teamId?: string;
    department?: string;
    limit?: number;
  }) {
    const where: any = {
      status: 'COMPLETED',
    };

    if (filters.tournamentId) {
      where.tournamentId = filters.tournamentId;
    }

    if (filters.sportId) {
      where.tournament = { sportId: filters.sportId };
    }

    if (filters.teamId) {
      where.OR = [{ homeTeamId: filters.teamId }, { awayTeamId: filters.teamId }];
    }

    const matches = await prisma.match.findMany({
      where,
      include: {
        homeTeam: { select: { id: true, name: true, logoUrl: true, jerseyColor: true, department: true } },
        awayTeam: { select: { id: true, name: true, logoUrl: true, jerseyColor: true, department: true } },
        winnerTeam: { select: { id: true, name: true } },
        tournament: { select: { id: true, name: true, sport: { select: { id: true, name: true, category: true, scoringType: true } } } },
        venue: { select: { id: true, name: true, location: true } },
        referee: { select: { id: true, user: { select: { name: true } } } },
        events: {
          orderBy: { timestampSec: 'desc' },
          include: { student: { select: { id: true, user: { select: { name: true } } } } },
        },
      },
      orderBy: { scheduledDate: 'desc' },
      take: filters.limit || 50,
    });

    return matches;
  }

  /**
   * 2. Get Detailed Single Match Scorecard Summary
   */
  static async getMatchDetails(matchId: string) {
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
        referee: { include: { user: { select: { name: true, email: true } } } },
        events: {
          orderBy: { timestampSec: 'asc' },
          include: { student: { include: { user: { select: { name: true } } } } },
        },
      },
    });

    if (!match) throw new AppError('Match scorecard not found.', 404);
    return match;
  }

  /**
   * 3. Get Points Table / Standings with Automated Sorting & Form Guide
   */
  static async getTournamentStandings(tournamentId?: string, sportId?: string) {
    // If tournamentId not passed, pick the first active tournament
    let targetTournId = tournamentId;
    if (!targetTournId) {
      const activeTourn = await prisma.tournament.findFirst({
        where: sportId ? { sportId } : undefined,
        orderBy: { createdAt: 'desc' },
      });
      if (activeTourn) targetTournId = activeTourn.id;
    }

    if (!targetTournId) {
      return { tournament: null, standings: [] };
    }

    const tournament = await prisma.tournament.findUnique({
      where: { id: targetTournId },
      include: { sport: true },
    });

    if (!tournament) throw new AppError('Tournament not found.', 404);

    // Fetch entries
    const entries = await prisma.pointsTableEntry.findMany({
      where: { tournamentId: targetTournId },
      include: {
        team: {
          select: {
            id: true,
            name: true,
            department: true,
            logoUrl: true,
            jerseyColor: true,
          },
        },
      },
    });

    // Fetch recent completed matches for form guide calculation
    const tournamentMatches = await prisma.match.findMany({
      where: { tournamentId: targetTournId, status: 'COMPLETED' },
      orderBy: { scheduledDate: 'desc' },
      select: {
        id: true,
        homeTeamId: true,
        awayTeamId: true,
        winnerTeamId: true,
        isDraw: true,
      },
    });

    // Calculate form guide (e.g. ['W', 'W', 'D', 'L']) for each team
    const formMap: Record<string, string[]> = {};
    entries.forEach((e) => {
      formMap[e.teamId] = [];
    });

    tournamentMatches.forEach((m) => {
      [m.homeTeamId, m.awayTeamId].forEach((tId) => {
        if (formMap[tId] && formMap[tId].length < 5) {
          if (m.isDraw) formMap[tId].push('D');
          else if (m.winnerTeamId === tId) formMap[tId].push('W');
          else formMap[tId].push('L');
        }
      });
    });

    // Auto sort: Total Points DESC -> Goal Difference DESC -> Points For DESC -> Won DESC
    const sorted = [...entries].sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
      if (b.pointsFor !== a.pointsFor) return b.pointsFor - a.pointsFor;
      return b.won - a.won;
    });

    const standings = sorted.map((entry, index) => ({
      id: entry.id,
      rank: index + 1,
      teamId: entry.teamId,
      teamName: entry.team.name,
      department: entry.team.department,
      jerseyColor: entry.team.jerseyColor,
      played: entry.played,
      won: entry.won,
      drawn: entry.drawn,
      lost: entry.lost,
      pointsFor: entry.pointsFor,
      pointsAgainst: entry.pointsAgainst,
      goalDifference: entry.goalDifference,
      totalPoints: entry.totalPoints,
      form: formMap[entry.teamId] || [],
    }));

    return {
      tournament: {
        id: tournament.id,
        name: tournament.name,
        sportName: tournament.sport.name,
        scoringType: tournament.sport.scoringType,
        academicYear: tournament.academicYear,
        format: tournament.format,
      },
      standings,
    };
  }

  /**
   * 4. Auto-Sync Match Finalization & Cascade into Points Table + Player Statistics
   */
  static async syncMatchFinalization(matchId: string) {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        tournament: true,
        events: true,
      },
    });

    if (!match || match.status !== 'COMPLETED') {
      throw new AppError('Match must be completed before finalizing statistics.', 400);
    }

    const { homeTeamId, awayTeamId, homeScore, awayScore, winnerTeamId, isDraw, tournamentId, events } = match;

    // 1. Update or Upsert Points Table Entries if match is part of a tournament
    if (tournamentId) {
      const homeWon = !isDraw && winnerTeamId === homeTeamId ? 1 : 0;
      const homeLost = !isDraw && winnerTeamId === awayTeamId ? 1 : 0;
      const homeDrawn = isDraw ? 1 : 0;
      const homePts = homeWon * 3 + homeDrawn * 1;
      const homeDiff = homeScore - awayScore;

      await prisma.pointsTableEntry.upsert({
        where: {
          tournamentId_teamId: { tournamentId, teamId: homeTeamId },
        },
        update: {
          played: { increment: 1 },
          won: { increment: homeWon },
          lost: { increment: homeLost },
          drawn: { increment: homeDrawn },
          pointsFor: { increment: homeScore },
          pointsAgainst: { increment: awayScore },
          goalDifference: { increment: homeDiff },
          totalPoints: { increment: homePts },
        },
        create: {
          tournamentId,
          teamId: homeTeamId,
          played: 1,
          won: homeWon,
          lost: homeLost,
          drawn: homeDrawn,
          pointsFor: homeScore,
          pointsAgainst: awayScore,
          goalDifference: homeDiff,
          totalPoints: homePts,
        },
      });

      const awayWon = !isDraw && winnerTeamId === awayTeamId ? 1 : 0;
      const awayLost = !isDraw && winnerTeamId === homeTeamId ? 1 : 0;
      const awayDrawn = isDraw ? 1 : 0;
      const awayPts = awayWon * 3 + awayDrawn * 1;
      const awayDiff = awayScore - homeScore;

      await prisma.pointsTableEntry.upsert({
        where: {
          tournamentId_teamId: { tournamentId, teamId: awayTeamId },
        },
        update: {
          played: { increment: 1 },
          won: { increment: awayWon },
          lost: { increment: awayLost },
          drawn: { increment: awayDrawn },
          pointsFor: { increment: awayScore },
          pointsAgainst: { increment: homeScore },
          goalDifference: { increment: awayDiff },
          totalPoints: { increment: awayPts },
        },
        create: {
          tournamentId,
          teamId: awayTeamId,
          played: 1,
          won: awayWon,
          lost: awayLost,
          drawn: awayDrawn,
          pointsFor: awayScore,
          pointsAgainst: homeScore,
          goalDifference: awayDiff,
          totalPoints: awayPts,
        },
      });
    }

    // 2. Cascade MatchEvent increments into PlayerStatistic
    const sportId = match.tournament?.sportId;
    if (sportId && events.length > 0) {
      for (const ev of events) {
        if (!ev.studentId) continue;

        const isGoal = ev.eventType === 'GOAL';
        const isRun = ev.eventType === 'RUNS';
        const isWicket = ev.eventType === 'WICKET';
        const isPoint = ev.eventType === 'POINT';
        const isYellow = ev.eventType === 'YELLOW_CARD';
        const isRed = ev.eventType === 'RED_CARD';

        await prisma.playerStatistic.upsert({
          where: {
            studentId_sportId: { studentId: ev.studentId, sportId },
          },
          update: {
            matchesPlayed: { increment: 1 },
            goalsScored: { increment: isGoal ? ev.scoreValue : 0 },
            runsScored: { increment: isRun ? ev.scoreValue : 0 },
            wicketsTaken: { increment: isWicket ? 1 : 0 },
            pointsScored: { increment: isPoint ? ev.scoreValue : 0 },
            yellowCards: { increment: isYellow ? 1 : 0 },
            redCards: { increment: isRed ? 1 : 0 },
          },
          create: {
            studentId: ev.studentId,
            sportId,
            matchesPlayed: 1,
            goalsScored: isGoal ? ev.scoreValue : 0,
            runsScored: isRun ? ev.scoreValue : 0,
            wicketsTaken: isWicket ? 1 : 0,
            pointsScored: isPoint ? ev.scoreValue : 0,
            yellowCards: isYellow ? 1 : 0,
            redCards: isRed ? 1 : 0,
          },
        });
      }
    }

    return { message: 'Standings and player statistics synchronized successfully.' };
  }
}
