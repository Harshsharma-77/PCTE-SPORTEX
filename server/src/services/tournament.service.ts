import { prisma } from '../config/database';
import { AppError } from '../middleware/error.middleware';
import { TournamentFormat, TournamentStatus } from '@prisma/client';
import { AuditService } from './audit.service';

export class TournamentService {
  static async getAllTournaments(filters?: { sportId?: string; status?: TournamentStatus }) {
    const where: any = {};
    if (filters?.sportId) where.sportId = filters.sportId;
    if (filters?.status) where.status = filters.status;

    const tournaments = await prisma.tournament.findMany({
      where,
      include: {
        sport: { select: { id: true, name: true, category: true } },
        _count: {
          select: {
            registeredTeams: true,
            matches: true,
          },
        },
      },
      orderBy: { startDate: 'desc' },
    });

    return tournaments;
  }

  static async getTournamentById(id: string) {
    const tournament = await prisma.tournament.findUnique({
      where: { id },
      include: {
        sport: true,
        registeredTeams: {
          include: {
            team: {
              include: {
                coach: { include: { user: { select: { name: true } } } },
                _count: { select: { members: { where: { isActive: true } } } },
              },
            },
          },
        },
        matches: {
          include: {
            homeTeam: { select: { id: true, name: true, jerseyColor: true } },
            awayTeam: { select: { id: true, name: true, jerseyColor: true } },
            venue: { select: { id: true, name: true } },
            referee: { select: { id: true, user: { select: { name: true } } } },
          },
          orderBy: { scheduledDate: 'asc' },
        },
        pointsTable: {
          include: { team: { select: { id: true, name: true, department: true } } },
          orderBy: [{ totalPoints: 'desc' }, { goalDifference: 'desc' }],
        },
      },
    });

    if (!tournament) throw new AppError('Tournament not found.', 404);
    return tournament;
  }

  static async createTournament(
    userId: string,
    data: {
      name: string;
      academicYear: string;
      sportId: string;
      format?: TournamentFormat;
      startDate: Date;
      endDate: Date;
      maxTeams?: number;
      description?: string;
    }
  ) {
    const slug = `${data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')}-${Date.now().toString().slice(-4)}`;

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
        maxTeams: data.maxTeams || 16,
        description: data.description,
      },
      include: { sport: true },
    });

    await AuditService.recordLog({
      userId,
      action: 'TOURNAMENT_CREATED',
      entity: 'Tournament',
      entityId: tournament.id,
      changesDiff: { name: data.name, format: tournament.format },
    });

    return tournament;
  }

  static async registerTeam(
    userId: string,
    tournamentId: string,
    data: {
      teamId: string;
      seed?: number;
      groupName?: string;
    }
  ) {
    const tournament = await prisma.tournament.findUnique({ where: { id: tournamentId } });
    if (!tournament) throw new AppError('Tournament not found.', 404);

    const team = await prisma.team.findUnique({ where: { id: data.teamId } });
    if (!team) throw new AppError('Team franchise not found.', 404);

    const registration = await prisma.tournamentTeam.upsert({
      where: {
        tournamentId_teamId: { tournamentId, teamId: data.teamId },
      },
      update: {
        seed: data.seed,
        groupName: data.groupName,
        isRegistered: true,
      },
      create: {
        tournamentId,
        teamId: data.teamId,
        seed: data.seed,
        groupName: data.groupName,
        isRegistered: true,
      },
      include: { team: true },
    });

    // Also initialize points table entry
    await prisma.pointsTableEntry.upsert({
      where: {
        tournamentId_teamId: { tournamentId, teamId: data.teamId },
      },
      update: {},
      create: {
        tournamentId,
        teamId: data.teamId,
        played: 0,
        won: 0,
        lost: 0,
        drawn: 0,
        totalPoints: 0,
      },
    });

    await AuditService.recordLog({
      userId,
      action: 'TOURNAMENT_TEAM_REGISTERED',
      entity: 'TournamentTeam',
      entityId: registration.id,
      changesDiff: { tournamentId, teamId: data.teamId },
    });

    return registration;
  }

  static async generateFixtures(userId: string, tournamentId: string) {
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: {
        registeredTeams: { include: { team: true } },
      },
    });

    if (!tournament) throw new AppError('Tournament not found.', 404);
    if (tournament.registeredTeams.length < 2) {
      throw new AppError('At least 2 registered teams are required to generate fixtures.', 400);
    }

    const teams = tournament.registeredTeams.map((rt) => rt.team);
    const createdMatches = [];

    let matchDate = new Date(tournament.startDate);

    // Simple round robin / knockout pairing algorithm
    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        const homeTeam = teams[i];
        const awayTeam = teams[j];

        // Increment match date by 1 day for each fixture
        matchDate = new Date(matchDate.getTime() + 24 * 60 * 60 * 1000);

        const createdMatch: any = await prisma.match.create({
          data: {
            tournamentId,
            homeTeamId: homeTeam.id,
            awayTeamId: awayTeam.id,
            roundName: `Match #${createdMatches.length + 1}`,
            bracketLevel: 1,
            scheduledDate: matchDate,
            status: 'SCHEDULED',
          },
          include: {
            homeTeam: true,
            awayTeam: true,
          },
        });

        createdMatches.push(createdMatch);
      }
    }

    // Transition status to REGISTRATION_OPEN or ONGOING
    await prisma.tournament.update({
      where: { id: tournamentId },
      data: { status: TournamentStatus.ONGOING },
    });

    await AuditService.recordLog({
      userId,
      action: 'TOURNAMENT_FIXTURES_GENERATED',
      entity: 'Tournament',
      entityId: tournamentId,
      changesDiff: { matchCount: createdMatches.length },
    });

    return {
      message: `Generated ${createdMatches.length} tournament fixtures successfully!`,
      matches: createdMatches,
    };
  }
}
