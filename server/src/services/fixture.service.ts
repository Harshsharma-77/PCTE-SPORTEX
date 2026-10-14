import { prisma } from '../config/database';
import { AppError } from '../middleware/error.middleware';
import { MatchStatus } from '@prisma/client';
import { AuditService } from './audit.service';
import { VenueService } from './venue.service';

export class FixtureService {
  static async getAllFixtures(filters?: {
    tournamentId?: string;
    status?: MatchStatus;
    venueId?: string;
    refereeId?: string;
  }) {
    const where: any = {};
    if (filters?.tournamentId) where.tournamentId = filters.tournamentId;
    if (filters?.status) where.status = filters.status;
    if (filters?.venueId) where.venueId = filters.venueId;
    if (filters?.refereeId) where.refereeId = filters.refereeId;

    const fixtures = await prisma.match.findMany({
      where,
      include: {
        tournament: { select: { id: true, name: true, sport: { select: { name: true } } } },
        homeTeam: { select: { id: true, name: true, jerseyColor: true, department: true } },
        awayTeam: { select: { id: true, name: true, jerseyColor: true, department: true } },
        venue: { select: { id: true, name: true, location: true } },
        referee: { select: { id: true, user: { select: { id: true, name: true, email: true } } } },
      },
      orderBy: { scheduledDate: 'asc' },
    });

    return fixtures;
  }

  static async createFixture(
    userId: string,
    data: {
      tournamentId: string;
      homeTeamId: string;
      awayTeamId: string;
      roundName: string;
      scheduledDate: Date;
      venueId?: string;
      refereeId?: string;
    }
  ) {
    if (data.homeTeamId === data.awayTeamId) {
      throw new AppError('Home team and away team cannot be identical.', 400);
    }

    // Check venue conflict if venue assigned
    if (data.venueId) {
      const conflict = await VenueService.checkVenueConflict(data.venueId, new Date(data.scheduledDate));
      if (conflict.hasConflict) {
        throw new AppError(
          `Venue Conflict: The selected venue already has ${conflict.conflictCount} match(es) scheduled during this time slot.`,
          409
        );
      }
    }

    const match = await prisma.match.create({
      data: {
        tournamentId: data.tournamentId,
        homeTeamId: data.homeTeamId,
        awayTeamId: data.awayTeamId,
        roundName: data.roundName,
        scheduledDate: new Date(data.scheduledDate),
        venueId: data.venueId,
        refereeId: data.refereeId,
        status: MatchStatus.SCHEDULED,
      },
      include: {
        tournament: { include: { sport: true } },
        homeTeam: true,
        awayTeam: true,
        venue: true,
        referee: { include: { user: true } },
      },
    });

    await AuditService.recordLog({
      userId,
      action: 'MATCH_FIXTURE_CREATED',
      entity: 'Match',
      entityId: match.id,
      changesDiff: {
        home: match.homeTeam.name,
        away: match.awayTeam.name,
        date: match.scheduledDate,
      },
    });

    return match;
  }

  static async updateFixture(
    userId: string,
    id: string,
    data: {
      roundName?: string;
      scheduledDate?: Date;
      venueId?: string;
      refereeId?: string;
      status?: MatchStatus;
    }
  ) {
    const match = await prisma.match.findUnique({ where: { id } });
    if (!match) throw new AppError('Match fixture not found.', 404);

    // Check venue conflict if venue or date changed
    if (data.venueId && data.scheduledDate) {
      const conflict = await VenueService.checkVenueConflict(
        data.venueId,
        new Date(data.scheduledDate),
        120,
        id
      );
      if (conflict.hasConflict) {
        throw new AppError(
          `Venue Conflict: The selected venue already has ${conflict.conflictCount} match(es) scheduled during this time slot.`,
          409
        );
      }
    }

    const updated = await prisma.match.update({
      where: { id },
      data: {
        roundName: data.roundName,
        scheduledDate: data.scheduledDate ? new Date(data.scheduledDate) : undefined,
        venueId: data.venueId,
        refereeId: data.refereeId,
        status: data.status,
      },
      include: {
        tournament: true,
        homeTeam: true,
        awayTeam: true,
        venue: true,
        referee: { include: { user: true } },
      },
    });

    await AuditService.recordLog({
      userId,
      action: 'MATCH_FIXTURE_UPDATED',
      entity: 'Match',
      entityId: id,
      changesDiff: data,
    });

    return updated;
  }

  static async deleteFixture(userId: string, id: string) {
    const match = await prisma.match.findUnique({ where: { id } });
    if (!match) throw new AppError('Match fixture not found.', 404);

    await prisma.match.delete({ where: { id } });

    await AuditService.recordLog({
      userId,
      action: 'MATCH_FIXTURE_DELETED',
      entity: 'Match',
      entityId: id,
    });

    return { message: 'Match fixture deleted successfully.' };
  }
}
