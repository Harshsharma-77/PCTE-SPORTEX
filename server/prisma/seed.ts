import {
  PrismaClient,
  UserRoleEnum,
  Gender,
  SportCategory,
  ScoringType,
  TournamentFormat,
  TournamentStatus,
  MatchStatus,
  MatchEventType,
  AttendanceStatus,
  CertificateType,
  EquipmentCondition,
  Priority,
  FeedbackCategory,
} from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting PCTE SPORTEX Comprehensive Database Seed...');

  const defaultPassword = await bcrypt.hash('Password@123', 10);
  const adminPassword = await bcrypt.hash('AdminPassword@2026', 10);

  // ---------------------------------------------------------------------------
  // 1. Seed Roles & Permissions
  // ---------------------------------------------------------------------------
  console.log('🔐 Seeding Roles & Permissions...');

  const permissionsList = [
    { code: 'users:manage', module: 'Users', description: 'Create, edit, and deactivate user accounts' },
    { code: 'users:view', module: 'Users', description: 'View user profiles and rosters' },
    { code: 'sports:manage', module: 'Sports', description: 'Configure sports rules and categories' },
    { code: 'tournaments:create', module: 'Tournaments', description: 'Create new tournaments and brackets' },
    { code: 'tournaments:manage', module: 'Tournaments', description: 'Manage tournament registrations and status' },
    { code: 'matches:schedule', module: 'Matches', description: 'Schedule matches, assign venues and referees' },
    { code: 'live_score:update', module: 'Scoring', description: 'Control live score console and record match events' },
    { code: 'attendance:mark', module: 'Attendance', description: 'Mark and submit squad attendance' },
    { code: 'certificates:issue', module: 'Certificates', description: 'Generate and sign athletic certificates' },
    { code: 'inventory:manage', module: 'Inventory', description: 'Manage sports equipment and checkout desk' },
    { code: 'feedback:manage', module: 'Feedback', description: 'Resolve student grievances and complaints' },
    { code: 'audit:view', module: 'Audit', description: 'View system audit logs and compliance history' },
  ];

  const createdPermissions: Record<string, any> = {};
  for (const perm of permissionsList) {
    const p = await prisma.permission.upsert({
      where: { code: perm.code },
      update: {},
      create: perm,
    });
    createdPermissions[perm.code] = p;
  }

  const rolesData = [
    { name: UserRoleEnum.SUPER_ADMIN, displayName: 'Super Admin (Director of Sports)', description: 'Full root access to all sports, users, and audit logs' },
    { name: UserRoleEnum.SPORTS_ADMIN, displayName: 'Sports Coordinator / Admin', description: 'Manages tournaments, scheduling, equipment, and certificates' },
    { name: UserRoleEnum.COACH, displayName: 'Team Coach / Manager', description: 'Manages team rosters, tactical lineups, and attendance' },
    { name: UserRoleEnum.STUDENT, displayName: 'Student Athlete', description: 'Participates in sports, views fixtures, receives certificates' },
    { name: UserRoleEnum.REFEREE, displayName: 'Match Official / Referee', description: 'Officiates fixtures and controls live match scoring console' },
    { name: UserRoleEnum.VIEWER, displayName: 'Guest / Spectator', description: 'Public viewer for live scoreboards and points tables' },
  ];

  const createdRoles: Record<string, any> = {};
  for (const r of rolesData) {
    const roleRecord = await prisma.role.upsert({
      where: { name: r.name },
      update: { displayName: r.displayName, description: r.description },
      create: r,
    });
    createdRoles[r.name] = roleRecord;
  }

  // Grant all permissions to SUPER_ADMIN
  for (const perm of Object.values(createdPermissions)) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: createdRoles[UserRoleEnum.SUPER_ADMIN].id,
          permissionId: perm.id,
        },
      },
      update: {},
      create: {
        roleId: createdRoles[UserRoleEnum.SUPER_ADMIN].id,
        permissionId: perm.id,
      },
    });
  }

  // ---------------------------------------------------------------------------
  // 2. Seed Users & Profiles
  // ---------------------------------------------------------------------------
  console.log('👥 Seeding Multi-Role Users...');

  // Super Admin
  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@pcte.edu.in' },
    update: { roleId: createdRoles[UserRoleEnum.SUPER_ADMIN].id, roleEnum: UserRoleEnum.SUPER_ADMIN },
    create: {
      email: 'superadmin@pcte.edu.in',
      name: 'Director of Sports PCTE',
      passwordHash: adminPassword,
      roleId: createdRoles[UserRoleEnum.SUPER_ADMIN].id,
      roleEnum: UserRoleEnum.SUPER_ADMIN,
      phone: '+919876543210',
      isVerified: true,
    },
  });

  // Sports Admin
  const sportsAdmin = await prisma.user.upsert({
    where: { email: 'sportsadmin@pcte.edu.in' },
    update: { roleId: createdRoles[UserRoleEnum.SPORTS_ADMIN].id, roleEnum: UserRoleEnum.SPORTS_ADMIN },
    create: {
      email: 'sportsadmin@pcte.edu.in',
      name: 'Prof. Rajesh Kumar (Sports Coordinator)',
      passwordHash: defaultPassword,
      roleId: createdRoles[UserRoleEnum.SPORTS_ADMIN].id,
      roleEnum: UserRoleEnum.SPORTS_ADMIN,
      phone: '+919876543211',
      isVerified: true,
    },
  });

  // Coaches
  const coachUser1 = await prisma.user.upsert({
    where: { email: 'coach.football@pcte.edu.in' },
    update: { roleId: createdRoles[UserRoleEnum.COACH].id, roleEnum: UserRoleEnum.COACH },
    create: {
      email: 'coach.football@pcte.edu.in',
      name: 'Coach Vikram Singh',
      passwordHash: defaultPassword,
      roleId: createdRoles[UserRoleEnum.COACH].id,
      roleEnum: UserRoleEnum.COACH,
      phone: '+919876543212',
      isVerified: true,
      coach: {
        create: {
          specialization: 'Football',
          qualification: 'AFC "B" License Coach',
          experienceYears: 8,
          bio: 'Head Coach for PCTE Football Team. Former State Player.',
        },
      },
    },
    include: { coach: true },
  });

  const coachUser2 = await prisma.user.upsert({
    where: { email: 'coach.cricket@pcte.edu.in' },
    update: { roleId: createdRoles[UserRoleEnum.COACH].id, roleEnum: UserRoleEnum.COACH },
    create: {
      email: 'coach.cricket@pcte.edu.in',
      name: 'Coach Harpreet Singh',
      passwordHash: defaultPassword,
      roleId: createdRoles[UserRoleEnum.COACH].id,
      roleEnum: UserRoleEnum.COACH,
      phone: '+919876543213',
      isVerified: true,
      coach: {
        create: {
          specialization: 'Cricket',
          qualification: 'BCCI Level 1 Certified Coach',
          experienceYears: 10,
          bio: 'Head Coach for PCTE Cricket Team.',
        },
      },
    },
    include: { coach: true },
  });

  // Referee
  const refereeUser = await prisma.user.upsert({
    where: { email: 'referee.sharma@pcte.edu.in' },
    update: { roleId: createdRoles[UserRoleEnum.REFEREE].id, roleEnum: UserRoleEnum.REFEREE },
    create: {
      email: 'referee.sharma@pcte.edu.in',
      name: 'Official Aman Sharma',
      passwordHash: defaultPassword,
      roleId: createdRoles[UserRoleEnum.REFEREE].id,
      roleEnum: UserRoleEnum.REFEREE,
      phone: '+919876543214',
      isVerified: true,
      referee: {
        create: {
          licenseNumber: 'AIFF-REF-2024-88',
          officiatingLevel: 'STATE',
          certifiedSports: ['Football', 'Basketball', 'Badminton'],
        },
      },
    },
    include: { referee: true },
  });

  // Students / Athletes
  const studentsSeed = [
    { email: 'harsh.cse@pcte.edu.in', name: 'Harsh Sharma', roll: '2329263', dept: 'CSE', sem: 6, batch: 2023, gender: Gender.MALE },
    { email: 'rahul.it@pcte.edu.in', name: 'Rahul Singh', roll: '2329264', dept: 'IT', sem: 6, batch: 2023, gender: Gender.MALE },
    { email: 'khushi.bba@pcte.edu.in', name: 'Khushi Sharma', roll: '2329265', dept: 'BBA', sem: 4, batch: 2024, gender: Gender.FEMALE },
    { email: 'aman.me@pcte.edu.in', name: 'Aman Deep', roll: '2329266', dept: 'ME', sem: 6, batch: 2023, gender: Gender.MALE },
    { email: 'simran.pharm@pcte.edu.in', name: 'Simran Kaur', roll: '2329267', dept: 'BPHARM', sem: 4, batch: 2024, gender: Gender.FEMALE },
  ];

  const createdStudents: any[] = [];
  for (const s of studentsSeed) {
    const studentUser = await prisma.user.upsert({
      where: { email: s.email },
      update: { roleId: createdRoles[UserRoleEnum.STUDENT].id, roleEnum: UserRoleEnum.STUDENT },
      create: {
        email: s.email,
        name: s.name,
        passwordHash: defaultPassword,
        roleId: createdRoles[UserRoleEnum.STUDENT].id,
        roleEnum: UserRoleEnum.STUDENT,
        isVerified: true,
        student: {
          create: {
            rollNumber: s.roll,
            department: s.dept,
            semester: s.sem,
            batchYear: s.batch,
            gender: s.gender,
            bloodGroup: 'B+',
          },
        },
      },
      include: { student: true },
    });
    createdStudents.push(studentUser);
  }

  // ---------------------------------------------------------------------------
  // 3. Seed Sports & Venues
  // ---------------------------------------------------------------------------
  console.log('⚽ Seeding Sports Catalog & Venues...');

  const sports = [
    {
      name: 'Football',
      slug: 'football',
      category: SportCategory.TEAM,
      scoringType: ScoringType.GOALS,
      minPlayers: 7,
      maxPlayers: 11,
      benchSize: 5,
      rulesJson: { halves: 2, halfDurationMin: 45, pointsWin: 3, pointsDraw: 1, pointsLoss: 0 },
    },
    {
      name: 'Cricket',
      slug: 'cricket',
      category: SportCategory.TEAM,
      scoringType: ScoringType.RUNS_WICKETS,
      minPlayers: 11,
      maxPlayers: 11,
      benchSize: 4,
      rulesJson: { overs: 20, wicketsMax: 10, pointsWin: 2, pointsLoss: 0 },
    },
    {
      name: 'Basketball',
      slug: 'basketball',
      category: SportCategory.TEAM,
      scoringType: ScoringType.POINTS,
      minPlayers: 5,
      maxPlayers: 5,
      benchSize: 7,
      rulesJson: { quarters: 4, quarterDurationMin: 10, pointsWin: 2, pointsLoss: 0 },
    },
    {
      name: 'Badminton',
      slug: 'badminton',
      category: SportCategory.RACQUET,
      scoringType: ScoringType.SETS,
      minPlayers: 1,
      maxPlayers: 2,
      benchSize: 1,
      rulesJson: { setsToWin: 2, pointsPerSet: 21 },
    },
    {
      name: 'Volleyball',
      slug: 'volleyball',
      category: SportCategory.TEAM,
      scoringType: ScoringType.SETS,
      minPlayers: 6,
      maxPlayers: 6,
      benchSize: 6,
      rulesJson: { setsToWin: 3, pointsPerSet: 25 },
    },
  ];

  const createdSports: Record<string, any> = {};
  for (const sp of sports) {
    const sport = await prisma.sport.upsert({
      where: { slug: sp.slug },
      update: {},
      create: sp,
    });
    createdSports[sp.slug] = sport;
  }

  const venues = [
    {
      name: 'PCTE Main Sports Ground',
      location: 'Campus II Sports Complex',
      capacity: 1500,
      supportedSports: ['Football', 'Cricket', 'Athletics'],
      isIndoor: false,
    },
    {
      name: 'Indoor Badminton Arena Court 1',
      location: 'Auditorium Complex 1st Floor',
      capacity: 300,
      supportedSports: ['Badminton', 'Table Tennis'],
      isIndoor: true,
    },
    {
      name: 'PCTE Floodlit Basketball Court',
      location: 'Behind Block B Campus II',
      capacity: 500,
      supportedSports: ['Basketball'],
      isIndoor: false,
    },
  ];

  const createdVenues: any[] = [];
  for (const v of venues) {
    const venue = await prisma.venue.create({
      data: v,
    }).catch(() => prisma.venue.findFirst({ where: { name: v.name } }));
    if (venue) createdVenues.push(venue);
  }

  // ---------------------------------------------------------------------------
  // 4. Seed Teams, Squads, Tournaments & Matches
  // ---------------------------------------------------------------------------
  console.log('🏆 Seeding Teams, Tournaments & Matches...');

  const fbSport = createdSports['football'];
  let team1: any, team2: any;

  if (fbSport && coachUser1.coach) {
    team1 = await prisma.team.upsert({
      where: { slug: 'cse-cyber-strikers' },
      update: {},
      create: {
        name: 'CSE Cyber Strikers',
        slug: 'cse-cyber-strikers',
        sportId: fbSport.id,
        department: 'CSE',
        coachId: coachUser1.coach.id,
        jerseyColor: '#1E40AF',
      },
    });

    team2 = await prisma.team.upsert({
      where: { slug: 'me-mechanical-titans' },
      update: {},
      create: {
        name: 'ME Mechanical Titans',
        slug: 'me-mechanical-titans',
        sportId: fbSport.id,
        department: 'ME',
        jerseyColor: '#B91C1C',
      },
    });

    const harsh = createdStudents.find((s) => s.email === 'harsh.cse@pcte.edu.in');
    const rahul = createdStudents.find((s) => s.email === 'rahul.it@pcte.edu.in');

    if (harsh?.student) {
      await prisma.teamMember.upsert({
        where: { teamId_studentId: { teamId: team1.id, studentId: harsh.student.id } },
        update: {},
        create: {
          teamId: team1.id,
          studentId: harsh.student.id,
          jerseyNumber: 10,
          position: 'Forward / Captain',
          isCaptain: true,
        },
      });
    }

    if (rahul?.student) {
      await prisma.teamMember.upsert({
        where: { teamId_studentId: { teamId: team1.id, studentId: rahul.student.id } },
        update: {},
        create: {
          teamId: team1.id,
          studentId: rahul.student.id,
          jerseyNumber: 7,
          position: 'Midfielder',
        },
      });
    }

    // Seed Tournament
    const tournament = await prisma.tournament.upsert({
      where: { slug: 'pcte-athlos-2026-football' },
      update: {},
      create: {
        name: 'PCTE ATHLOS 2026 Football Trophy',
        slug: 'pcte-athlos-2026-football',
        academicYear: '2025-2026',
        sportId: fbSport.id,
        format: TournamentFormat.KNOCKOUT,
        status: TournamentStatus.ONGOING,
        startDate: new Date('2026-09-01T09:00:00Z'),
        endDate: new Date('2026-09-15T18:00:00Z'),
        description: 'Annual Inter-Department Football Championship featuring 8 departmental squads.',
      },
    });

    // Register Teams in Tournament
    await prisma.tournamentTeam.upsert({
      where: { tournamentId_teamId: { tournamentId: tournament.id, teamId: team1.id } },
      update: {},
      create: { tournamentId: tournament.id, teamId: team1.id, seed: 1, groupName: 'Group A' },
    });

    await prisma.tournamentTeam.upsert({
      where: { tournamentId_teamId: { tournamentId: tournament.id, teamId: team2.id } },
      update: {},
      create: { tournamentId: tournament.id, teamId: team2.id, seed: 2, groupName: 'Group A' },
    });

    // Seed Scheduled Match
    const mainVenue = createdVenues[0];
    const match = await prisma.match.create({
      data: {
        tournamentId: tournament.id,
        roundName: 'Quarter Final 1',
        bracketLevel: 1,
        homeTeamId: team1.id,
        awayTeamId: team2.id,
        venueId: mainVenue?.id,
        refereeId: refereeUser.referee?.id,
        scheduledDate: new Date('2026-09-02T15:30:00Z'),
        status: MatchStatus.SCHEDULED,
        homeScore: 0,
        awayScore: 0,
      },
    }).catch(() => null);

    if (match && harsh?.student) {
      // Seed Sample Match Event
      await prisma.matchEvent.create({
        data: {
          matchId: match.id,
          eventType: MatchEventType.GOAL,
          timestampSec: 1420, // 23rd minute
          period: '1st Half',
          teamId: team1.id,
          studentId: harsh.student.id,
          scoreValue: 1,
          commentary: 'GOAL! Harsh Sharma curls a sensational free-kick into the top right corner!',
        },
      }).catch(() => null);
    }
  }

  // ---------------------------------------------------------------------------
  // 5. Seed Equipment, Announcements & Audit Logs
  // ---------------------------------------------------------------------------
  console.log('📦 Seeding Equipment, Announcements & Audit Trail...');

  if (fbSport) {
    await prisma.equipment.upsert({
      where: { sku: 'EQ-FB-001' },
      update: {},
      create: {
        name: 'Nivia Classic Professional Football (Size 5)',
        sku: 'EQ-FB-001',
        sportId: fbSport.id,
        totalQuantity: 20,
        availableQuantity: 18,
        condition: EquipmentCondition.GOOD,
        storageLocation: 'Sports Room Locker A1',
      },
    });
  }

  await prisma.announcement.create({
    data: {
      title: 'PCTE ATHLOS 2026 Registrations Open!',
      content: 'Departmental sports coordinators must submit official athlete rosters for Football, Cricket, and Basketball before September 1st.',
      priority: Priority.HIGH,
      authorId: superAdmin.id,
      targetAudience: 'ALL',
      isPinned: true,
    },
  }).catch(() => null);

  await prisma.auditLog.create({
    data: {
      userId: superAdmin.id,
      action: 'SYSTEM_BOOTSTRAP_SEED',
      entity: 'System',
      ipAddress: '127.0.0.1',
      userAgent: 'SPORTEX-Seeder/1.0',
      changesDiff: { status: 'Database seeded with default roles, sports, and departments' },
    },
  });

  console.log(`
============================================================
✅ PCTE SPORTEX Database Seeding Completed Successfully!
👤 Super Admin: superadmin@pcte.edu.in / AdminPassword@2026
👤 Sports Admin: sportsadmin@pcte.edu.in / Password@123
👤 Coach: coach.football@pcte.edu.in / Password@123
👤 Referee: referee.sharma@pcte.edu.in / Password@123
👤 Student: harsh.cse@pcte.edu.in / Password@123
============================================================
  `);
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
