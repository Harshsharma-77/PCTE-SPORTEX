import { prisma } from '../config/database';

export class AnalyticsService {
  /**
   * 1. Get Top Scorers, MVPs, and Athlete Leaderboards
   */
  static async getLeaderboards(sportId?: string, limit = 10) {
    const whereClause: any = {};
    if (sportId) whereClause.sportId = sportId;

    // Fetch player statistics
    const stats = await prisma.playerStatistic.findMany({
      where: whereClause,
      include: {
        sport: { select: { id: true, name: true, category: true, scoringType: true } },
        student: {
          include: {
            user: { select: { name: true, avatarUrl: true } },
            teamMemberships: {
              where: { isActive: true },
              include: { team: { select: { name: true, department: true } } },
            },
          },
        },
      },
    });

    // Top Goalscorers / Points Scorers
    const topScorers = [...stats]
      .map((s) => ({
        id: s.id,
        studentId: s.studentId,
        name: s.student.user.name,
        avatarUrl: s.student.user.avatarUrl,
        department: s.student.department,
        teamName: s.student.teamMemberships[0]?.team.name || 'Varsity Squad',
        sportName: s.sport.name,
        scoringType: s.sport.scoringType,
        matchesPlayed: s.matchesPlayed,
        totalScore: s.goalsScored + s.pointsScored + s.runsScored,
        goals: s.goalsScored,
        runs: s.runsScored,
        points: s.pointsScored,
        assists: s.assists,
        scoringAverage: s.matchesPlayed > 0 ? ((s.goalsScored + s.pointsScored + s.runsScored) / s.matchesPlayed).toFixed(2) : '0.00',
      }))
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, limit);

    // Tournament MVP Podium (Weighted score based on MVP awards + scoring + matches)
    const mvpPodium = [...stats]
      .map((s) => ({
        id: s.id,
        name: s.student.user.name,
        department: s.student.department,
        teamName: s.student.teamMemberships[0]?.team.name || 'Varsity Squad',
        sportName: s.sport.name,
        mvpAwards: s.mvpAwards,
        totalContribution: s.mvpAwards * 5 + (s.goalsScored + s.pointsScored) * 2 + s.assists,
        matchesPlayed: s.matchesPlayed,
      }))
      .sort((a, b) => b.totalContribution - a.totalContribution)
      .slice(0, limit);

    // Top Playmakers (Assists)
    const topAssists = [...stats]
      .filter((s) => s.assists > 0)
      .map((s) => ({
        id: s.id,
        name: s.student.user.name,
        department: s.student.department,
        teamName: s.student.teamMemberships[0]?.team.name || 'Varsity Squad',
        sportName: s.sport.name,
        assists: s.assists,
        matchesPlayed: s.matchesPlayed,
      }))
      .sort((a, b) => b.assists - a.assists)
      .slice(0, limit);

    // Top Team Leaderboard (from PointsTableEntry)
    const teamEntries = await prisma.pointsTableEntry.findMany({
      include: {
        team: { select: { id: true, name: true, department: true, jerseyColor: true } },
        tournament: { select: { id: true, name: true, sport: { select: { name: true } } } },
      },
      orderBy: [{ totalPoints: 'desc' }, { goalDifference: 'desc' }],
      take: limit,
    });

    const teamLeaderboard = teamEntries.map((e, index) => ({
      rank: index + 1,
      teamId: e.team.id,
      teamName: e.team.name,
      department: e.team.department,
      sportName: e.tournament.sport.name,
      played: e.played,
      won: e.won,
      lost: e.lost,
      drawn: e.drawn,
      winRate: e.played > 0 ? Math.round((e.won / e.played) * 100) : 0,
      totalPoints: e.totalPoints,
      goalDifference: e.goalDifference,
    }));

    return {
      topScorers,
      mvpPodium,
      topAssists,
      teamLeaderboard,
    };
  }

  /**
   * 2. Get Performance Analytics & Chart Series
   */
  static async getPerformanceAnalytics() {
    // 1. Department participation breakdown
    const deptStats = await prisma.student.groupBy({
      by: ['department'],
      _count: { id: true },
    });

    // 2. Sport-by-sport active rosters & matches
    const sports = await prisma.sport.findMany({
      where: { isActive: true },
      include: {
        _count: { select: { teams: true, tournaments: true } },
      },
    });

    // 3. Attendance compliance distribution
    const attendanceAgg = await prisma.attendance.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    // 4. Team win shares by department
    const teamWins = await prisma.pointsTableEntry.groupBy({
      by: ['teamId'],
      _sum: { won: true, totalPoints: true },
    });

    return {
      departmentDistribution: deptStats.map((d) => ({
        department: d.department,
        athletesCount: d._count.id,
      })),
      sportParticipation: sports.map((s) => ({
        sport: s.name,
        category: s.category,
        teamsCount: s._count.teams,
        tournamentsCount: s._count.tournaments,
      })),
      attendanceCompliance: attendanceAgg.map((a) => ({
        status: a.status,
        count: a._count.id,
      })),
    };
  }
}
