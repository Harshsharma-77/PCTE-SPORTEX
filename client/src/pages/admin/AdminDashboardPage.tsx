import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy,
  Users,
  Layers,
  Calendar,
  Zap,
  Activity,
  Plus,
  RefreshCw,
  Clock,
  ShieldAlert,
  GraduationCap,
  Bell,
  MapPin,
  CheckCircle2,
  TrendingUp,
  Shield,
  Sparkles,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { ErrorState } from '../../components/ui/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';
import { AnimatedCounter } from '../../components/common/AnimatedCounter';
import { useToast } from '../../context/ToastContext';
import { dashboardApi } from '../../services/dashboardApi';
import { AdminSummaryData, AdminChartsData, QuickLookupsData } from '../../types/dashboard';

export const AdminDashboardPage: React.FC = () => {
  const toast = useToast();

  // Data States
  const [summary, setSummary] = useState<AdminSummaryData | null>(null);
  const [charts, setCharts] = useState<AdminChartsData | null>(null);
  const [lookups, setLookups] = useState<QuickLookupsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Quick Action Modal States
  const [activeModal, setActiveModal] = useState<
    'sport' | 'team' | 'player' | 'tournament' | 'match' | 'announcement' | null
  >(null);
  const [modalSubmitting, setModalSubmitting] = useState(false);

  // Quick Action Form States
  const [sportName, setSportName] = useState('');
  const [sportCategory, setSportCategory] = useState('TEAM');
  const [sportScoring, setSportScoring] = useState('GOALS');
  const [sportMinPlayers, setSportMinPlayers] = useState(11);
  const [sportMaxPlayers, setSportMaxPlayers] = useState(18);

  const [teamName, setTeamName] = useState('');
  const [teamSportId, setTeamSportId] = useState('');
  const [teamDept, setTeamDept] = useState('CSE');
  const [teamCoachId, setTeamCoachId] = useState('');
  const [teamColor, setTeamColor] = useState('#0284c7');

  const [playerStudentId, setPlayerStudentId] = useState('');
  const [playerTeamId, setPlayerTeamId] = useState('');
  const [playerJersey, setPlayerJersey] = useState('');
  const [playerPosition, setPlayerPosition] = useState('');
  const [playerIsCaptain, setPlayerIsCaptain] = useState(false);

  const [tournName, setTournName] = useState('');
  const [tournSportId, setTournSportId] = useState('');
  const [tournYear, setTournYear] = useState('2025-2026');
  const [tournFormat, setTournFormat] = useState('KNOCKOUT');
  const [tournStartDate, setTournStartDate] = useState('');
  const [tournEndDate, setTournEndDate] = useState('');
  const [tournMaxTeams, setTournMaxTeams] = useState(8);

  const [matchTournId, setMatchTournId] = useState('');
  const [matchHomeTeamId, setMatchHomeTeamId] = useState('');
  const [matchAwayTeamId, setMatchAwayTeamId] = useState('');
  const [matchRound, setMatchRound] = useState('Quarter Final');
  const [matchDate, setMatchDate] = useState('');
  const [matchVenueId, setMatchVenueId] = useState('');

  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annPriority, setAnnPriority] = useState('MEDIUM');
  const [annAudience, setAnnAudience] = useState('ALL');
  const [annPinned, setAnnPinned] = useState(false);

  const fetchDashboardData = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    setError(null);
    try {
      const [sumData, chartData, lookData] = await Promise.all([
        dashboardApi.getAdminSummary(),
        dashboardApi.getAdminCharts(),
        dashboardApi.getQuickLookups(),
      ]);

      setSummary(sumData);
      setCharts(chartData);
      setLookups(lookData);

      // Default first select options
      if (lookData.sports.length > 0 && !teamSportId) setTeamSportId(lookData.sports[0].id);
      if (lookData.sports.length > 0 && !tournSportId) setTournSportId(lookData.sports[0].id);
      if (lookData.teams.length > 0 && !playerTeamId) setPlayerTeamId(lookData.teams[0].id);
      if (lookData.students.length > 0 && !playerStudentId) setPlayerStudentId(lookData.students[0].id);
      if (lookData.tournaments.length > 0 && !matchTournId) setMatchTournId(lookData.tournaments[0].id);
      if (lookData.teams.length >= 2) {
        if (!matchHomeTeamId) setMatchHomeTeamId(lookData.teams[0].id);
        if (!matchAwayTeamId) setMatchAwayTeamId(lookData.teams[1].id);
      }
    } catch (err: any) {
      console.error('Failed to load admin dashboard:', err);
      setError(err.response?.data?.message || err.message || 'Failed to connect to database.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [teamSportId, tournSportId, playerTeamId, playerStudentId, matchTournId, matchHomeTeamId, matchAwayTeamId]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchDashboardData(false);
    toast.info('Synchronizing live dashboard statistics from database...');
  };

  // Quick Action Handlers
  const handleAddSport = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalSubmitting(true);
    try {
      await dashboardApi.quickAddSport({
        name: sportName,
        category: sportCategory,
        scoringType: sportScoring,
        minPlayers: Number(sportMinPlayers),
        maxPlayers: Number(sportMaxPlayers),
      });
      toast.success(`Sport "${sportName}" created successfully!`);
      setActiveModal(null);
      setSportName('');
      fetchDashboardData(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to add sport');
    } finally {
      setModalSubmitting(false);
    }
  };

  const handleAddTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalSubmitting(true);
    try {
      await dashboardApi.quickAddTeam({
        name: teamName,
        sportId: teamSportId,
        department: teamDept,
        coachId: teamCoachId || undefined,
        jerseyColor: teamColor,
      });
      toast.success(`Team "${teamName}" registered successfully!`);
      setActiveModal(null);
      setTeamName('');
      fetchDashboardData(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to create team');
    } finally {
      setModalSubmitting(false);
    }
  };

  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalSubmitting(true);
    try {
      await dashboardApi.quickAddPlayer({
        studentId: playerStudentId,
        teamId: playerTeamId,
        jerseyNumber: playerJersey ? Number(playerJersey) : undefined,
        position: playerPosition,
        isCaptain: playerIsCaptain,
      });
      toast.success('Player enrolled into team squad roster!');
      setActiveModal(null);
      setPlayerJersey('');
      setPlayerPosition('');
      setPlayerIsCaptain(false);
      fetchDashboardData(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to add player');
    } finally {
      setModalSubmitting(false);
    }
  };

  const handleCreateTournament = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalSubmitting(true);
    try {
      await dashboardApi.quickCreateTournament({
        name: tournName,
        sportId: tournSportId,
        academicYear: tournYear,
        format: tournFormat,
        startDate: tournStartDate,
        endDate: tournEndDate,
        maxTeams: Number(tournMaxTeams),
      });
      toast.success(`Tournament "${tournName}" created!`);
      setActiveModal(null);
      setTournName('');
      fetchDashboardData(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to create tournament');
    } finally {
      setModalSubmitting(false);
    }
  };

  const handleScheduleMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalSubmitting(true);
    try {
      await dashboardApi.quickScheduleMatch({
        tournamentId: matchTournId,
        homeTeamId: matchHomeTeamId,
        awayTeamId: matchAwayTeamId,
        roundName: matchRound,
        scheduledDate: matchDate,
        venueId: matchVenueId || undefined,
      });
      toast.success('Match fixture scheduled successfully!');
      setActiveModal(null);
      fetchDashboardData(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to schedule match');
    } finally {
      setModalSubmitting(false);
    }
  };

  const handlePublishAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalSubmitting(true);
    try {
      await dashboardApi.quickPublishAnnouncement({
        title: annTitle,
        content: annContent,
        priority: annPriority,
        targetAudience: annAudience,
        isPinned: annPinned,
      });
      toast.success('Announcement broadcasted to campus portal!');
      setActiveModal(null);
      setAnnTitle('');
      setAnnContent('');
      fetchDashboardData(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to publish announcement');
    } finally {
      setModalSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Athletic Command Center"
          subtitle="Real-time campus sports operations, tournament telemetry, and management."
          badge={<Badge variant="success">Directorate Online</Badge>}
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} variant="card" height={110} />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton variant="card" height={320} className="lg:col-span-2" />
          <Skeleton variant="card" height={320} />
        </div>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Athletic Command Center"
          subtitle="Real-time campus sports operations, tournament telemetry, and management."
        />
        <ErrorState
          title="Database Synchronization Error"
          message={error || 'Could not load summary metrics.'}
          onRetry={() => fetchDashboardData(true)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 1. Header with Refresh & Quick Actions */}
      <PageHeader
        title="Athletic Command Center"
        subtitle="Live PostgreSQL-connected operations, active tournament brackets, and match telemetry."
        badge={
          <Badge variant="success" size="sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1" /> Live DB Sync
          </Badge>
        }
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              isLoading={isRefreshing}
              leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />}
            >
              Sync DB
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={() => setActiveModal('match')}
              leftIcon={<Calendar className="w-3.5 h-3.5" />}
            >
              Schedule Match
            </Button>

            <Button
              variant="glow"
              size="sm"
              onClick={() => setActiveModal('tournament')}
              leftIcon={<Trophy className="w-3.5 h-3.5" />}
            >
              Create Tournament
            </Button>
          </div>
        }
      />

      {/* 2. Key Metrics Cards Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <Card variant="glass" className="p-4">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Athletes</span>
            <Users className="w-4 h-4 text-sportex-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-display">
            <AnimatedCounter value={summary.metrics.totalAthletes} />
          </div>
          <p className="text-[10px] text-emerald-400 font-semibold mt-0.5">Verified Students</p>
        </Card>

        <Card variant="default" className="p-4">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Teams</span>
            <Shield className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-display">
            <AnimatedCounter value={summary.metrics.totalTeams} />
          </div>
          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Active Squads</p>
        </Card>

        <Card variant="default" className="p-4">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Sports</span>
            <Layers className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-display">
            <AnimatedCounter value={summary.metrics.totalSports} />
          </div>
          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Varsity Catalog</p>
        </Card>

        <Card variant="glow" className="p-4">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider">Tournaments</span>
            <Trophy className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-display">
            <AnimatedCounter value={summary.metrics.activeTournaments} />
          </div>
          <p className="text-[10px] text-amber-400 font-semibold mt-0.5">Active / Ongoing</p>
        </Card>

        <Card variant="default" className="p-4">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider">Upcoming</span>
            <Calendar className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-display">
            <AnimatedCounter value={summary.metrics.upcomingMatches} />
          </div>
          <p className="text-[10px] text-purple-400 font-semibold mt-0.5">Scheduled Fixtures</p>
        </Card>

        <Card variant="interactive" className="p-4" onClick={() => setActiveModal('match')}>
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider">Matches Today</span>
            <Zap className="w-4 h-4 text-rose-400 animate-pulse" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-400 font-display">
            <AnimatedCounter value={summary.metrics.matchesToday} />
          </div>
          <p className="text-[10px] text-rose-300 font-semibold mt-0.5">Live Fixture Feed</p>
        </Card>
      </div>

      {/* 3. Quick Action Launchpad Bar */}
      <Card variant="default" className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-sportex-400" /> Quick Administrative Actions
          </h3>
          <span className="text-[10px] text-slate-500 font-mono">6 Workflows</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs justify-center"
            onClick={() => setActiveModal('sport')}
            leftIcon={<Plus className="w-3.5 h-3.5 text-sportex-400" />}
          >
            Add Sport
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs justify-center"
            onClick={() => setActiveModal('team')}
            leftIcon={<Shield className="w-3.5 h-3.5 text-cyan-400" />}
          >
            Add Team
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs justify-center"
            onClick={() => setActiveModal('player')}
            leftIcon={<Users className="w-3.5 h-3.5 text-emerald-400" />}
          >
            Add Player
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs justify-center"
            onClick={() => setActiveModal('tournament')}
            leftIcon={<Trophy className="w-3.5 h-3.5 text-amber-400" />}
          >
            Create Tournament
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs justify-center"
            onClick={() => setActiveModal('match')}
            leftIcon={<Calendar className="w-3.5 h-3.5 text-purple-400" />}
          >
            Schedule Match
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs justify-center"
            onClick={() => setActiveModal('announcement')}
            leftIcon={<Bell className="w-3.5 h-3.5 text-rose-400" />}
          >
            Publish Notice
          </Button>
        </div>
      </Card>

      {/* 4. Pending Actions Alerts Strip */}
      {summary.pendingActions.totalPending > 0 && (
        <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-amber-300">
            <ShieldAlert className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <span>
              <strong className="font-bold text-white">{summary.pendingActions.totalPending} Pending Administrative Actions</strong>:{' '}
              {summary.pendingActions.pendingFeedback} Grievances • {summary.pendingActions.overdueEquipment} Overdue Gear Issues • {summary.pendingActions.unassignedMatches} Unassigned Matches
            </span>
          </div>
          <Badge variant="warning" size="sm">
            Requires Attention
          </Badge>
        </div>
      )}

      {/* 5. Charts & Analytics Grid */}
      {charts && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Athlete Department Breakdown (6 cols) */}
          <Card variant="glass" className="lg:col-span-6 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white">Athlete Distribution by Department</h3>
                <p className="text-xs text-slate-400">Enrolled student athletes per academic department</p>
              </div>
              <GraduationCap className="w-5 h-5 text-sportex-400" />
            </div>

            <div className="space-y-3 mt-4">
              {charts.athleteDistribution.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No registered athletes found in database.</p>
              ) : (
                charts.athleteDistribution.map((dept, idx) => {
                  const maxVal = Math.max(...charts.athleteDistribution.map((d) => d.count), 1);
                  const percentage = Math.round((dept.count / maxVal) * 100);
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-200">{dept.department}</span>
                        <span className="font-mono text-sportex-400">{dept.count} Athletes</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.6, delay: idx * 0.1 }}
                          className="h-full bg-gradient-to-r from-sportex-600 to-cyan-400 rounded-full"
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>

          {/* Sport Participation & Teams (6 cols) */}
          <Card variant="glass" className="lg:col-span-6 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white">Sport Participation Breakdown</h3>
                <p className="text-xs text-slate-400">Franchises and tournaments per sport discipline</p>
              </div>
              <Layers className="w-5 h-5 text-cyan-400" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
              {charts.sportParticipation.map((sp) => (
                <div
                  key={sp.id}
                  className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-xs font-bold text-white">{sp.sport}</h4>
                    <p className="text-[10px] text-slate-400 font-mono uppercase">{sp.category}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-cyan-400 font-mono">{sp.teamsCount} Teams</span>
                    <p className="text-[10px] text-slate-500">{sp.tournamentsCount} Tournaments</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Team Performance Leaderboard (8 cols) */}
          <Card variant="default" className="lg:col-span-8 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white">Top Performing Franchises</h3>
                <p className="text-xs text-slate-400">Ranked by tournament points table telemetry</p>
              </div>
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                    <th className="pb-2">Team</th>
                    <th className="pb-2">Sport</th>
                    <th className="pb-2 text-center">P</th>
                    <th className="pb-2 text-center">W</th>
                    <th className="pb-2 text-center">L</th>
                    <th className="pb-2 text-center">Win Rate</th>
                    <th className="pb-2 text-right">Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {charts.teamLeaderboard.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-4 text-center text-slate-500 italic">
                        No team matches recorded yet in points table.
                      </td>
                    </tr>
                  ) : (
                    charts.teamLeaderboard.map((team, idx) => (
                      <tr key={team.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 font-bold text-white flex items-center gap-2">
                          <span className="text-xs font-mono text-slate-500">#{idx + 1}</span>
                          <span>{team.teamName}</span>
                          <span className="text-[10px] text-slate-400 font-normal">({team.department})</span>
                        </td>
                        <td className="py-3 text-slate-300">{team.sport}</td>
                        <td className="py-3 text-center font-mono">{team.played}</td>
                        <td className="py-3 text-center font-mono text-emerald-400">{team.won}</td>
                        <td className="py-3 text-center font-mono text-rose-400">{team.lost}</td>
                        <td className="py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-16 h-1.5 rounded-full bg-slate-950 overflow-hidden">
                              <div
                                className="h-full bg-emerald-500 rounded-full"
                                style={{ width: `${team.winRate}%` }}
                              />
                            </div>
                            <span className="font-mono text-[10px] text-slate-300">{team.winRate}%</span>
                          </div>
                        </td>
                        <td className="py-3 text-right font-mono font-bold text-sportex-400">{team.points} pts</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Attendance Health Breakdown (4 cols) */}
          <Card variant="default" className="lg:col-span-4 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-bold text-white">Attendance Telemetry</h3>
                <Activity className="w-5 h-5 text-purple-400" />
              </div>
              <p className="text-xs text-slate-400 mb-4">Training session compliance rate</p>

              <div className="space-y-3">
                {charts.attendanceBreakdown.map((att, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800"
                  >
                    <span className="text-xs font-semibold text-slate-300">{att.status}</span>
                    <span className="text-xs font-mono font-bold text-white">{att.count} Records</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Updated via Coach Portal</span>
              <Badge variant="purple" size="sm">
                Ledger Active
              </Badge>
            </div>
          </Card>
        </div>
      )}

      {/* 6. Operational Feeds (2 columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Matches Today & Upcoming Fixtures (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          <Card variant="glass" className="p-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-bold text-white">Matches Today & Fixtures</h3>
              </div>
              <span className="text-xs font-mono text-purple-300">
                {summary.matchesToday.length} Scheduled Today
              </span>
            </div>

            {summary.matchesToday.length === 0 ? (
              <div className="text-center py-6">
                <EmptyState
                  title="No Fixtures Scheduled Today"
                  description="Check upcoming tournament schedules or create a new fixture."
                  actionLabel="Schedule Fixture"
                  onAction={() => setActiveModal('match')}
                />
              </div>
            ) : (
              <div className="space-y-3">
                {summary.matchesToday.map((match) => (
                  <div
                    key={match.id}
                    className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 hover:border-purple-500/40 transition-colors"
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
                      <span className="font-semibold text-purple-400">{match.tournament.name}</span>
                      <Badge variant="warning" size="sm">
                        {match.status}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between my-2">
                      <span className="text-sm font-bold text-white">{match.homeTeam.name}</span>
                      <span className="text-xs font-mono font-black text-slate-400 px-2 py-1 rounded bg-slate-900 border border-slate-800">
                        VS
                      </span>
                      <span className="text-sm font-bold text-white">{match.awayTeam.name}</span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-900">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-500" /> {match.venue?.name || 'Main Stadium'}
                      </span>
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3 text-slate-500" /> {new Date(match.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Recent Completed Results */}
          <Card variant="default" className="p-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Recent Match Results</h3>
              </div>
              <span className="text-xs text-slate-400">Last 5 Matches</span>
            </div>

            {summary.recentResults.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-4 text-center">No completed match results yet.</p>
            ) : (
              <div className="space-y-2.5">
                {summary.recentResults.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-white">
                        <span>{r.homeTeam.name}</span>
                        <span className="font-mono text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-800">
                          {r.homeScore} - {r.awayScore}
                        </span>
                        <span>{r.awayTeam.name}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {r.tournament.sport.name} • {r.tournament.name}
                      </p>
                    </div>

                    {r.winnerTeam && (
                      <Badge variant="success" size="sm">
                        Winner: {r.winnerTeam.name}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right: Recent Registrations & Announcements (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Recent Registrations */}
          <Card variant="glass" className="p-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-sportex-400" />
                <h3 className="text-base font-bold text-white">Recent Athlete Sign-Ups</h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">Latest 6</span>
            </div>

            <div className="space-y-2.5">
              {summary.recentRegistrations.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-4 text-center">No student athletes registered yet.</p>
              ) : (
                summary.recentRegistrations.map((st) => (
                  <div
                    key={st.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-sportex-500/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar name={st.name} size="sm" isOnline={st.isEligible} />
                      <div>
                        <p className="text-xs font-bold text-white">{st.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          Roll: {st.rollNumber} • {st.department} (Sem {st.semester})
                        </p>
                      </div>
                    </div>

                    <Badge variant="info" size="sm">
                      {st.primarySport}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Announcements Feed */}
          <Card variant="default" className="p-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Campus Sports Bulletins</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-sportex-400"
                onClick={() => setActiveModal('announcement')}
              >
                + Post Notice
              </Button>
            </div>

            <div className="space-y-3">
              {summary.announcements.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-4 text-center">No active announcements.</p>
              ) : (
                summary.announcements.map((ann) => (
                  <div
                    key={ann.id}
                    className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {ann.isPinned && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 font-bold border border-amber-800">
                            PINNED
                          </span>
                        )}
                        <h4 className="text-xs font-bold text-white">{ann.title}</h4>
                      </div>
                      <Badge
                        variant={ann.priority === 'URGENT' ? 'danger' : ann.priority === 'HIGH' ? 'warning' : 'info'}
                        size="sm"
                      >
                        {ann.priority}
                      </Badge>
                    </div>

                    <p className="text-xs text-slate-300 leading-snug">{ann.content}</p>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                      <span>Posted by {ann.author.name}</span>
                      <span className="font-mono">Audience: {ann.targetAudience}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 7. QUICK ACTION MODALS                                                    */}
      {/* ========================================================================= */}

      {/* Modal 1: Add Sport */}
      <Modal
        isOpen={activeModal === 'sport'}
        onClose={() => setActiveModal(null)}
        title="Add New Sport Discipline"
        description="Configure varsity rules, scoring type, and roster parameters."
        maxWidth="md"
      >
        <form onSubmit={handleAddSport} className="space-y-4">
          <Input
            label="Sport Name"
            placeholder="e.g. Football, Cricket, Badminton"
            value={sportName}
            onChange={(e) => setSportName(e.target.value)}
            required
            leftIcon={<Layers className="w-4 h-4" />}
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Sport Category"
              value={sportCategory}
              onChange={(e) => setSportCategory(e.target.value)}
              options={[
                { value: 'TEAM', label: 'Team Sport' },
                { value: 'INDIVIDUAL', label: 'Individual Sport' },
                { value: 'RACQUET', label: 'Racquet Sport' },
                { value: 'ATHLETICS', label: 'Athletics & Track' },
                { value: 'COMBAT', label: 'Combat & Martial Arts' },
              ]}
            />

            <Select
              label="Scoring Type"
              value={sportScoring}
              onChange={(e) => setSportScoring(e.target.value)}
              options={[
                { value: 'GOALS', label: 'Goals (Football, Hockey)' },
                { value: 'RUNS_WICKETS', label: 'Runs & Wickets (Cricket)' },
                { value: 'POINTS', label: 'Points (Basketball, Kabaddi)' },
                { value: 'SETS', label: 'Sets (Badminton, Volleyball, Tennis)' },
              ]}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Min Players On Field"
              type="number"
              value={sportMinPlayers}
              onChange={(e) => setSportMinPlayers(Number(e.target.value))}
              required
            />
            <Input
              label="Max Squad Roster Size"
              type="number"
              value={sportMaxPlayers}
              onChange={(e) => setSportMaxPlayers(Number(e.target.value))}
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <Button type="button" variant="ghost" onClick={() => setActiveModal(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={modalSubmitting}>
              Create Sport
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal 2: Add Team */}
      <Modal
        isOpen={activeModal === 'team'}
        onClose={() => setActiveModal(null)}
        title="Register Departmental Team Franchise"
        description="Assign department, head coach, and official jersey color."
        maxWidth="md"
      >
        <form onSubmit={handleAddTeam} className="space-y-4">
          <Input
            label="Team Franchise Name"
            placeholder="e.g. CSE Cyber Strikers, IT Thunderbolts"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            required
            leftIcon={<Shield className="w-4 h-4" />}
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Sport Discipline"
              value={teamSportId}
              onChange={(e) => setTeamSportId(e.target.value)}
              options={(lookups?.sports || []).map((s) => ({ value: s.id, label: s.name }))}
            />

            <Select
              label="Academic Department"
              value={teamDept}
              onChange={(e) => setTeamDept(e.target.value)}
              options={[
                { value: 'CSE', label: 'CSE' },
                { value: 'IT', label: 'IT' },
                { value: 'ME', label: 'Mechanical' },
                { value: 'ECE', label: 'ECE' },
                { value: 'BBA', label: 'BBA' },
                { value: 'MBA', label: 'MBA' },
                { value: 'BPHARM', label: 'B.Pharm' },
              ]}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Head Coach (Optional)"
              value={teamCoachId}
              onChange={(e) => setTeamCoachId(e.target.value)}
              options={[
                { value: '', label: 'Unassigned Coach' },
                ...(lookups?.coaches || []).map((c) => ({ value: c.id, label: `${c.name} (${c.specialization})` })),
              ]}
            />

            <Input
              label="Jersey Color (Hex or Name)"
              placeholder="#0284c7"
              value={teamColor}
              onChange={(e) => setTeamColor(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <Button type="button" variant="ghost" onClick={() => setActiveModal(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={modalSubmitting}>
              Register Team
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal 3: Add Player */}
      <Modal
        isOpen={activeModal === 'player'}
        onClose={() => setActiveModal(null)}
        title="Enroll Player into Squad Roster"
        description="Link student athlete to team with position and jersey number."
        maxWidth="md"
      >
        <form onSubmit={handleAddPlayer} className="space-y-4">
          <Select
            label="Select Team"
            value={playerTeamId}
            onChange={(e) => setPlayerTeamId(e.target.value)}
            options={(lookups?.teams || []).map((t) => ({ value: t.id, label: t.name }))}
          />

          <Select
            label="Select Student Athlete"
            value={playerStudentId}
            onChange={(e) => setPlayerStudentId(e.target.value)}
            options={(lookups?.students || []).map((s) => ({
              value: s.id,
              label: `${s.name} (Roll: ${s.rollNumber} - ${s.department})`,
            }))}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Jersey Number"
              placeholder="e.g. 10"
              value={playerJersey}
              onChange={(e) => setPlayerJersey(e.target.value)}
            />
            <Input
              label="Tactical Position"
              placeholder="e.g. Striker, Batsman, Point Guard"
              value={playerPosition}
              onChange={(e) => setPlayerPosition(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isCaptain"
              checked={playerIsCaptain}
              onChange={(e) => setPlayerIsCaptain(e.target.checked)}
              className="w-4 h-4 rounded text-sportex-500 bg-slate-900 border-slate-800 focus:ring-sportex-500"
            />
            <label htmlFor="isCaptain" className="text-xs text-slate-300 font-semibold cursor-pointer">
              Designate as Team Captain
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <Button type="button" variant="ghost" onClick={() => setActiveModal(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={modalSubmitting}>
              Enroll Player
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal 4: Create Tournament */}
      <Modal
        isOpen={activeModal === 'tournament'}
        onClose={() => setActiveModal(null)}
        title="Create Inter-Department Tournament"
        description="Set up knockout, round robin, or group stage bracket."
        maxWidth="md"
      >
        <form onSubmit={handleCreateTournament} className="space-y-4">
          <Input
            label="Tournament Title"
            placeholder="e.g. PCTE ATHLOS 2026 Inter-Dept Cup"
            value={tournName}
            onChange={(e) => setTournName(e.target.value)}
            required
            leftIcon={<Trophy className="w-4 h-4" />}
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Sport Discipline"
              value={tournSportId}
              onChange={(e) => setTournSportId(e.target.value)}
              options={(lookups?.sports || []).map((s) => ({ value: s.id, label: s.name }))}
            />

            <Select
              label="Tournament Format"
              value={tournFormat}
              onChange={(e) => setTournFormat(e.target.value)}
              options={[
                { value: 'KNOCKOUT', label: 'Knockout / Single Elimination' },
                { value: 'ROUND_ROBIN', label: 'Round Robin League' },
                { value: 'GROUP_STAGE_KNOCKOUT', label: 'Group Stage + Knockout' },
              ]}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Start Date"
              type="date"
              value={tournStartDate}
              onChange={(e) => setTournStartDate(e.target.value)}
              required
            />
            <Input
              label="End Date"
              type="date"
              value={tournEndDate}
              onChange={(e) => setTournEndDate(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Academic Year"
              value={tournYear}
              onChange={(e) => setTournYear(e.target.value)}
              required
            />
            <Input
              label="Max Teams"
              type="number"
              value={tournMaxTeams}
              onChange={(e) => setTournMaxTeams(Number(e.target.value))}
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <Button type="button" variant="ghost" onClick={() => setActiveModal(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={modalSubmitting}>
              Generate Tournament
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal 5: Schedule Match */}
      <Modal
        isOpen={activeModal === 'match'}
        onClose={() => setActiveModal(null)}
        title="Schedule Match Fixture"
        description="Select tournament, teams, scheduled date, and venue."
        maxWidth="md"
      >
        <form onSubmit={handleScheduleMatch} className="space-y-4">
          <Select
            label="Tournament"
            value={matchTournId}
            onChange={(e) => setMatchTournId(e.target.value)}
            options={(lookups?.tournaments || []).map((t) => ({ value: t.id, label: t.name }))}
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Home Team"
              value={matchHomeTeamId}
              onChange={(e) => setMatchHomeTeamId(e.target.value)}
              options={(lookups?.teams || []).map((t) => ({ value: t.id, label: t.name }))}
            />

            <Select
              label="Away Team"
              value={matchAwayTeamId}
              onChange={(e) => setMatchAwayTeamId(e.target.value)}
              options={(lookups?.teams || []).map((t) => ({ value: t.id, label: t.name }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Round / Stage Name"
              placeholder="e.g. Quarter Final 1, Group A Match"
              value={matchRound}
              onChange={(e) => setMatchRound(e.target.value)}
              required
            />

            <Select
              label="Venue & Ground"
              value={matchVenueId}
              onChange={(e) => setMatchVenueId(e.target.value)}
              options={[
                { value: '', label: 'PCTE Main Sports Complex' },
                ...(lookups?.venues || []).map((v) => ({ value: v.id, label: `${v.name} (${v.location})` })),
              ]}
            />
          </div>

          <Input
            label="Scheduled Date & Time"
            type="datetime-local"
            value={matchDate}
            onChange={(e) => setMatchDate(e.target.value)}
            required
            leftIcon={<Clock className="w-4 h-4" />}
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <Button type="button" variant="ghost" onClick={() => setActiveModal(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={modalSubmitting}>
              Schedule Fixture
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal 6: Publish Announcement */}
      <Modal
        isOpen={activeModal === 'announcement'}
        onClose={() => setActiveModal(null)}
        title="Broadcast Campus Sports Notice"
        description="Publish urgent notices, tournament rules, or trial calls."
        maxWidth="md"
      >
        <form onSubmit={handlePublishAnnouncement} className="space-y-4">
          <Input
            label="Bulletin Title"
            placeholder="e.g. Football Varsity Trials 2026 - Registration Call"
            value={annTitle}
            onChange={(e) => setAnnTitle(e.target.value)}
            required
            leftIcon={<Bell className="w-4 h-4" />}
          />

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Bulletin Message Content</label>
            <textarea
              rows={3}
              placeholder="Enter full announcement details for students and coaches..."
              value={annContent}
              onChange={(e) => setAnnContent(e.target.value)}
              required
              className="w-full rounded-xl bg-slate-900/90 border border-slate-800 text-slate-100 text-xs p-3 focus:outline-none focus:ring-2 focus:ring-sportex-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Priority Level"
              value={annPriority}
              onChange={(e) => setAnnPriority(e.target.value)}
              options={[
                { value: 'LOW', label: 'Low Info' },
                { value: 'MEDIUM', label: 'Standard Notice' },
                { value: 'HIGH', label: 'High Priority' },
                { value: 'URGENT', label: 'URGENT Alert' },
              ]}
            />

            <Select
              label="Target Audience"
              value={annAudience}
              onChange={(e) => setAnnAudience(e.target.value)}
              options={[
                { value: 'ALL', label: 'Entire Campus (All Users)' },
                { value: 'STUDENTS', label: 'Student Athletes Only' },
                { value: 'COACHES', label: 'Coaching Staff Only' },
                { value: 'REFEREES', label: 'Match Officials Only' },
              ]}
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isPinned"
              checked={annPinned}
              onChange={(e) => setAnnPinned(e.target.checked)}
              className="w-4 h-4 rounded text-sportex-500 bg-slate-900 border-slate-800 focus:ring-sportex-500"
            />
            <label htmlFor="isPinned" className="text-xs text-slate-300 font-semibold cursor-pointer">
              Pin to top of campus notice board
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <Button type="button" variant="ghost" onClick={() => setActiveModal(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={modalSubmitting}>
              Broadcast Notice
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
