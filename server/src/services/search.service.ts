import { prisma } from '../config/database';

export class SearchService {
  static async omnisearch(query: string, limit = 5) {
    if (!query || query.trim().length < 2) {
      return {
        students: [],
        teams: [],
        sports: [],
        tournaments: [],
        matches: [],
        announcements: [],
      };
    }

    const cleanQuery = query.trim();

    const [students, teams, sports, tournaments, matches, announcements] = await Promise.all([
      // 1. Search Students
      prisma.student.findMany({
        where: {
          OR: [
            { user: { name: { contains: cleanQuery, mode: 'insensitive' } } },
            { rollNumber: { contains: cleanQuery, mode: 'insensitive' } },
            { department: { contains: cleanQuery, mode: 'insensitive' } },
          ],
        },
        include: {
          user: { select: { name: true, avatarUrl: true } },
        },
        take: limit,
      }),

      // 2. Search Teams
      prisma.team.findMany({
        where: {
          OR: [
            { name: { contains: cleanQuery, mode: 'insensitive' } },
            { department: { contains: cleanQuery, mode: 'insensitive' } },
          ],
        },
        include: {
          sport: { select: { name: true } },
        },
        take: limit,
      }),

      // 3. Search Sports
      prisma.sport.findMany({
        where: {
          name: { contains: cleanQuery, mode: 'insensitive' },
        },
        take: limit,
      }),

      // 4. Search Tournaments
      prisma.tournament.findMany({
        where: {
          OR: [
            { name: { contains: cleanQuery, mode: 'insensitive' } },
            { academicYear: { contains: cleanQuery, mode: 'insensitive' } },
          ],
        },
        include: {
          sport: { select: { name: true } },
        },
        take: limit,
      }),

      // 5. Search Matches
      prisma.match.findMany({
        where: {
          OR: [
            { homeTeam: { name: { contains: cleanQuery, mode: 'insensitive' } } },
            { awayTeam: { name: { contains: cleanQuery, mode: 'insensitive' } } },
            { roundName: { contains: cleanQuery, mode: 'insensitive' } },
          ],
        },
        include: {
          homeTeam: { select: { name: true } },
          awayTeam: { select: { name: true } },
          tournament: { select: { name: true, sport: { select: { name: true } } } },
        },
        take: limit,
      }),

      // 6. Search Announcements
      prisma.announcement.findMany({
        where: {
          title: { contains: cleanQuery, mode: 'insensitive' },
        },
        take: limit,
      }),
    ]);

    return {
      students: students.map((s) => ({
        id: s.id,
        title: s.user.name,
        subtitle: `Roll: ${s.rollNumber} • ${s.department}`,
        type: 'Student Athlete',
        url: `/student/profile`,
      })),
      teams: teams.map((t) => ({
        id: t.id,
        title: t.name,
        subtitle: `${t.sport.name} • ${t.department || 'Varsity'}`,
        type: 'Team Franchise',
        url: `/admin/teams`,
      })),
      sports: sports.map((sp) => ({
        id: sp.id,
        title: sp.name,
        subtitle: `${sp.category} Sport`,
        type: 'Sport Discipline',
        url: `/admin/sports`,
      })),
      tournaments: tournaments.map((tr) => ({
        id: tr.id,
        title: tr.name,
        subtitle: `${tr.sport.name} • ${tr.academicYear}`,
        type: 'Tournament Cup',
        url: `/admin/tournaments`,
      })),
      matches: matches.map((m) => ({
        id: m.id,
        title: `${m.homeTeam.name} vs ${m.awayTeam.name}`,
        subtitle: `${m.tournament.sport.name} • ${m.roundName} (${m.status})`,
        type: 'Match Fixture',
        url: `/live/${m.id}`,
      })),
      announcements: announcements.map((a) => ({
        id: a.id,
        title: a.title,
        subtitle: `Priority: ${a.priority}`,
        type: 'Announcement',
        url: `/dashboard`,
      })),
    };
  }
}
