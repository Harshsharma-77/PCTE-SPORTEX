import React, { useEffect, useState, useCallback } from 'react';
import {
  Activity,
  Calendar,
  Play,
  Pause,
  Plus,
  Minus,
  CheckCircle2,
  Flag,
  FileText,
  MapPin,
  RefreshCw,
  Zap,
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
import { refereeApi } from '../../services/refereeApi';
import { RefereeDashboardData, RefereeMatch } from '../../types/referee';

export const RefereeDashboardPage: React.FC = () => {
  const toast = useToast();

  const [data, setData] = useState<RefereeDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('assigned');

  // Live Match Scorer Console Modal State
  const [activeMatch, setActiveMatch] = useState<RefereeMatch | null>(null);

  // Live Match State
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [matchStatus, setMatchStatus] = useState<string>('LIVE');
  const [currentPeriod, setCurrentPeriod] = useState<string>('1st Half');
  const [isClockRunning, setIsClockRunning] = useState<boolean>(false);
  const [clockSeconds, setClockSeconds] = useState<number>(0);

  // Event Logger State
  const [eventTeamId, setEventTeamId] = useState<string>('');
  const [eventType, setEventType] = useState<string>('GOAL');
  const [eventCommentary, setEventCommentary] = useState<string>('');
  const [eventScoreVal] = useState<number>(1);
  const [eventSubmitting, setEventSubmitting] = useState<boolean>(false);

  // Conclude Match Report Modal State
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportNotes, setReportNotes] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);

  const fetchRefereeData = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    setError(null);
    try {
      const refData = await refereeApi.getDashboard();
      setData(refData);
    } catch (err: any) {
      console.error('Failed to load referee dashboard:', err);
      setError(err.response?.data?.message || err.message || 'Could not load officiating portal.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchRefereeData();
  }, [fetchRefereeData]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchRefereeData(false);
    toast.info('Synchronizing match allocations and live fixtures...');
  };

  // Open Live Console for a match
  const handleOpenConsole = async (match: RefereeMatch) => {
    try {
      const details = await refereeApi.getMatchDetails(match.id);
      setActiveMatch(details);
      setHomeScore(details.homeScore);
      setAwayScore(details.awayScore);
      setMatchStatus(details.status);
      setCurrentPeriod(details.currentPeriod || '1st Half');
      setIsClockRunning(details.isClockRunning);
      setClockSeconds(details.matchTimerSec);
      setEventTeamId(details.homeTeam.id);
    } catch (err: any) {
      toast.error('Failed to load match scoring console');
    }
  };

  // Start Match
  const handleStartMatch = async () => {
    if (!activeMatch) return;
    try {
      const updated = await refereeApi.startMatch(activeMatch.id);
      setActiveMatch(updated);
      setMatchStatus('LIVE');
      setIsClockRunning(true);
      toast.success('Match commenced! Live clock active.');
      fetchRefereeData(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to start match');
    }
  };

  // Toggle Clock
  const handleToggleClock = async () => {
    if (!activeMatch) return;
    const nextRunning = !isClockRunning;
    setIsClockRunning(nextRunning);
    try {
      await refereeApi.updateMatchStatus(activeMatch.id, {
        isClockRunning: nextRunning,
        status: nextRunning ? 'LIVE' : 'PAUSED',
        matchTimerSec: clockSeconds,
      });
      toast.info(nextRunning ? 'Match clock resumed' : 'Match clock paused');
    } catch (err: any) {
      toast.error('Failed to update timer');
    }
  };

  // Log Match Event
  const handleLogEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMatch) return;
    setEventSubmitting(true);
    try {
      await refereeApi.logMatchEvent(activeMatch.id, {
        eventType,
        timestampSec: clockSeconds,
        period: currentPeriod,
        teamId: eventTeamId || undefined,
        scoreValue: Number(eventScoreVal),
        commentary: eventCommentary,
      });

      toast.success(`Event logged: ${eventType}`);
      setEventCommentary('');

      // Refresh console match details
      const refreshed = await refereeApi.getMatchDetails(activeMatch.id);
      setActiveMatch(refreshed);
      setHomeScore(refreshed.homeScore);
      setAwayScore(refreshed.awayScore);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to record event');
    } finally {
      setEventSubmitting(false);
    }
  };

  // Submit Official Match Report
  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMatch) return;
    setReportSubmitting(true);
    try {
      await refereeApi.submitMatchReport(activeMatch.id, {
        homeScore,
        awayScore,
        notes: reportNotes,
      });
      toast.success('Official match report signed and submitted!');
      setReportModalOpen(false);
      setActiveMatch(null);
      fetchRefereeData(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit report');
    } finally {
      setReportSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Match Officials Console" subtitle="Varsity match officiating and real-time event scoring." />
        <Skeleton variant="card" height={160} />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          {[1, 2, 3, 4].map((i) => (
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
        <PageHeader title="Match Officials Console" subtitle="Varsity match officiating and real-time event scoring." />
        <ErrorState
          title="Referee Console Error"
          message={error || 'Could not load referee profile from database.'}
          onRetry={() => fetchRefereeData(true)}
        />
      </div>
    );
  }

  const { referee, metrics, liveMatches, upcomingMatches, completedMatches } = data;

  const tabsList = [
    { id: 'assigned', label: 'Assigned Matches', badge: upcomingMatches.length, icon: <Calendar className="w-3.5 h-3.5" /> },
    { id: 'live', label: 'Live Fixtures', badge: liveMatches.length || undefined, icon: <Activity className="w-3.5 h-3.5" /> },
    { id: 'history', label: 'Completed Reports', badge: completedMatches.length, icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="space-y-8">
      {/* 1. Official License Hero Header */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            <Avatar name={referee.name} size="xl" isOnline={true} />
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black text-white font-display tracking-tight">
                  {referee.name}
                </h1>
                <Badge variant="purple" size="sm">
                  {referee.officiatingLevel} Level Referee
                </Badge>
                <Badge variant="info" size="sm">
                  License: {referee.licenseNumber || 'PCTE-REF-2026'}
                </Badge>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400 mt-2 flex-wrap font-medium">
                <span className="font-semibold text-slate-300">Certified Sports:</span>
                {referee.certifiedSports.map((sp, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-full bg-slate-950 text-purple-300 border border-purple-500/30 text-[10px] font-mono">
                    {sp}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            isLoading={isRefreshing}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />}
          >
            Sync Allocations
          </Button>
        </div>
      </div>

      {/* 2. Key Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <Card variant="glass" className="p-4">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Allocated</span>
            <Flag className="w-4 h-4 text-sportex-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-display">
            <AnimatedCounter value={metrics.totalAssigned} />
          </div>
          <p className="text-[10px] text-sportex-300 font-semibold mt-0.5">Assigned Matches</p>
        </Card>

        <Card variant="default" className="p-4">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Live Active</span>
            <Activity className="w-4 h-4 text-rose-400 animate-pulse" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-400 font-display">
            <AnimatedCounter value={metrics.liveMatchesCount} />
          </div>
          <p className="text-[10px] text-rose-300 font-semibold mt-0.5">In-Play Fixtures</p>
        </Card>

        <Card variant="default" className="p-4">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Upcoming</span>
            <Calendar className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-purple-400 font-display">
            <AnimatedCounter value={metrics.upcomingCount} />
          </div>
          <p className="text-[10px] text-purple-300 font-semibold mt-0.5">Scheduled Next</p>
        </Card>

        <Card variant="glow" className="p-4">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Signed Reports</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-display">
            <AnimatedCounter value={metrics.completedCount} />
          </div>
          <p className="text-[10px] text-emerald-300 font-semibold mt-0.5">Concluded Matches</p>
        </Card>
      </div>

      {/* 3. Navigation Tabs */}
      <Tabs activeTab={activeTab} onChange={setActiveTab} tabs={tabsList} variant="pills" />

      {/* 4. Tab Panels */}
      <div>
        {/* TAB 1: ASSIGNED MATCHES */}
        {activeTab === 'assigned' && (
          <div className="space-y-4">
            {upcomingMatches.length === 0 ? (
              <EmptyState
                title="No Upcoming Matches Allocated"
                description="The Sports Administrator has not scheduled any new fixtures for your officiation schedule."
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {upcomingMatches.map((m) => (
                  <Card key={m.id} variant="glass" className="p-5 space-y-3">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span className="font-bold text-sportex-400">{m.tournament.name}</span>
                      <span className="font-mono text-purple-400">{m.roundName}</span>
                    </div>

                    <div className="flex items-center justify-between my-2 font-bold text-white text-base py-2 border-y border-slate-900">
                      <span>{m.homeTeam.name}</span>
                      <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-900 font-mono text-slate-400">
                        VS
                      </span>
                      <span>{m.awayTeam.name}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" /> {m.venue?.name || 'Main Stadium'}
                      </span>
                      <span className="font-mono text-slate-300">
                        {new Date(m.scheduledDate).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <div className="pt-2">
                      <Button
                        variant="primary"
                        size="sm"
                        className="w-full"
                        onClick={() => handleOpenConsole(m)}
                        leftIcon={<Zap className="w-3.5 h-3.5" />}
                      >
                        Open Live Scorer Console
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: LIVE MATCHES */}
        {activeTab === 'live' && (
          <div className="space-y-4">
            {liveMatches.length === 0 ? (
              <EmptyState
                title="No Matches Currently In-Play"
                description="Select an assigned match to kickoff and activate the real-time scoring console."
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {liveMatches.map((m) => (
                  <Card key={m.id} variant="glow" className="p-5 space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-white">{m.tournament.name}</span>
                      <Badge variant="danger" size="sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse mr-1" /> LIVE IN-PLAY
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between my-2 font-bold text-white text-lg py-2">
                      <span>{m.homeTeam.name}</span>
                      <span className="px-3 py-1 rounded-xl bg-slate-950 font-mono text-xl text-rose-400 border border-slate-800">
                        {m.homeScore} - {m.awayScore}
                      </span>
                      <span>{m.awayTeam.name}</span>
                    </div>

                    <Button
                      variant="glow"
                      size="sm"
                      className="w-full"
                      onClick={() => handleOpenConsole(m)}
                      leftIcon={<Activity className="w-3.5 h-3.5" />}
                    >
                      Resume Live Scoring
                    </Button>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: COMPLETED REPORTS */}
        {activeTab === 'history' && (
          <Card variant="glass" className="p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Signed Official Match Reports</h3>
              <Badge variant="success">{completedMatches.length} Signed Off</Badge>
            </div>

            {completedMatches.length === 0 ? (
              <EmptyState title="No Completed Matches" description="You have not signed off any completed matches yet." />
            ) : (
              <div className="space-y-3">
                {completedMatches.map((m) => (
                  <div
                    key={m.id}
                    className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <span className="font-bold text-white text-sm">
                        {m.homeTeam.name} {m.homeScore} - {m.awayScore} {m.awayTeam.name}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {m.tournament.sport.name} • {m.tournament.name} ({m.roundName})
                      </p>
                    </div>

                    <div className="text-right">
                      {m.winnerTeam ? (
                        <Badge variant="success" size="sm">
                          Winner: {m.winnerTeam.name}
                        </Badge>
                      ) : (
                        <Badge variant="warning" size="sm">
                          Match Drawn
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 5. LIVE MATCH SCORER CONSOLE MODAL                                        */}
      {/* ========================================================================= */}
      <Modal
        isOpen={!!activeMatch}
        onClose={() => setActiveMatch(null)}
        title={`Live Match Console: ${activeMatch?.homeTeam.name} vs ${activeMatch?.awayTeam.name}`}
        description={`${activeMatch?.tournament.name} (${activeMatch?.tournament.sport.name})`}
        maxWidth="lg"
      >
        {activeMatch && (
          <div className="space-y-6">
            {/* Live Scoreboard Display */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-mono">{currentPeriod}</span>
                <Badge variant={matchStatus === 'LIVE' ? 'danger' : 'warning'}>
                  {matchStatus}
                </Badge>
              </div>

              <div className="grid grid-cols-3 items-center gap-4">
                <div className="text-left space-y-2">
                  <h3 className="text-lg font-bold text-white">{activeMatch.homeTeam.name}</h3>
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setHomeScore((s) => Math.max(0, s - 1))}
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setHomeScore((s) => s + 1)}
                    >
                      <Plus className="w-3.5 h-3.5" /> +1
                    </Button>
                  </div>
                </div>

                <div>
                  <div className="text-4xl font-black text-white font-mono tracking-tight">
                    {homeScore} : {awayScore}
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">OFFICIAL SCORE</span>
                </div>

                <div className="text-right space-y-2">
                  <h3 className="text-lg font-bold text-white">{activeMatch.awayTeam.name}</h3>
                  <div className="flex items-center justify-end gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAwayScore((s) => Math.max(0, s - 1))}
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setAwayScore((s) => s + 1)}
                    >
                      <Plus className="w-3.5 h-3.5" /> +1
                    </Button>
                  </div>
                </div>
              </div>

              {/* Match Controls Toolbar */}
              <div className="pt-4 border-t border-slate-900 flex items-center justify-center gap-3">
                {matchStatus === 'SCHEDULED' ? (
                  <Button variant="glow" onClick={handleStartMatch} leftIcon={<Play className="w-4 h-4" />}>
                    Kickoff / Start Match
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleToggleClock}
                      leftIcon={isClockRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    >
                      {isClockRunning ? 'Pause Clock' : 'Resume Clock'}
                    </Button>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setReportModalOpen(true)}
                      leftIcon={<FileText className="w-3.5 h-3.5" />}
                    >
                      Conclude & Sign Report
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Quick Event Logger */}
            <Card variant="glass" className="p-4 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Log Match Event & Incident
              </h4>

              <form onSubmit={handleLogEvent} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Select
                    label="Team"
                    value={eventTeamId}
                    onChange={(e) => setEventTeamId(e.target.value)}
                    options={[
                      { value: activeMatch.homeTeam.id, label: activeMatch.homeTeam.name },
                      { value: activeMatch.awayTeam.id, label: activeMatch.awayTeam.name },
                    ]}
                  />

                  <Select
                    label="Event Incident Type"
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                    options={[
                      { value: 'GOAL', label: 'Goal (+1)' },
                      { value: 'POINT', label: 'Point (+1)' },
                      { value: 'YELLOW_CARD', label: 'Yellow Card' },
                      { value: 'RED_CARD', label: 'Red Card' },
                      { value: 'FOUL', label: 'Foul / Penalty' },
                      { value: 'SUBSTITUTION', label: 'Substitution' },
                    ]}
                  />

                  <Input
                    label="Commentary / Details"
                    placeholder="e.g. Penalty scored into top right"
                    value={eventCommentary}
                    onChange={(e) => setEventCommentary(e.target.value)}
                  />
                </div>

                <div className="flex justify-end">
                  <Button type="submit" variant="primary" size="sm" isLoading={eventSubmitting}>
                    Record Event to Ledger
                  </Button>
                </div>
              </form>
            </Card>

            {/* Event Timeline */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase">Match Event Stream</h4>
              {(!activeMatch.events || activeMatch.events.length === 0) ? (
                <p className="text-xs text-slate-500 italic py-2">No live incidents recorded yet.</p>
              ) : (
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {activeMatch.events.map((ev) => (
                    <div
                      key={ev.id}
                      className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <Badge variant={ev.eventType.includes('CARD') ? 'warning' : 'info'} size="sm">
                          {ev.eventType}
                        </Badge>
                        <span className="text-white">{ev.commentary || 'Incident recorded'}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">{ev.period || 'Match'}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Conclude & Sign Match Report Modal */}
      <Modal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        title="Finalize & Sign Official Match Report"
        description="This will lock the final score, update tournament points tables, and conclude the match."
        maxWidth="md"
      >
        <form onSubmit={handleSubmitReport} className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center font-mono">
            <span className="text-xs text-slate-400">Final Scoreboard</span>
            <div className="text-2xl font-bold text-white mt-1">
              {activeMatch?.homeTeam.name} ({homeScore}) - ({awayScore}) {activeMatch?.awayTeam.name}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Official Sign-Off Notes / Disciplinary Summary</label>
            <textarea
              rows={3}
              placeholder="Enter official match report summary, disciplinary issues, or fair-play notes..."
              value={reportNotes}
              onChange={(e) => setReportNotes(e.target.value)}
              className="w-full rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs p-3 focus:outline-none focus:ring-2 focus:ring-sportex-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <Button type="button" variant="ghost" onClick={() => setReportModalOpen(false)}>
              Back to Scorer
            </Button>
            <Button type="submit" variant="primary" isLoading={reportSubmitting}>
              Finalize & Submit Report
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
