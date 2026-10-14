import { prisma } from '../config/database';
import { AppError } from '../middleware/error.middleware';
import { AuditService } from './audit.service';

export class TeamService {
  static async getAllTeams(filters?: { sportId?: string; department?: string }) {
    const where: any = {};
    if (filters?.sportId) where.sportId = filters.sportId;
    if (filters?.department) where.department = filters.department;

    const teams = await prisma.team.findMany({
      where,
      include: {
        sport: { select: { id: true, name: true, category: true } },
        coach: { include: { user: { select: { id: true, name: true, email: true } } } },
        _count: {
          select: {
            members: { where: { isActive: true } },
            homeMatches: true,
            awayMatches: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return teams;
  }

  static async getTeamById(id: string) {
    const team = await prisma.team.findUnique({
      where: { id },
      include: {
        sport: true,
        coach: { include: { user: true } },
        members: {
          where: { isActive: true },
          include: {
            student: {
              include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
            },
          },
        },
        tournamentTeams: { include: { tournament: true } },
        pointsEntries: { include: { tournament: true } },
      },
    });

    if (!team) throw new AppError('Team franchise not found.', 404);
    return team;
  }

  static async createTeam(
    userId: string,
    data: {
      name: string;
      sportId: string;
      department?: string;
      coachId?: string;
      jerseyColor?: string;
      logoUrl?: string;
    }
  ) {
    const slug = `${data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')}-${Date.now().toString().slice(-4)}`;

    const team = await prisma.team.create({
      data: {
        name: data.name,
        slug,
        sportId: data.sportId,
        department: data.department,
        coachId: data.coachId,
        jerseyColor: data.jerseyColor || '#0284c7',
        logoUrl: data.logoUrl,
      },
      include: { sport: true, coach: { include: { user: true } } },
    });

    await AuditService.recordLog({
      userId,
      action: 'TEAM_CREATED',
      entity: 'Team',
      entityId: team.id,
      changesDiff: { name: data.name, department: data.department },
    });

    return team;
  }

  static async updateTeam(
    userId: string,
    id: string,
    data: {
      name?: string;
      department?: string;
      coachId?: string;
      jerseyColor?: string;
      logoUrl?: string;
    }
  ) {
    const team = await prisma.team.findUnique({ where: { id } });
    if (!team) throw new AppError('Team not found.', 404);

    const updated = await prisma.team.update({
      where: { id },
      data,
      include: { sport: true, coach: { include: { user: true } } },
    });

    await AuditService.recordLog({
      userId,
      action: 'TEAM_UPDATED',
      entity: 'Team',
      entityId: id,
      changesDiff: data,
    });

    return updated;
  }

  static async addTeamMember(
    userId: string,
    teamId: string,
    data: {
      studentId: string;
      jerseyNumber?: number;
      position?: string;
      isCaptain?: boolean;
    }
  ) {
    const team = await prisma.team.findUnique({ where: { id: teamId } });
    if (!team) throw new AppError('Team not found.', 404);

    const student = await prisma.student.findUnique({ where: { id: data.studentId } });
    if (!student) throw new AppError('Student athlete not found.', 404);

    const member = await prisma.teamMember.upsert({
      where: {
        teamId_studentId: { teamId, studentId: data.studentId },
      },
      update: {
        jerseyNumber: data.jerseyNumber,
        position: data.position,
        isCaptain: data.isCaptain || false,
        isActive: true,
      },
      create: {
        teamId,
        studentId: data.studentId,
        jerseyNumber: data.jerseyNumber,
        position: data.position,
        isCaptain: data.isCaptain || false,
        isActive: true,
      },
      include: {
        student: { include: { user: true } },
      },
    });

    await AuditService.recordLog({
      userId,
      action: 'TEAM_MEMBER_ADDED',
      entity: 'TeamMember',
      entityId: member.id,
      changesDiff: { teamId, studentId: data.studentId, jerseyNumber: data.jerseyNumber },
    });

    return member;
  }

  static async removeTeamMember(userId: string, teamId: string, memberId: string) {
    const member = await prisma.teamMember.findUnique({ where: { id: memberId } });
    if (!member || member.teamId !== teamId) throw new AppError('Team member not found.', 404);

    await prisma.teamMember.update({
      where: { id: memberId },
      data: { isActive: false },
    });

    await AuditService.recordLog({
      userId,
      action: 'TEAM_MEMBER_REMOVED',
      entity: 'TeamMember',
      entityId: memberId,
    });

    return { message: 'Player removed from squad roster.' };
  }
}
