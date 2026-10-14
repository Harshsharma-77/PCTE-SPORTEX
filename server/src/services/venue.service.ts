import { prisma } from '../config/database';
import { AppError } from '../middleware/error.middleware';
import { AuditService } from './audit.service';

export class VenueService {
  /**
   * 1. Get All Campus Venues & Arenas
   */
  static async getAllVenues() {
    const venues = await prisma.venue.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: {
            matches: {
              where: { status: { in: ['SCHEDULED', 'LIVE', 'WARMUP', 'PAUSED'] } },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return venues.map((v) => ({
      ...v,
      activeMatchesCount: v._count.matches,
    }));
  }

  /**
   * 2. Create Venue / Arena
   */
  static async createVenue(
    userId: string,
    data: {
      name: string;
      location: string;
      capacity?: number;
      supportedSports?: string[];
      isIndoor?: boolean;
      notes?: string;
    }
  ) {
    const venue = await prisma.venue.create({
      data: {
        name: data.name,
        location: data.location,
        capacity: data.capacity || 200,
        supportedSports: data.supportedSports || ['All Sports'],
        isIndoor: data.isIndoor || false,
        notes: data.notes,
      },
    });

    await AuditService.recordLog({
      userId,
      action: 'VENUE_CREATED',
      entity: 'Venue',
      entityId: venue.id,
      changesDiff: { name: data.name, location: data.location },
    });

    return venue;
  }

  /**
   * 3. Check Venue Schedule Conflicts (Conflict Detection Engine)
   */
  static async checkVenueConflict(
    venueId: string,
    scheduledDate: Date,
    durationMinutes = 120,
    excludeMatchId?: string
  ) {
    const venue = await prisma.venue.findUnique({ where: { id: venueId } });
    if (!venue) throw new AppError('Venue not found.', 404);

    const startTime = new Date(scheduledDate);
    const windowStart = new Date(startTime.getTime() - durationMinutes * 60 * 1000);
    const windowEnd = new Date(startTime.getTime() + durationMinutes * 60 * 1000);

    const conflictingMatches = await prisma.match.findMany({
      where: {
        venueId,
        id: excludeMatchId ? { not: excludeMatchId } : undefined,
        status: { in: ['SCHEDULED', 'LIVE', 'WARMUP', 'PAUSED'] },
        scheduledDate: {
          gte: windowStart,
          lte: windowEnd,
        },
      },
      include: {
        homeTeam: { select: { name: true } },
        awayTeam: { select: { name: true } },
        tournament: { select: { name: true } },
      },
    });

    return {
      hasConflict: conflictingMatches.length > 0,
      conflictCount: conflictingMatches.length,
      conflictingMatches: conflictingMatches.map((m) => ({
        id: m.id,
        matchTitle: `${m.homeTeam.name} vs ${m.awayTeam.name}`,
        roundName: m.roundName,
        tournamentName: m.tournament.name,
        scheduledDate: m.scheduledDate,
      })),
    };
  }

  /**
   * 4. Get Detailed Venue Schedule
   */
  static async getVenueSchedule(venueId: string) {
    const venue = await prisma.venue.findUnique({
      where: { id: venueId },
      include: {
        matches: {
          where: { status: { not: 'CANCELLED' } },
          include: {
            homeTeam: { select: { name: true, jerseyColor: true } },
            awayTeam: { select: { name: true, jerseyColor: true } },
            tournament: { select: { name: true, sport: { select: { name: true } } } },
          },
          orderBy: { scheduledDate: 'asc' },
        },
      },
    });

    if (!venue) throw new AppError('Venue not found.', 404);
    return venue;
  }
}
