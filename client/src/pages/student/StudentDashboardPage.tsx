import React, { useEffect, useState, useCallback } from 'react';
import {
  Trophy,
  Shield,
  Calendar,
  Zap,
  Activity,
  Award,
  Bell,
  Clock,
  MapPin,
  CheckCircle2,
  Phone,
  Mail,
  User,
  Heart,
  QrCode,
  Printer,
  Sparkles,
  RefreshCw,
  Edit,
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
import { studentApi } from '../../services/studentApi';
import { StudentDashboardData, StudentCertificate } from '../../types/student';

export const StudentDashboardPage: React.FC = () => {
  const toast = useToast();

  // Data States
  const [data, setData] = useState<StudentDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');

  // Edit Contact Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editPhone, setEditPhone] = useState('');
  const [editEmergency, setEditEmergency] = useState('');
  const [editBloodGroup, setEditBloodGroup] = useState('B+');
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Certificate Modal State
  const [selectedCert, setSelectedCert] = useState<StudentCertificate | null>(null);

  const fetchStudentData = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    setError(null);
    try {
      const studentData = await studentApi.getDashboard();
      setData(studentData);
      setEditPhone(studentData.profile.phone || '');
      setEditEmergency(studentData.profile.emergencyContact || '');
      setEditBloodGroup(studentData.profile.bloodGroup || 'B+');
    } catch (err: any) {
      console.error('Failed to load student dashboard:', err);
      setError(err.response?.data?.message || err.message || 'Could not load student profile.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStudentData();
  }, [fetchStudentData]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchStudentData(false);
    toast.info('Refreshing your athlete roster and fixtures...');
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditSubmitting(true);
    try {
      await studentApi.updateProfile({
        phone: editPhone,
        emergencyContact: editEmergency,
        bloodGroup: editBloodGroup,
      });
      toast.success('Medical contact details updated successfully!');
      setEditModalOpen(false);
      fetchStudentData(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to update profile');
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleMarkNotificationRead = async (id: string) => {
    try {
      await studentApi.markNotificationRead(id);
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          notifications: prev.notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
        };
      });
      toast.info('Notification marked as read.');
    } catch (err: any) {
      toast.error('Failed to update notification status');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Student Athlete Portal"
          subtitle="Your personalized varsity sports passport, fixtures, and telemetry."
        />
        <Skeleton variant="card" height={180} />
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
        <PageHeader
          title="Student Athlete Portal"
          subtitle="Your personalized varsity sports passport, fixtures, and telemetry."
        />
        <ErrorState
          title="Profile Connection Error"
          message={error || 'Could not load your athlete profile from the database.'}
          onRetry={() => fetchStudentData(true)}
        />
      </div>
    );
  }

  const { profile, metrics, teams, upcomingMatches, recentResults, attendance, statistics, certificates, notifications, announcements } = data;

  const tabsList = [
    { id: 'overview', label: 'My Overview', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: 'teams', label: 'Squads & Teams', badge: teams.length, icon: <Shield className="w-3.5 h-3.5" /> },
    { id: 'fixtures', label: 'Match Fixtures', badge: upcomingMatches.length, icon: <Calendar className="w-3.5 h-3.5" /> },
    { id: 'results', label: 'Match Results', badge: recentResults.length, icon: <Zap className="w-3.5 h-3.5" /> },
    { id: 'attendance', label: 'Attendance Ledger', icon: <Activity className="w-3.5 h-3.5" /> },
    { id: 'statistics', label: 'Career Telemetry', icon: <Trophy className="w-3.5 h-3.5" /> },
    { id: 'certificates', label: 'QR Certificates', badge: certificates.length, icon: <Award className="w-3.5 h-3.5" /> },
    { id: 'notifications', label: 'Alerts', badge: notifications.filter((n) => !n.isRead).length || undefined, icon: <Bell className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="space-y-8">
      {/* 1. Athlete Hero Profile Card */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sportex-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            <div className="relative">
              <Avatar name={profile.name} size="xl" isOnline={profile.isEligible} />
              <span className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full bg-slate-950 text-[10px] font-mono font-bold text-sportex-400 border border-sportex-500/40">
                {profile.gender.charAt(0)}
              </span>
            </div>

            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black text-white font-display tracking-tight">
                  {profile.name}
                </h1>
                <Badge variant={profile.isEligible ? 'success' : 'danger'} size="sm">
                  {profile.isEligible ? 'Varsity Eligible' : 'Medical Review'}
                </Badge>
                <Badge variant="info" size="sm">
                  {profile.department}
                </Badge>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-400 mt-1.5 flex-wrap font-medium">
                <span className="font-mono text-sportex-400 font-bold">Roll: {profile.rollNumber}</span>
                <span>•</span>
                <span>Batch {profile.batchYear} (Semester {profile.semester})</span>
                <span>•</span>
                <span>Blood: <strong className="text-rose-400">{profile.bloodGroup}</strong></span>
                <span>•</span>
                <span>{profile.email}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditModalOpen(true)}
              leftIcon={<Edit className="w-3.5 h-3.5" />}
            >
              Medical / Emergency
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

      {/* 2. Key Athlete Metric Tickers */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <Card variant="glass" className="p-4">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Active Squads</span>
            <Shield className="w-4 h-4 text-sportex-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-display">
            <AnimatedCounter value={metrics.activeTeamsCount} />
          </div>
          <p className="text-[10px] text-sportex-300 font-semibold mt-0.5">Enrolled Teams</p>
        </Card>

        <Card variant="default" className="p-4">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Matches Played</span>
            <Calendar className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-display">
            <AnimatedCounter value={metrics.totalMatchesPlayed} />
          </div>
          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Career Fixtures</p>
        </Card>

        <Card variant="default" className="p-4">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Score Contributions</span>
            <Zap className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-display">
            <AnimatedCounter value={metrics.totalGoals} />
          </div>
          <p className="text-[10px] text-emerald-300 font-semibold mt-0.5">Goals / Points Scored</p>
        </Card>

        <Card variant="default" className="p-4">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Training Attendance</span>
            <Activity className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-purple-400 font-display">
            <AnimatedCounter value={metrics.attendanceRate} suffix="%" />
          </div>
          <p className="text-[10px] text-purple-300 font-semibold mt-0.5">Session Compliance</p>
        </Card>

        <Card variant="glow" className="p-4 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Certificates</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-400 font-display">
            <AnimatedCounter value={metrics.certificatesCount} />
          </div>
          <p className="text-[10px] text-amber-300 font-semibold mt-0.5">Verified QR Awards</p>
        </Card>
      </div>

      {/* 3. Navigation Tabs */}
      <Tabs activeTab={activeTab} onChange={setActiveTab} tabs={tabsList} variant="pills" />

      {/* 4. Tab Panels */}
      <div>
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Squads Preview & Next Fixture (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              <Card variant="glass" className="p-6">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Shield className="w-4 h-4 text-sportex-400" /> My Varsity Teams
                  </h3>
                  <span className="text-xs text-slate-400">{teams.length} Active Squads</span>
                </div>

                {teams.length === 0 ? (
                  <EmptyState
                    title="No Squad Memberships Yet"
                    description="You are not currently enrolled in any varsity roster. Attend upcoming sports trials."
                  />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {teams.map((tm) => (
                      <div
                        key={tm.id}
                        className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-3 relative overflow-hidden"
                      >
                        <div
                          className="absolute top-0 right-0 w-2 h-full"
                          style={{ backgroundColor: tm.jerseyColor || '#0284c7' }}
                        />
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-sportex-400 uppercase tracking-wider font-mono">
                              {tm.sportName}
                            </span>
                            {tm.isCaptain && (
                              <Badge variant="warning" size="sm">
                                Captain
                              </Badge>
                            )}
                          </div>
                          <h4 className="text-sm font-bold text-white mt-1">{tm.teamName}</h4>
                        </div>

                        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-900">
                          <span>Jersey #{tm.jerseyNumber || 'N/A'}</span>
                          <span className="font-semibold text-slate-300">{tm.position}</span>
                        </div>

                        {tm.coach && (
                          <div className="text-[11px] text-slate-400 pt-1 flex items-center gap-1.5">
                            <User className="w-3 h-3 text-slate-500" />
                            <span>Coach: {tm.coach.name}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Next Scheduled Fixtures Preview */}
              <Card variant="default" className="p-6">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-purple-400" /> Upcoming Match Schedule
                  </h3>
                  <span className="text-xs text-purple-400 font-mono">{upcomingMatches.length} Matches</span>
                </div>

                {upcomingMatches.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-4 text-center">
                    No upcoming match fixtures scheduled for your squads.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {upcomingMatches.slice(0, 3).map((match) => (
                      <div
                        key={match.id}
                        className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <p className="text-[10px] text-purple-400 font-semibold">{match.tournament.name}</p>
                          <div className="text-sm font-bold text-white mt-0.5">
                            {match.homeTeam.name} <span className="text-slate-500 font-mono text-xs">VS</span> {match.awayTeam.name}
                          </div>
                          <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-500" /> {match.venue?.name || 'Main Stadium'}
                          </p>
                        </div>

                        <div className="text-right flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto">
                          <Badge variant="warning" size="sm">
                            Upcoming
                          </Badge>
                          <span className="text-[11px] font-mono text-slate-300 mt-1">
                            {new Date(match.scheduledDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}{' '}
                            {new Date(match.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>

            {/* Right: Notifications & Certificates Preview (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Bulletins & Notices */}
              <Card variant="glass" className="p-6">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Bell className="w-4 h-4 text-amber-400" /> Campus Notices
                  </h3>
                  <span className="text-xs text-slate-400">Bulletins</span>
                </div>

                <div className="space-y-3">
                  {announcements.length === 0 ? (
                    <p className="text-xs text-slate-500 italic py-4 text-center">No active bulletins.</p>
                  ) : (
                    announcements.slice(0, 3).map((ann) => (
                      <div key={ann.id} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-white">{ann.title}</h4>
                          <Badge variant={ann.priority === 'URGENT' ? 'danger' : 'info'} size="sm">
                            {ann.priority}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-snug">{ann.content}</p>
                      </div>
                    ))
                  )}
                </div>
              </Card>

              {/* Verified Certificates Badge Preview */}
              <Card variant="default" className="p-6">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-400" /> Recent Digital Awards
                  </h3>
                  <span className="text-xs text-amber-400 font-mono">{certificates.length} Total</span>
                </div>

                {certificates.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-4 text-center">
                    No awards or certificates issued yet.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {certificates.slice(0, 2).map((cert) => (
                      <div
                        key={cert.id}
                        onClick={() => setSelectedCert(cert)}
                        className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-amber-500/40 cursor-pointer transition-all flex items-center justify-between"
                      >
                        <div>
                          <h4 className="text-xs font-bold text-white">{cert.title}</h4>
                          <p className="text-[10px] text-slate-400 font-mono">
                            {cert.sportName} • {cert.tournamentName}
                          </p>
                        </div>
                        <Badge variant="purple" size="sm">
                          {cert.type}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </div>
        )}

        {/* TAB 2: SQUADS & TEAMS */}
        {activeTab === 'teams' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.length === 0 ? (
              <div className="col-span-full">
                <EmptyState
                  title="No Team Roster Found"
                  description="You have not been assigned to any varsity sports team. Please contact your department sports coordinator."
                />
              </div>
            ) : (
              teams.map((tm) => (
                <Card key={tm.id} variant="default" className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-sportex-400 uppercase">{tm.sportName}</span>
                    {tm.isCaptain && <Badge variant="warning">Squad Captain</Badge>}
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white">{tm.teamName}</h3>
                    <p className="text-xs text-slate-400">Position: {tm.position}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Jersey Number:</span>
                      <span className="font-bold text-white font-mono">#{tm.jerseyNumber || 'TBD'}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Discipline Category:</span>
                      <span className="font-semibold text-slate-200">{tm.sportCategory}</span>
                    </div>
                  </div>

                  {tm.coach && (
                    <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5 text-xs">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Head Coach Details</p>
                      <p className="font-bold text-white">{tm.coach.name}</p>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                        <Mail className="w-3 h-3 text-slate-500" /> {tm.coach.email}
                      </p>
                      {tm.coach.phone && (
                        <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                          <Phone className="w-3 h-3 text-slate-500" /> {tm.coach.phone}
                        </p>
                      )}
                    </div>
                  )}
                </Card>
              ))
            )}
          </div>
        )}

        {/* TAB 3: FIXTURES */}
        {activeTab === 'fixtures' && (
          <Card variant="glass" className="p-6">
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white">Upcoming Varsity Fixtures</h3>
                <p className="text-xs text-slate-400">Matches scheduled for your enrolled sports teams</p>
              </div>
              <Badge variant="purple">{upcomingMatches.length} Scheduled</Badge>
            </div>

            {upcomingMatches.length === 0 ? (
              <EmptyState
                title="No Fixtures Scheduled"
                description="Your teams do not have any scheduled matches currently."
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {upcomingMatches.map((match) => (
                  <div
                    key={match.id}
                    className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3"
                  >
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="font-semibold text-sportex-400">{match.tournament.name}</span>
                      <span className="font-mono text-[10px] text-purple-400">{match.roundName}</span>
                    </div>

                    <div className="flex items-center justify-between my-3 py-2 border-y border-slate-900">
                      <div className="text-sm font-bold text-white">{match.homeTeam.name}</div>
                      <div className="px-2.5 py-1 rounded-lg bg-slate-900 text-xs font-mono font-bold text-slate-400">
                        VS
                      </div>
                      <div className="text-sm font-bold text-white">{match.awayTeam.name}</div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" /> {match.venue?.name || 'Main Stadium'}
                      </span>
                      <span className="flex items-center gap-1.5 font-mono text-slate-300">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        {new Date(match.scheduledDate).toLocaleString([], {
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
          <Card variant="glass" className="p-6">
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white">Recent Match Outcomes</h3>
                <p className="text-xs text-slate-400">Scores, outcomes, and your individual event telemetry</p>
              </div>
              <Badge variant="info">{recentResults.length} Completed</Badge>
            </div>

            {recentResults.length === 0 ? (
              <EmptyState
                title="No Completed Matches"
                description="Your teams have not completed any tournament matches yet."
              />
            ) : (
              <div className="space-y-4">
                {recentResults.map((r) => (
                  <div
                    key={r.id}
                    className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-white">{r.tournamentName}</span>
                        <span className="text-slate-400 ml-2">({r.sportName})</span>
                      </div>
                      <Badge
                        variant={r.outcome === 'WON' ? 'success' : r.outcome === 'LOST' ? 'danger' : 'warning'}
                      >
                        {r.outcome === 'WON' ? 'Victory' : r.outcome === 'LOST' ? 'Defeat' : 'Draw'}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-sm font-bold">
                      <span className="text-white">{r.homeTeam}</span>
                      <span className="font-mono text-base px-3 py-1 rounded bg-slate-950 text-sportex-400 border border-slate-800">
                        {r.homeScore} - {r.awayScore}
                      </span>
                      <span className="text-white">{r.awayTeam}</span>
                    </div>

                    {r.myEvents && r.myEvents.length > 0 && (
                      <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-xs text-emerald-300">
                        <span className="font-bold">Your Match Contributions:</span>{' '}
                        {r.myEvents.map((ev, i) => (
                          <span key={i} className="ml-1">
                            {ev.eventType} (+{ev.scoreValue} in {ev.period || 'Match'})
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* TAB 5: ATTENDANCE */}
        {activeTab === 'attendance' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <Card variant="glass" className="lg:col-span-4 p-6 text-center space-y-4">
              <h3 className="text-base font-bold text-white">Attendance Rate</h3>
              <div className="w-32 h-32 mx-auto rounded-full border-4 border-purple-500/30 flex items-center justify-center relative">
                <div className="text-center">
                  <div className="text-3xl font-black text-purple-400 font-display">
                    {attendance.attendanceRate}%
                  </div>
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Compliance</p>
                </div>
              </div>
              <div className="space-y-1.5 text-xs text-slate-300">
                <p>Present Sessions: <strong className="text-emerald-400">{attendance.presentSessions}</strong> / {attendance.totalSessions}</p>
                <p className="text-[11px] text-slate-400">Minimum 75% required for varsity eligibility.</p>
              </div>
            </Card>

            <Card variant="default" className="lg:col-span-8 p-6">
              <h3 className="text-base font-bold text-white mb-4">Training Session History</h3>
              {attendance.records.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-4 text-center">No attendance sessions recorded yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                        <th className="pb-2">Date</th>
                        <th className="pb-2">Sport</th>
                        <th className="pb-2">Session Type</th>
                        <th className="pb-2">Coach</th>
                        <th className="pb-2 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {attendance.records.map((rec) => (
                        <tr key={rec.id} className="hover:bg-slate-800/30">
                          <td className="py-2.5 font-mono text-slate-300">
                            {new Date(rec.sessionDate).toLocaleDateString()}
                          </td>
                          <td className="py-2.5 font-bold text-white">{rec.sportName}</td>
                          <td className="py-2.5 text-slate-400">{rec.sessionType}</td>
                          <td className="py-2.5 text-slate-300">{rec.coachName}</td>
                          <td className="py-2.5 text-right">
                            <Badge
                              variant={
                                rec.status === 'PRESENT'
                                  ? 'success'
                                  : rec.status === 'ABSENT'
                                  ? 'danger'
                                  : rec.status === 'LATE'
                                  ? 'warning'
                                  : 'info'
                              }
                              size="sm"
                            >
                              {rec.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* TAB 6: STATISTICS */}
        {activeTab === 'statistics' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {statistics.length === 0 ? (
              <div className="col-span-full">
                <EmptyState
                  title="No Statistics Recorded"
                  description="Telemetry is computed automatically as you participate in live scored matches."
                />
              </div>
            ) : (
              statistics.map((st) => (
                <Card key={st.id} variant="glass" className="p-6 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <h3 className="text-base font-bold text-white">{st.sport.name}</h3>
                    <Badge variant="purple">{st.sport.category}</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-slate-400">Matches Played</span>
                      <p className="text-lg font-bold text-white font-mono mt-0.5">{st.matchesPlayed}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-slate-400">Goals / Points</span>
                      <p className="text-lg font-bold text-emerald-400 font-mono mt-0.5">
                        {st.goalsScored + st.pointsScored + st.runsScored}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-slate-400">Assists</span>
                      <p className="text-lg font-bold text-cyan-400 font-mono mt-0.5">{st.assists}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-slate-400">MVP Honors</span>
                      <p className="text-lg font-bold text-amber-400 font-mono mt-0.5">{st.mvpAwards}</p>
                    </div>
                  </div>

                  <div className="flex justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
                    <span>Disciplinary:</span>
                    <span>
                      <strong className="text-amber-400">{st.yellowCards} Yellow</strong> •{' '}
                      <strong className="text-rose-400">{st.redCards} Red</strong>
                    </span>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {/* TAB 7: CERTIFICATES */}
        {activeTab === 'certificates' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.length === 0 ? (
              <div className="col-span-full">
                <EmptyState
                  title="No Certificates Issued Yet"
                  description="Participate in university sports cups to earn cryptographic QR-verified awards."
                />
              </div>
            ) : (
              certificates.map((cert) => (
                <Card
                  key={cert.id}
                  variant="glow"
                  className="p-6 space-y-4 cursor-pointer hover:scale-[1.02] transition-transform"
                  onClick={() => setSelectedCert(cert)}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-amber-400 font-bold">{cert.certificateNo}</span>
                    <Badge variant="purple" size="sm">
                      {cert.type}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white">{cert.title}</h3>
                    <p className="text-xs text-slate-300 mt-1">{cert.achievement}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
                    <p>Tournament: <strong className="text-slate-200">{cert.tournamentName}</strong></p>
                    <p>Sport: <strong className="text-slate-200">{cert.sportName}</strong></p>
                    <p>Issued: <strong className="text-slate-200">{new Date(cert.issueDate).toLocaleDateString()}</strong></p>
                  </div>

                  <Button variant="outline" size="sm" className="w-full" leftIcon={<QrCode className="w-3.5 h-3.5" />}>
                    View Verified Certificate
                  </Button>
                </Card>
              ))
            )}
          </div>
        )}

        {/* TAB 8: NOTIFICATIONS */}
        {activeTab === 'notifications' && (
          <Card variant="glass" className="p-6">
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">Your Alerts & Bulletins</h3>
              <Badge variant="info">{notifications.length} Total</Badge>
            </div>

            <div className="space-y-3">
              {notifications.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-6 text-center">No personal alerts.</p>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-4 rounded-xl border transition-colors flex items-start justify-between gap-4 ${
                      n.isRead
                        ? 'bg-slate-950/40 border-slate-800/60 text-slate-400'
                        : 'bg-slate-900/80 border-sportex-500/40 text-slate-200'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {!n.isRead && <span className="w-2 h-2 rounded-full bg-sportex-500 animate-pulse" />}
                        <h4 className="text-xs font-bold text-white">{n.title}</h4>
                      </div>
                      <p className="text-xs">{n.message}</p>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(n.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {!n.isRead && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs"
                        onClick={() => handleMarkNotificationRead(n.id)}
                      >
                        Mark Read
                      </Button>
                    )}
                  </div>
                ))
              )}
            </div>
          </Card>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 5. MODALS                                                                 */}
      {/* ========================================================================= */}

      {/* Edit Medical & Emergency Info Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Update Emergency & Medical Contact"
        description="Update your contact phone, emergency guardian contact, and blood group."
        maxWidth="md"
      >
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <Input
            label="Personal Phone Number"
            placeholder="+91 98765 43210"
            value={editPhone}
            onChange={(e) => setEditPhone(e.target.value)}
            leftIcon={<Phone className="w-4 h-4" />}
          />

          <Input
            label="Emergency Contact (Name & Phone)"
            placeholder="Guardian: +91 98123 45678"
            value={editEmergency}
            onChange={(e) => setEditEmergency(e.target.value)}
            leftIcon={<Heart className="w-4 h-4" />}
          />

          <Select
            label="Blood Group"
            value={editBloodGroup}
            onChange={(e) => setEditBloodGroup(e.target.value)}
            options={[
              { value: 'A+', label: 'A Positive (A+)' },
              { value: 'A-', label: 'A Negative (A-)' },
              { value: 'B+', label: 'B Positive (B+)' },
              { value: 'B-', label: 'B Negative (B-)' },
              { value: 'AB+', label: 'AB Positive (AB+)' },
              { value: 'AB-', label: 'AB Negative (AB-)' },
              { value: 'O+', label: 'O Positive (O+)' },
              { value: 'O-', label: 'O Negative (O-)' },
            ]}
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <Button type="button" variant="ghost" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={editSubmitting}>
              Save Medical Info
            </Button>
          </div>
        </form>
      </Modal>

      {/* Digital Certificate High-Res QR Verification Modal */}
      <Modal
        isOpen={!!selectedCert}
        onClose={() => setSelectedCert(null)}
        title="Official Sports Certificate of Achievement"
        description="Verifiable digital award issued by PCTE SPORTEX Directorate"
        maxWidth="lg"
      >
        {selectedCert && (
          <div className="space-y-6">
            {/* Certificate Print Design Preview */}
            <div className="p-8 rounded-3xl bg-slate-950 border-4 border-amber-500/40 text-center relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 p-4">
                <span className="text-[10px] font-mono text-slate-500">UUID: {selectedCert.verificationUuid}</span>
              </div>

              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/40 flex items-center justify-center mx-auto mb-4 text-amber-400">
                <Award className="w-8 h-8" />
              </div>

              <span className="px-3 py-1 rounded-full bg-amber-950 text-amber-300 border border-amber-800 text-xs font-bold uppercase tracking-wider">
                Certificate of {selectedCert.type}
              </span>

              <h2 className="text-xl sm:text-2xl font-black text-white mt-4 font-display">
                {selectedCert.title}
              </h2>

              <p className="text-xs text-slate-400 mt-2">This is proudly presented to</p>
              <h3 className="text-lg font-extrabold text-amber-300 font-display mt-0.5">{profile.name}</h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Roll No: {profile.rollNumber} • {profile.department}
              </p>

              <p className="text-xs text-slate-300 max-w-md mx-auto mt-4 leading-relaxed">
                For outstanding athletic performance and {selectedCert.achievement} in{' '}
                <strong className="text-white">{selectedCert.tournamentName}</strong> ({selectedCert.sportName}).
              </p>

              <div className="mt-8 pt-4 border-t border-slate-900 flex items-center justify-between text-xs text-slate-400">
                <div>
                  <p className="font-bold text-white">{selectedCert.issuedByAdmin}</p>
                  <p className="text-[10px]">Director of Sports, PCTE</p>
                </div>

                <div className="p-2 rounded-xl bg-white text-slate-950 inline-block font-mono text-[9px] font-bold">
                  [QR VERIFIED]
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-emerald-400 flex items-center gap-1.5 font-mono">
                <CheckCircle2 className="w-4 h-4" /> Authenticated on PostgreSQL Ledger
              </span>

              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setSelectedCert(null)}>
                  Close
                </Button>
                <Button
                  variant="primary"
                  onClick={() => window.print()}
                  leftIcon={<Printer className="w-4 h-4" />}
                >
                  Print / Export PDF
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
