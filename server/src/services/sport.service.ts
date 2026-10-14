import { prisma } from '../config/database';
import { AppError } from '../middleware/error.middleware';
import { SportCategory, ScoringType } from '@prisma/client';
import { AuditService } from './audit.service';

export class SportService {
  static async getAllSports() {
    const sports = await prisma.sport.findMany({
      include: {
        _count: {
          select: {
            teams: true,
            tournaments: true,
            equipment: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
    return sports;
  }

  static async getSportById(id: string) {
    const sport = await prisma.sport.findUnique({
      where: { id },
      include: {
        teams: { include: { coach: { include: { user: { select: { name: true } } } } } },
        tournaments: true,
        equipment: true,
      },
    });
    if (!sport) throw new AppError('Sport discipline not found.', 404);
    return sport;
  }

  static async createSport(
    userId: string,
    data: {
      name: string;
      category?: SportCategory;
      scoringType?: ScoringType;
      minPlayers?: number;
      maxPlayers?: number;
      benchSize?: number;
      rulesJson?: any;
    }
  ) {
    const slug = data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

    const existing = await prisma.sport.findFirst({
      where: { OR: [{ name: data.name }, { slug }] },
    });
    if (existing) throw new AppError('Sport with this name already exists.', 409);

    const sport = await prisma.sport.create({
      data: {
        name: data.name,
        slug,
        category: data.category || SportCategory.TEAM,
        scoringType: data.scoringType || ScoringType.POINTS,
        minPlayers: data.minPlayers || 1,
        maxPlayers: data.maxPlayers || 11,
        benchSize: data.benchSize || 5,
        rulesJson: data.rulesJson,
      },
    });

    await AuditService.recordLog({
      userId,
      action: 'SPORT_CREATED',
      entity: 'Sport',
      entityId: sport.id,
      changesDiff: { name: data.name, category: sport.category },
    });

    return sport;
  }

  static async updateSport(
    userId: string,
    id: string,
    data: {
      name?: string;
      category?: SportCategory;
      scoringType?: ScoringType;
      minPlayers?: number;
      maxPlayers?: number;
      benchSize?: number;
      isActive?: boolean;
    }
  ) {
    const sport = await prisma.sport.findUnique({ where: { id } });
    if (!sport) throw new AppError('Sport not found.', 404);

    const updated = await prisma.sport.update({
      where: { id },
      data,
    });

    await AuditService.recordLog({
      userId,
      action: 'SPORT_UPDATED',
      entity: 'Sport',
      entityId: id,
      changesDiff: data,
    });

    return updated;
  }

  static async deleteSport(userId: string, id: string) {
    const sport = await prisma.sport.findUnique({ where: { id } });
    if (!sport) throw new AppError('Sport not found.', 404);

    await prisma.sport.delete({ where: { id } });

    await AuditService.recordLog({
      userId,
      action: 'SPORT_DELETED',
      entity: 'Sport',
      entityId: id,
    });

    return { message: 'Sport discipline deleted successfully.' };
  }
}
