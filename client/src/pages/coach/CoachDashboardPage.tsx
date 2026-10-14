import React, { useEffect, useState, useCallback } from 'react';
import {
  Shield,
  Users,
  Calendar,
  Activity,
  Award,
  CheckSquare,
  Plus,
  RefreshCw,
  Phone,
  Clock,
  MapPin,
  Edit,
  TrendingUp,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { Tabs } from '../../components/ui/Tabs';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { ErrorState } from '../../components/ui/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';
import { AnimatedCounter } from '../../components/common/AnimatedCounter';
import { useToast } from '../../context/ToastContext';
import { coachApi } from '../../services/coachApi';
import { CoachDashboardData, CoachPlayer } from '../../types/coach';

export const CoachDashboardPage: React.FC = () => {
  const toast = useToast();

  const [data, setData] = useState<CoachDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('squads');

  // Attendance Marker State
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [attDate, setAttDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [attSessionType, setAttSessionType] = useState<string>('TRAINING');
  const [attendanceMap, setAttendanceMap] = useState<Record<string, 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'>>({});
  const [attSubmitting, setAttSubmitting] = useState<boolean>(false);

  // Add Player Modal State
  const [addPlayerModalOpen, setAddPlayerModalOpen] = useState(false);
  const [targetTeamId, setTargetTeamId] = useState('');
  const [newStudentId, setNewStudentId] = useState('');
  const [newJersey, setNewJersey] = useState('');
  const [newPosition, setNewPosition] = useState('Forward');
  const [newIsCaptain, setNewIsCaptain] = useState(false);
  const [addPlayerLoading, setAddPlayerLoading] = useState(false);

  // Edit Player Modal State
  const [editingPlayer, setEditingPlayer] = useState<{ teamId: string; player: CoachPlayer } | null>(null);
  const [editJersey, setEditJersey] = useState('');
  const [editPosition, setEditPosition] = useState('');
  const [editIsCaptain, setEditIsCaptain] = useState(false);
  const [editPlayerLoading, setEditPlayerLoading] = useState(false);

  const fetchCoachData = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    setError(null);
    try {
      const coachData = await coachApi.getDashboard();
      setData(coachData);
      if (coachData.assignedTeams.length > 0 && !selectedTeamId) {
        setSelectedTeamId(coachData.assignedTeams[0].id);
        setTargetTeamId(coachData.assignedTeams[0].id);
      }
    } catch (err: any) {
      console.error('Failed to load coach dashboard:', err);
      setError(err.response?.data?.message || err.message || 'Could not load coaching dashboard.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedTeamId]);

  useEffect(() => {
    fetchCoachData();
  }, [fetchCoachData]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchCoachData(false);
    toast.info('Synchronizing squad rosters and attendance records...');
  };

  // Pre-fill attendance map with PRESENT when team changes
  useEffect(() => {
    if (!data || !selectedTeamId) return;
    const team = data.assignedTeams.find((t) => t.id === selectedTeamId);
    if (team) {
      const initialMap: Record<string, 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'> = {};
      team.players.forEach((p) => {
        initialMap[p.studentId] = 'PRESENT';
      });
      setAttendanceMap(initialMap);
    }
  }, [data, selectedTeamId]);

  const handleMarkAllPresent = () => {
    const team = data?.assignedTeams.find((t) => t.id === selectedTeamId);
    if (!team) return;
    const updated: Record<string, 'PRESENT'> = {};
    team.players.forEach((p) => {
      updated[p.studentId] = 'PRESENT';
    });
    setAttendanceMap(updated);
    toast.success('All squad players set to PRESENT');
  };

  const handleSaveAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    const team = data?.assignedTeams.find((t) => t.id === selectedTeamId);
    if (!team || team.players.length === 0) {
      toast.warning('No players found in this squad to mark attendance.');
      return;
    }

    setAttSubmitting(true);
    try {
      const records = team.players.map((p) => ({
        studentId: p.studentId,
        status: attendanceMap[p.studentId] || 'PRESENT',
      }));

      // Find sport ID if available from team or default
      await coachApi.markAttendance({
        sessionDate: attDate,
        sportId: (team as any).sportId || 'default',
        sessionType: attSessionType,
        records,
      });

      toast.success(`Attendance saved for ${records.length} players!`);
      fetchCoachData(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to save attendance');
    } finally {
      setAttSubmitting(false);
    }
  };

  const handleAddPlayerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddPlayerLoading(true);
    try {
      await coachApi.addPlayerToSquad({
        teamId: targetTeamId,
        studentId: newStudentId,
        jerseyNumber: newJersey ? Number(newJersey) : undefined,
        position: newPosition,
        isCaptain: newIsCaptain,
      });
      toast.success('Player enrolled into team squad!');
      setAddPlayerModalOpen(false);
      setNewJersey('');
      fetchCoachData(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to add player');
    } finally {
      setAddPlayerLoading(false);
    }
  };

  const handleEditPlayerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlayer) return;
    setEditPlayerLoading(true);
    try {
      await coachApi.updateSquadPlayer(editingPlayer.player.membershipId, {
        jerseyNumber: editJersey ? Number(editJersey) : undefined,
        position: editPosition,
        isCaptain: editIsCaptain,
      });
      toast.success('Player roster info updated!');
      setEditingPlayer(null);
      fetchCoachData(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to update player');
    } finally {
      setEditPlayerLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Coach Command Center" subtitle="Varsity squad management, tactics, and attendance." />
        <Skeleton variant="card" height={160} />
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} variant="card" height={90} />
          ))}
        </div>
        <Skeleton variant="card" height={360} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-6">
        <PageHeader title="Coach Command Center" subtitle="Varsity squad management, tactics, and attendance." />
        <ErrorState
          title="Coach Profile Error"
          message={error || 'Could not load coaching dashboard from database.'}
          onRetry={() => fetchCoachData(true)}
        />
      </div>
    );
  }

  const { coach, metrics, assignedTeams, upcomingMatches, recentResults } = data;

  const tabsList = [
    { id: 'squads', label: 'Squad Rosters', badge: metrics.totalPlayers, icon: <Users className="w-3.5 h-3.5" /> },
    { id: 'attendance', label: 'Attendance Marker', icon: <CheckSquare className="w-3.5 h-3.5" /> },
    { id: 'fixtures', label: 'Team Fixtures', badge: upcomingMatches.length, icon: <Calendar className="w-3.5 h-3.5" /> },
    { id: 'results', label: 'Match Results', badge: recentResults.length, icon: <TrendingUp className="w-3.5 h-3.5" /> },
  ];

  const currentSelectedTeam = assignedTeams.find((t) => t.id === selectedTeamId);

  return (
    <div className="space-y-8">
      {/* 1. Coach Hero Header */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            <Avatar name={coach.name} size="xl" isOnline={true} />
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black text-white font-display tracking-tight">
                  {coach.name}
                </h1>
                <Badge variant="success" size="sm">
                  {coach.specialization} Head Coach
                </Badge>
                <Badge variant="info" size="sm">
                  {coach.qualification || 'Certified Coach'}
                </Badge>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-400 mt-1.5 flex-wrap font-medium">
                <span>{coach.experienceYears} Years Coaching Experience</span>
                <span>•</span>
                <span>{coach.email}</span>
                {coach.phone && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-500" /> {coach.phone}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setTargetTeamId(assignedTeams[0]?.id || '');
                setAddPlayerModalOpen(true);
              }}
              leftIcon={<Plus className="w-3.5 h-3.5 text-emerald-400" />}
            >
              Add Squad Player
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              isLoading={isRefreshing}
              leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />}
            >
              Sync
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Key Coach Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <Card variant="glass" className="p-4">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Assigned Teams</span>
            <Shield className="w-4 h-4 text-sportex-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-display">
            <AnimatedCounter value={metrics.assignedTeamsCount} />
          </div>
          <p className="text-[10px] text-sportex-300 font-semibold mt-0.5">Varsity Squads</p>
        </Card>

        <Card variant="default" className="p-4">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Squad Athletes</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-display">
            <AnimatedCounter value={metrics.totalPlayers} />
          </div>
          <p className="text-[10px] text-emerald-300 font-semibold mt-0.5">Active Roster</p>
        </Card>

        <Card variant="default" className="p-4">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Training Attendance</span>
            <Activity className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-purple-400 font-display">
            <AnimatedCounter value={metrics.attendanceRate} suffix="%" />
          </div>
          <p className="text-[10px] text-purple-300 font-semibold mt-0.5">Overall Compliance</p>
        </Card>

        <Card variant="default" className="p-4">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Match Wins</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-400 font-display">
            <AnimatedCounter value={metrics.wins} />
          </div>
          <p className="text-[10px] text-amber-300 font-semibold mt-0.5">{metrics.losses} Losses • {metrics.draws} Draws</p>
        </Card>

        <Card variant="glow" className="p-4 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Upcoming Matches</span>
            <Calendar className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-cyan-400 font-display">
            <AnimatedCounter value={metrics.upcomingMatchesCount} />
          </div>
          <p className="text-[10px] text-cyan-300 font-semibold mt-0.5">Scheduled Fixtures</p>
        </Card>
      </div>

      {/* 3. Navigation Tabs */}
      <Tabs activeTab={activeTab} onChange={setActiveTab} tabs={tabsList} variant="pills" />

      {/* 4. Tab Panels */}
      <div>
        {/* TAB 1: SQUAD ROSTERS */}
        {activeTab === 'squads' && (
          <div className="space-y-6">
            {assignedTeams.length === 0 ? (
              <EmptyState
                title="No Teams Assigned"
                description="You have not been assigned to head any sports squads yet. Contact the Sports Administrator."
              />
            ) : (
              assignedTeams.map((team) => (
                <Card key={team.id} variant="glass" className="p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-sportex-400 uppercase">{team.sportName}</span>
                        {team.department && <Badge variant="info">{team.department}</Badge>}
                      </div>
                      <h3 className="text-lg font-bold text-white mt-0.5">{team.name}</h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 font-mono">{team.playersCount} Athletes</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setTargetTeamId(team.id);
                          setAddPlayerModalOpen(true);
                        }}
                        leftIcon={<Plus className="w-3.5 h-3.5 text-emerald-400" />}
                      >
                        Enroll Player
                      </Button>
                    </div>
                  </div>

                  {team.players.length === 0 ? (
                    <p className="text-xs text-slate-500 italic py-4 text-center">No players registered in this squad.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                      {team.players.map((p) => (
                        <div
                          key={p.membershipId}
                          className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-emerald-500/40 transition-colors flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar name={p.name} size="sm" isOnline={p.isEligible} />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <p className="text-xs font-bold text-white">{p.name}</p>
                                {p.isCaptain && (
                                  <Badge variant="warning" size="sm">
                                    C
                                  </Badge>
                                )}
                              </div>
                              <p className="text-[10px] text-slate-400 font-mono">
                                #{p.jerseyNumber || 'TBD'} • {p.position || 'Player'}
                              </p>
                              <p className="text-[10px] text-slate-500 font-mono">
                                Roll: {p.rollNumber} ({p.department})
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <button
                              onClick={() => {
                                setEditingPlayer({ teamId: team.id, player: p });
                                setEditJersey(p.jerseyNumber ? String(p.jerseyNumber) : '');
                                setEditPosition(p.position || '');
                                setEditIsCaptain(p.isCaptain);
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                              title="Edit Roster Info"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <p className="text-[10px] font-mono text-emerald-400 font-bold mt-1">{p.goals} pts</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              ))
            )}
          </div>
        )}

        {/* TAB 2: ATTENDANCE MARKER */}
        {activeTab === 'attendance' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <Card variant="glass" className="lg:col-span-8 p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-emerald-400" /> Mark Squad Session Attendance
                  </h3>
                  <p className="text-xs text-slate-400">Record daily training compliance for varsity eligibility</p>
                </div>

                <Button variant="outline" size="sm" onClick={handleMarkAllPresent}>
                  Mark All Present
                </Button>
              </div>

              {/* Session Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Select
                  label="Select Squad"
                  value={selectedTeamId}
                  onChange={(e) => setSelectedTeamId(e.target.value)}
                  options={assignedTeams.map((t) => ({ value: t.id, label: `${t.name} (${t.sportName})` }))}
                />

                <Input
                  label="Session Date"
                  type="date"
                  value={attDate}
                  onChange={(e) => setAttDate(e.target.value)}
                  required
                />

                <Select
                  label="Session Type"
                  value={attSessionType}
                  onChange={(e) => setAttSessionType(e.target.value)}
                  options={[
                    { value: 'TRAINING', label: 'Regular Training' },
                    { value: 'PRACTICE_MATCH', label: 'Practice Match' },
                    { value: 'FITNESS', label: 'Fitness & Conditioning' },
                  ]}
                />
              </div>

              {/* Player Attendance Check-list */}
              <form onSubmit={handleSaveAttendance} className="space-y-4 pt-2">
                {!currentSelectedTeam || currentSelectedTeam.players.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-6 text-center">
                    No players found in this squad. Add athletes to the squad roster first.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                    {currentSelectedTeam.players.map((p) => {
                      const currentStatus = attendanceMap[p.studentId] || 'PRESENT';
                      return (
                        <div
                          key={p.studentId}
                          className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="flex items-center gap-2.5">
                            <Avatar name={p.name} size="xs" />
                            <div>
                              <p className="font-bold text-white">{p.name}</p>
                              <p className="text-[10px] text-slate-400 font-mono">
                                #{p.jerseyNumber || 'TBD'} • Roll: {p.rollNumber}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'] as const).map((st) => (
                              <button
                                key={st}
                                type="button"
                                onClick={() => setAttendanceMap((prev) => ({ ...prev, [p.studentId]: st }))}
                                className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
                                  currentStatus === st
                                    ? st === 'PRESENT'
                                      ? 'bg-emerald-600 text-white shadow'
                                      : st === 'ABSENT'
                                      ? 'bg-rose-600 text-white shadow'
                                      : st === 'LATE'
                                      ? 'bg-amber-600 text-white shadow'
                                      : 'bg-indigo-600 text-white shadow'
                                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                                }`}
                              >
                                {st.slice(0, 3)}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="flex justify-end pt-3 border-t border-slate-800">
                  <Button type="submit" variant="primary" isLoading={attSubmitting}>
                    Save Attendance Ledger
                  </Button>
                </div>
              </form>
            </Card>

            {/* Attendance Summary Panel */}
            <Card variant="default" className="lg:col-span-4 p-6 space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-white mb-1">Squad Attendance Health</h3>
                <p className="text-xs text-slate-400 mb-4">Training session compliance ledger</p>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Overall Attendance</span>
                  <div className="text-3xl font-black text-emerald-400 font-display">
                    {metrics.attendanceRate}%
                  </div>
                  <p className="text-[10px] text-slate-500">{metrics.totalSessions} Sessions Recorded</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-400 space-y-1">
                <p className="font-semibold text-white">Guidelines:</p>
                <p className="text-[11px] text-slate-400">
                  Athletes below 75% attendance are automatically flagged for medical and coaching review.
                </p>
              </div>
            </Card>
          </div>
        )}

        {/* TAB 3: FIXTURES */}
        {activeTab === 'fixtures' && (
          <Card variant="glass" className="p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Upcoming Match Schedule</h3>
              <Badge variant="purple">{upcomingMatches.length} Matches</Badge>
            </div>

            {upcomingMatches.length === 0 ? (
              <EmptyState title="No Scheduled Fixtures" description="Your teams do not have any matches coming up." />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {upcomingMatches.map((m) => (
                  <div key={m.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span className="font-bold text-sportex-400">{m.tournament.name}</span>
                      <span className="font-mono text-[10px] text-purple-400">{m.roundName}</span>
                    </div>

                    <div className="flex items-center justify-between my-2 font-bold text-white text-sm">
                      <span>{m.homeTeam.name}</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-900 font-mono text-slate-500">VS</span>
                      <span>{m.awayTeam.name}</span>
                    </div>

                    <div className="flex justify-between text-xs text-slate-400 pt-1 border-t border-slate-900">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-500" /> {m.venue?.name || 'Main Stadium'}
                      </span>
                      <span className="flex items-center gap-1 font-mono text-slate-300">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {new Date(m.scheduledDate).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* TAB 4: RESULTS */}
        {activeTab === 'results' && (
          <Card variant="glass" className="p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Completed Match Outcomes</h3>
              <Badge variant="info">{recentResults.length} Completed</Badge>
            </div>

            {recentResults.length === 0 ? (
              <EmptyState title="No Match Results" description="No completed match records for your teams yet." />
            ) : (
              <div className="space-y-3">
                {recentResults.map((r) => (
                  <div
                    key={r.id}
                    className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4 text-xs"
                  >
                    <div>
                      <span className="font-bold text-white text-sm">
                        {r.homeTeam.name} {r.homeScore} - {r.awayScore} {r.awayTeam.name}
                      </span>
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
        )}
      </div>

      {/* ========================================================================= */}
      {/* 5. MODALS                                                                 */}
      {/* ========================================================================= */}

      {/* Modal: Add Player to Squad */}
      <Modal
        isOpen={addPlayerModalOpen}
        onClose={() => setAddPlayerModalOpen(false)}
        title="Enroll Player into Squad Roster"
        description="Select student athlete, jersey number, and position."
        maxWidth="md"
      >
        <form onSubmit={handleAddPlayerSubmit} className="space-y-4">
          <Select
            label="Assigned Squad"
            value={targetTeamId}
            onChange={(e) => setTargetTeamId(e.target.value)}
            options={assignedTeams.map((t) => ({ value: t.id, label: t.name }))}
          />

          <Input
            label="Student ID (Database UUID or Roll No)"
            placeholder="e.g. Enter athlete student ID"
            value={newStudentId}
            onChange={(e) => setNewStudentId(e.target.value)}
            required
            leftIcon={<Users className="w-4 h-4" />}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Jersey Number"
              placeholder="e.g. 10"
              value={newJersey}
              onChange={(e) => setNewJersey(e.target.value)}
            />
            <Input
              label="Tactical Position"
              placeholder="e.g. Striker, Defender"
              value={newPosition}
              onChange={(e) => setNewPosition(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="coachCaptain"
              checked={newIsCaptain}
              onChange={(e) => setNewIsCaptain(e.target.checked)}
              className="w-4 h-4 rounded text-sportex-500 bg-slate-900 border-slate-800"
            />
            <label htmlFor="coachCaptain" className="text-xs text-slate-300 font-semibold cursor-pointer">
              Designate as Squad Captain
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <Button type="button" variant="ghost" onClick={() => setAddPlayerModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={addPlayerLoading}>
              Enroll Player
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Edit Squad Player */}
      <Modal
        isOpen={!!editingPlayer}
        onClose={() => setEditingPlayer(null)}
        title="Edit Squad Player Details"
        description="Update jersey number, tactical position, and captaincy."
        maxWidth="md"
      >
        <form onSubmit={handleEditPlayerSubmit} className="space-y-4">
          <Input
            label="Jersey Number"
            value={editJersey}
            onChange={(e) => setEditJersey(e.target.value)}
          />

          <Input
            label="Tactical Position"
            value={editPosition}
            onChange={(e) => setEditPosition(e.target.value)}
          />

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="editCaptain"
              checked={editIsCaptain}
              onChange={(e) => setEditIsCaptain(e.target.checked)}
              className="w-4 h-4 rounded text-sportex-500 bg-slate-900 border-slate-800"
            />
            <label htmlFor="editCaptain" className="text-xs text-slate-300 font-semibold cursor-pointer">
              Squad Captain Status
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <Button type="button" variant="ghost" onClick={() => setEditingPlayer(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={editPlayerLoading}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
