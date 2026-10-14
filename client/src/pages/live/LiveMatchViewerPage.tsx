import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  RotateCcw,
  Zap,
  CheckCircle2,
  Clock,
  MapPin,
  Users,
  Shield,
  Radio,
  ArrowLeft,
  RefreshCw,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Tabs } from '../../components/ui/Tabs';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { ErrorState } from '../../components/ui/ErrorState';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { liveScoreApi } from '../../services/liveScoreApi';
import { getSocket } from '../../services/socket';
import { LiveMatch, MatchEventItem } from '../../types/liveScore';

export const LiveMatchViewerPage: React.FC = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  const [match, setMatch] = useState<LiveMatch | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('stream');

  // Referee Controller Visibility
  const [showController, setShowController] = useState<boolean>(true);
  const [isSubmittingEvent, setIsSubmittingEvent] = useState<boolean>(false);

  // Cricket Scoring State
  const [cricketRuns, setCricketRuns] = useState<number>(0);
  const [cricketWickets, setCricketWickets] = useState<number>(0);
  const [cricketOvers, setCricketOvers] = useState<number>(0);
  const [cricketBalls, setCricketBalls] = useState<number>(0);

  // Conclude Modal
  const [concludeModalOpen, setConcludeModalOpen] = useState<boolean>(false);
  const [concludeNotes, setConcludeNotes] = useState<string>('');
  const [concludeSubmitting, setConcludeSubmitting] = useState<boolean>(false);

  // Filter for events
  const [eventFilter, setEventFilter] = useState<string>('ALL');

  // Live Timer ticker ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const isScorerAuthorized =
    user?.role === 'REFEREE' || user?.role === 'SUPER_ADMIN' || user?.role === 'SPORTS_ADMIN';

  const fetchMatchDetails = useCallback(async (showLoading = true) => {
    if (!matchId) return;
    if (showLoading) setIsLoading(true);
    setError(null);
    try {
      const data = await liveScoreApi.getLiveMatchById(matchId);
      setMatch(data);
    } catch (err: any) {
      console.error('Failed to load live match:', err);
      setError(err.response?.data?.message || err.message || 'Could not load match details.');
    } finally {
      setIsLoading(false);
    }
  }, [matchId]);

  // Setup Socket.IO real-time listener & join room
  useEffect(() => {
    if (!matchId) return;
    fetchMatchDetails();

    const socket = getSocket();

    // Join Match Room
    socket.emit('join:match', matchId);

    // 1. Listen for Score Updates
    const handleScoreUpdate = (data: {
      matchId: string;
      homeScore: number;
      awayScore: number;
      homeSubScore?: string;
      awaySubScore?: string;
      currentPeriod?: string;
      matchTimerSec?: number;
    }) => {
      if (data.matchId === matchId) {
        setMatch((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            homeScore: data.homeScore,
            awayScore: data.awayScore,
            homeSubScore: data.homeSubScore !== undefined ? data.homeSubScore : prev.homeSubScore,
            awaySubScore: data.awaySubScore !== undefined ? data.awaySubScore : prev.awaySubScore,
            currentPeriod: data.currentPeriod !== undefined ? data.currentPeriod : prev.currentPeriod,
            matchTimerSec: data.matchTimerSec !== undefined ? data.matchTimerSec : prev.matchTimerSec,
          };
        });
      }
    };

    // 2. Listen for New Events Triggered
    const handleEventTriggered = (data: { matchId: string; event: MatchEventItem }) => {
      if (data.matchId === matchId) {
        setMatch((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            events: [data.event, ...prev.events],
          };
        });
        toast.info(`⚡ Live Event: ${data.event.commentary || data.event.eventType}`);
      }
    };

    // 3. Listen for Event Undone
    const handleEventUndone = (data: { matchId: string; eventId: string; homeScore?: number; awayScore?: number }) => {
      if (data.matchId === matchId) {
        setMatch((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            homeScore: data.homeScore !== undefined ? data.homeScore : prev.homeScore,
            awayScore: data.awayScore !== undefined ? data.awayScore : prev.awayScore,
            events: prev.events.filter((e) => e.id !== data.eventId),
          };
        });
        toast.warning('Previous event was undone by match official.');
      }
    };

    // 4. Listen for Status / Clock changes
    const handleStatusChange = (data: { matchId: string; status: any; isClockRunning?: boolean; currentPeriod?: string }) => {
      if (data.matchId === matchId) {
        setMatch((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            status: data.status,
            isClockRunning: data.isClockRunning !== undefined ? data.isClockRunning : prev.isClockRunning,
            currentPeriod: data.currentPeriod !== undefined ? data.currentPeriod : prev.currentPeriod,
          };
        });
      }
    };

    // 5. Listen for Clock Sync
    const handleClockSync = (data: { matchId: string; isClockRunning: boolean; matchTimerSec: number; currentPeriod?: string; status?: any }) => {
      if (data.matchId === matchId) {
        setMatch((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            isClockRunning: data.isClockRunning,
            matchTimerSec: data.matchTimerSec,
            currentPeriod: data.currentPeriod || prev.currentPeriod,
            status: data.status || prev.status,
          };
        });
      }
    };

    // 6. Listen for Match Completed
    const handleMatchCompleted = (data: { matchId: string; completedMatch: LiveMatch }) => {
      if (data.matchId === matchId) {
        setMatch(data.completedMatch);
        toast.success('Match has concluded! Final scores and standings locked.');
      }
    };

    socket.on('score:update', handleScoreUpdate);
    socket.on('event:triggered', handleEventTriggered);
    socket.on('event:undone', handleEventUndone);
    socket.on('match:status_change', handleStatusChange);
    socket.on('match:clock_sync', handleClockSync);
    socket.on('match:completed', handleMatchCompleted);

    return () => {
      socket.emit('leave:match', matchId);
      socket.off('score:update', handleScoreUpdate);
      socket.off('event:triggered', handleEventTriggered);
      socket.off('event:undone', handleEventUndone);
      socket.off('match:status_change', handleStatusChange);
      socket.off('match:clock_sync', handleClockSync);
      socket.off('match:completed', handleMatchCompleted);
    };
  }, [matchId, fetchMatchDetails]);

  // Local Match Timer Tick
  useEffect(() => {
    if (match?.isClockRunning) {
      timerRef.current = setInterval(() => {
        setMatch((prev) => (prev ? { ...prev, matchTimerSec: prev.matchTimerSec + 1 } : prev));
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [match?.isClockRunning]);

  // Format seconds to mm:ss
  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Referee Actions
  const handleStartKickoff = async () => {
    if (!matchId) return;
    try {
      await liveScoreApi.startMatch(matchId);
      toast.success('Match commenced! Real-time stream active.');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to start match');
    }
  };

  const handleToggleClock = async () => {
    if (!match || !matchId) return;
    const nextRunning = !match.isClockRunning;
    try {
      await liveScoreApi.syncClock(matchId, {
        isClockRunning: nextRunning,
        matchTimerSec: match.matchTimerSec,
        status: nextRunning ? 'LIVE' : 'PAUSED',
        currentPeriod: match.currentPeriod || '1st Half',
      });
    } catch (err: any) {
      toast.error('Failed to sync timer');
    }
  };

  const handleQuickScoreEvent = async (
    teamId: string,
    eventType: string,
    scoreDelta: number,
    commentary: string,
    subScoreText?: string
  ) => {
    if (!match || !matchId) return;
    setIsSubmittingEvent(true);
    try {
      await liveScoreApi.updateScoreAndLogEvent(matchId, {
        teamId,
        eventType,
        scoreDelta,
        commentary,
        subScoreText,
        currentPeriod: match.currentPeriod || '1st Half',
        timestampSec: match.matchTimerSec,
      });
      toast.success(`Logged ${eventType} for ${teamId === match.homeTeamId ? match.homeTeam.name : match.awayTeam.name}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update score');
    } finally {
      setIsSubmittingEvent(false);
    }
  };

  const handleCricketBall = (teamId: string, runsScored: number, isWicket = false, isExtra = false) => {
    if (!match || !matchId) return;

    let newRuns = cricketRuns + runsScored;
    let newWickets = isWicket ? cricketWickets + 1 : cricketWickets;
    let newBalls = isExtra ? cricketBalls : cricketBalls + 1;
    let newOvers = cricketOvers;

    if (newBalls === 6) {
      newOvers += 1;
      newBalls = 0;
    }

    setCricketRuns(newRuns);
    setCricketWickets(newWickets);
    setCricketOvers(newOvers);
    setCricketBalls(newBalls);

    const subScore = `${newRuns}/${newWickets} (${newOvers}.${newBalls} ov)`;
    const commentary = isWicket
      ? `WICKET! Batter dismissed! Score is now ${subScore}`
      : runsScored === 4
      ? `FOUR! Boundary hit! Score: ${subScore}`
      : runsScored === 6
      ? `SIX! Huge maximum! Score: ${subScore}`
      : `${runsScored} run(s) taken. Score: ${subScore}`;

    handleQuickScoreEvent(
      teamId,
      isWicket ? 'WICKET' : 'RUNS',
      runsScored,
      commentary,
      subScore
    );
  };

  const handleUndoLastEvent = async () => {
    if (!match || !matchId || match.events.length === 0) return;
    const latest = match.events[0];
    try {
      await liveScoreApi.undoLastEvent(matchId, latest.id);
      toast.success('Last match event undone');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to undo event');
    }
  };

  const handleConcludeMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!match || !matchId) return;
    setConcludeSubmitting(true);
    try {
      await liveScoreApi.concludeMatch(matchId, {
        homeScore: match.homeScore,
        awayScore: match.awayScore,
        notes: concludeNotes,
      });
      setConcludeModalOpen(false);
      toast.success('Match completed and final standings recorded!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to conclude match');
    } finally {
      setConcludeSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton variant="card" height={260} />
        <Skeleton variant="card" height={400} />
      </div>
    );
  }

  if (error || !match) {
    return (
      <div className="space-y-6">
        <ErrorState
          title="Match Unavailable"
          message={error || 'Could not load match live broadcast.'}
          onRetry={() => fetchMatchDetails(true)}
        />
      </div>
    );
  }

  const sportScoring = match.tournament.sport.scoringType || 'GOALS';
  const sportName = match.tournament.sport.name.toLowerCase();

  const isFootball = sportName.includes('football') || sportName.includes('soccer') || sportScoring === 'GOALS';
  const isCricket = sportName.includes('cricket') || sportScoring === 'RUNS_WICKETS';
  const isBasketball = sportName.includes('basketball') || sportScoring === 'POINTS';

  const filteredEvents = match.events.filter((ev) => {
    if (eventFilter === 'ALL') return true;
    if (eventFilter === 'SCORES') return ev.scoreValue > 0;
    if (eventFilter === 'CARDS') return ev.eventType.includes('CARD');
    if (eventFilter === 'SUBS') return ev.eventType === 'SUBSTITUTION';
    return true;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Top Navigation Bar */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/live')}
          leftIcon={<ArrowLeft className="w-4 h-4" />}
        >
          Back to Live Arena
        </Button>

        <div className="flex items-center gap-2">
          {match.status === 'LIVE' && (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-950 text-rose-300 border border-rose-800 text-xs font-bold uppercase tracking-wider font-mono">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              LIVE WEBSOCKET STREAM
            </span>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => fetchMatchDetails(false)}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* 2. Flagship Centerpiece Scoreboard */}
      <div className="relative overflow-hidden p-6 sm:p-10 rounded-3xl bg-slate-900/95 border-2 border-slate-800 shadow-2xl backdrop-blur-2xl">
        {/* Glow Effects */}
        <div
          className="absolute -top-20 -left-20 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: match.homeTeam.jerseyColor || '#0284c7' }}
        />
        <div
          className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: match.awayTeam.jerseyColor || '#ef4444' }}
        />

        <div className="relative z-10 space-y-6">
          {/* Tournament & Period Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div>
              <span className="text-xs font-mono font-bold text-sportex-400 uppercase tracking-wider">
                {match.tournament.sport.name} • {match.tournament.name}
              </span>
              <p className="text-xs text-slate-400 mt-0.5">{match.roundName}</p>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant={match.status === 'LIVE' ? 'danger' : match.status === 'COMPLETED' ? 'success' : 'warning'}>
                {match.status}
              </Badge>
              <span className="px-3 py-1 rounded-full bg-slate-950 text-slate-300 font-mono text-xs border border-slate-800 font-bold">
                {match.currentPeriod || '1st Half'}
              </span>
            </div>
          </div>

          {/* Core Scoreboard Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-6 py-4">
            {/* Home Team */}
            <div className="text-center md:text-left space-y-2">
              <div className="flex items-center justify-center md:justify-start gap-3">
                <div
                  className="w-4 h-4 rounded-full shadow-lg"
                  style={{ backgroundColor: match.homeTeam.jerseyColor || '#0284c7' }}
                />
                <h2 className="text-2xl sm:text-3xl font-black text-white font-display tracking-tight">
                  {match.homeTeam.name}
                </h2>
              </div>
              {match.homeSubScore && (
                <p className="text-sm font-mono text-cyan-400 font-bold">{match.homeSubScore}</p>
              )}
            </div>

            {/* Huge Score Digits & Clock */}
            <div className="text-center space-y-2">
              <div className="text-5xl sm:text-7xl font-black text-white font-mono tracking-tighter font-display flex items-center justify-center gap-3">
                <span>{match.homeScore}</span>
                <span className="text-slate-600 font-light">:</span>
                <span>{match.awayScore}</span>
              </div>

              <div className="flex items-center justify-center gap-2 text-xs font-mono text-slate-400">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span className={`font-bold ${match.isClockRunning ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {formatTimer(match.matchTimerSec)}
                </span>
                {match.isClockRunning && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </div>
            </div>

            {/* Away Team */}
            <div className="text-center md:text-right space-y-2">
              <div className="flex items-center justify-center md:justify-end gap-3">
                <h2 className="text-2xl sm:text-3xl font-black text-white font-display tracking-tight">
                  {match.awayTeam.name}
                </h2>
                <div
                  className="w-4 h-4 rounded-full shadow-lg"
                  style={{ backgroundColor: match.awayTeam.jerseyColor || '#ef4444' }}
                />
              </div>
              {match.awaySubScore && (
                <p className="text-sm font-mono text-cyan-400 font-bold">{match.awaySubScore}</p>
              )}
            </div>
          </div>

          {/* Venue & Referee Details */}
          <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 pt-4 border-t border-slate-800/80 gap-2">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-500" /> {match.venue?.name || 'PCTE Sports Complex'}
            </span>
            {match.referee && (
              <span className="flex items-center gap-1.5 font-mono">
                <Shield className="w-3.5 h-3.5 text-purple-400" /> Referee: {match.referee.user.name}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 3. Referee / Admin Real-Time Control Deck */}
      {isScorerAuthorized && match.status !== 'COMPLETED' && (
        <Card variant="glass" className="p-6 space-y-6 border-sportex-500/40 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Radio className="w-5 h-5 text-rose-500 animate-pulse" />
              <h3 className="text-base font-bold text-white">Referee Live Scoring Deck</h3>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={() => setShowController(!showController)}
              >
                {showController ? 'Collapse Deck' : 'Expand Deck'}
              </Button>
            </div>
          </div>

          {showController && (
            <div className="space-y-6">
              {/* Match Clock & Period Controls */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {match.status === 'SCHEDULED' ? (
                    <Button variant="glow" size="sm" onClick={handleStartKickoff} leftIcon={<Play className="w-3.5 h-3.5" />}>
                      Kickoff Match
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleToggleClock}
                      leftIcon={match.isClockRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    >
                      {match.isClockRunning ? 'Pause Clock' : 'Resume Clock'}
                    </Button>
                  )}

                  <span className="font-mono text-sm font-bold text-white px-3 py-1 rounded bg-slate-900 border border-slate-800">
                    Timer: {formatTimer(match.matchTimerSec)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleUndoLastEvent}
                    disabled={match.events.length === 0}
                    leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                  >
                    Undo Last Event
                  </Button>

                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setConcludeModalOpen(true)}
                    leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                  >
                    Conclude Match
                  </Button>
                </div>
              </div>

              {/* SPORT-SPECIFIC SCORING ACTIONS */}
              {isFootball && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Home Team Actions */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <h4 className="text-xs font-bold text-white flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: match.homeTeam.jerseyColor || '#0284c7' }} />
                      {match.homeTeam.name} (Home)
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        disabled={isSubmittingEvent}
                        onClick={() => handleQuickScoreEvent(match.homeTeamId, 'GOAL', 1, `GOAL for ${match.homeTeam.name}!`)}
                      >
                        ⚽ Goal (+1)
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isSubmittingEvent}
                        onClick={() => handleQuickScoreEvent(match.homeTeamId, 'YELLOW_CARD', 0, `Yellow Card shown to ${match.homeTeam.name}`)}
                      >
                        🟨 Yellow Card
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isSubmittingEvent}
                        onClick={() => handleQuickScoreEvent(match.homeTeamId, 'RED_CARD', 0, `RED CARD issued to ${match.homeTeam.name}!`)}
                      >
                        🟥 Red Card
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isSubmittingEvent}
                        onClick={() => handleQuickScoreEvent(match.homeTeamId, 'SUBSTITUTION', 0, `Substitution for ${match.homeTeam.name}`)}
                      >
                        🔄 Sub
                      </Button>
                    </div>
                  </div>

                  {/* Away Team Actions */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <h4 className="text-xs font-bold text-white flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: match.awayTeam.jerseyColor || '#ef4444' }} />
                      {match.awayTeam.name} (Away)
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        disabled={isSubmittingEvent}
                        onClick={() => handleQuickScoreEvent(match.awayTeamId, 'GOAL', 1, `GOAL for ${match.awayTeam.name}!`)}
                      >
                        ⚽ Goal (+1)
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isSubmittingEvent}
                        onClick={() => handleQuickScoreEvent(match.awayTeamId, 'YELLOW_CARD', 0, `Yellow Card shown to ${match.awayTeam.name}`)}
                      >
                        🟨 Yellow Card
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isSubmittingEvent}
                        onClick={() => handleQuickScoreEvent(match.awayTeamId, 'RED_CARD', 0, `RED CARD issued to ${match.awayTeam.name}!`)}
                      >
                        🟥 Red Card
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isSubmittingEvent}
                        onClick={() => handleQuickScoreEvent(match.awayTeamId, 'SUBSTITUTION', 0, `Substitution for ${match.awayTeam.name}`)}
                      >
                        🔄 Sub
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {isCricket && (
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Cricket Ball-by-Ball Score Engine
                    </h4>
                    <span className="text-xs font-mono text-cyan-400">
                      Current Innings: {cricketRuns}/{cricketWickets} ({cricketOvers}.{cricketBalls} ov)
                    </span>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleCricketBall(match.homeTeamId, 0)}>
                      Dot (0)
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleCricketBall(match.homeTeamId, 1)}>
                      +1 Run
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleCricketBall(match.homeTeamId, 2)}>
                      +2 Runs
                    </Button>
                    <Button variant="primary" size="sm" onClick={() => handleCricketBall(match.homeTeamId, 4)}>
                      🏏 FOUR (+4)
                    </Button>
                    <Button variant="glow" size="sm" onClick={() => handleCricketBall(match.homeTeamId, 6)}>
                      🚀 SIX (+6)
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => handleCricketBall(match.homeTeamId, 0, true)}>
                      ☝️ WICKET
                    </Button>
                  </div>
                </div>
              )}

              {isBasketball && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <h4 className="text-xs font-bold text-white">{match.homeTeam.name}</h4>
                    <div className="grid grid-cols-3 gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleQuickScoreEvent(match.homeTeamId, 'POINT', 1, '+1 Free Throw')}>
                        +1 Free Throw
                      </Button>
                      <Button variant="primary" size="sm" onClick={() => handleQuickScoreEvent(match.homeTeamId, 'POINT', 2, '+2 Field Goal')}>
                        +2 2-Pointer
                      </Button>
                      <Button variant="glow" size="sm" onClick={() => handleQuickScoreEvent(match.homeTeamId, 'POINT', 3, '+3 Three-Pointer')}>
                        🔥 +3 Pointer
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <h4 className="text-xs font-bold text-white">{match.awayTeam.name}</h4>
                    <div className="grid grid-cols-3 gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleQuickScoreEvent(match.awayTeamId, 'POINT', 1, '+1 Free Throw')}>
                        +1 Free Throw
                      </Button>
                      <Button variant="primary" size="sm" onClick={() => handleQuickScoreEvent(match.awayTeamId, 'POINT', 2, '+2 Field Goal')}>
                        +2 2-Pointer
                      </Button>
                      <Button variant="glow" size="sm" onClick={() => handleQuickScoreEvent(match.awayTeamId, 'POINT', 3, '+3 Three-Pointer')}>
                        🔥 +3 Pointer
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>
      )}

      {/* 4. Tab Panels: Play-by-Play Stream & Squad Lineups */}
      <Tabs
        activeTab={activeTab}
        onChange={setActiveTab}
        variant="pills"
        tabs={[
          { id: 'stream', label: 'Play-by-Play Commentary', badge: match.events.length, icon: <Zap className="w-3.5 h-3.5" /> },
          { id: 'lineups', label: 'Squad Lineups & Rosters', icon: <Users className="w-3.5 h-3.5" /> },
        ]}
      />

      {/* TAB 1: PLAY-BY-PLAY EVENT STREAM */}
      {activeTab === 'stream' && (
        <Card variant="glass" className="p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white">Live Match Incident Stream</h3>
              <p className="text-xs text-slate-400">Play-by-play events broadcast via WebSocket</p>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {['ALL', 'SCORES', 'CARDS', 'SUBS'].map((f) => (
                <button
                  key={f}
                  onClick={() => setEventFilter(f)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
                    eventFilter === f
                      ? 'bg-sportex-500 text-white'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {filteredEvents.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-8 text-center">No match events logged yet.</p>
          ) : (
            <div className="space-y-2.5">
              <AnimatePresence initial={false}>
                {filteredEvents.map((ev) => (
                  <motion.div
                    key={ev.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={
                          ev.scoreValue > 0
                            ? 'success'
                            : ev.eventType.includes('CARD')
                            ? 'warning'
                            : 'info'
                        }
                        size="sm"
                      >
                        {ev.eventType}
                      </Badge>
                      <div>
                        <p className="font-semibold text-white">
                          {ev.commentary || `${ev.eventType} logged`}
                        </p>
                        {ev.student && (
                          <p className="text-[10px] text-slate-400">Player: {ev.student.user.name}</p>
                        )}
                      </div>
                    </div>

                    <div className="text-right font-mono text-[10px] text-slate-500">
                      <span>{ev.period || 'Match'}</span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </Card>
      )}

      {/* TAB 2: SQUAD LINEUPS */}
      {activeTab === 'lineups' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Home Lineup */}
          <Card variant="glass" className="p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: match.homeTeam.jerseyColor || '#0284c7' }} />
              {match.homeTeam.name} Roster
            </h3>
            {(!match.homeTeam.members || match.homeTeam.members.length === 0) ? (
              <p className="text-xs text-slate-500 italic py-4">No squad roster registered.</p>
            ) : (
              <div className="space-y-2">
                {match.homeTeam.members.map((m) => (
                  <div
                    key={m.id}
                    className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-slate-500 font-bold">#{m.jerseyNumber || 'TBD'}</span>
                      <span className="text-white font-semibold">{m.student.user.name}</span>
                      {m.isCaptain && <Badge variant="warning" size="sm">C</Badge>}
                    </div>
                    <span className="text-[10px] text-slate-400">{m.position || 'Player'}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Away Lineup */}
          <Card variant="glass" className="p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: match.awayTeam.jerseyColor || '#ef4444' }} />
              {match.awayTeam.name} Roster
            </h3>
            {(!match.awayTeam.members || match.awayTeam.members.length === 0) ? (
              <p className="text-xs text-slate-500 italic py-4">No squad roster registered.</p>
            ) : (
              <div className="space-y-2">
                {match.awayTeam.members.map((m) => (
                  <div
                    key={m.id}
                    className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-slate-500 font-bold">#{m.jerseyNumber || 'TBD'}</span>
                      <span className="text-white font-semibold">{m.student.user.name}</span>
                      {m.isCaptain && <Badge variant="warning" size="sm">C</Badge>}
                    </div>
                    <span className="text-[10px] text-slate-400">{m.position || 'Player'}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. CONCLUDE MATCH MODAL                                                    */}
      {/* ========================================================================= */}
      <Modal
        isOpen={concludeModalOpen}
        onClose={() => setConcludeModalOpen(false)}
        title="Conclude Live Match & Finalize Official Report"
        description="This locks the final score, updates tournament points tables, and broadcasts match conclusion."
        maxWidth="md"
      >
        <form onSubmit={handleConcludeMatch} className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center font-mono space-y-1">
            <span className="text-xs text-slate-400">Final Score</span>
            <div className="text-3xl font-black text-white">
              {match.homeTeam.name} ({match.homeScore}) - ({match.awayScore}) {match.awayTeam.name}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Official Match Notes / Disciplinary Report</label>
            <textarea
              rows={3}
              placeholder="Enter official match notes or final score verification..."
              value={concludeNotes}
              onChange={(e) => setConcludeNotes(e.target.value)}
              className="w-full rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs p-3 focus:outline-none focus:ring-2 focus:ring-sportex-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <Button type="button" variant="ghost" onClick={() => setConcludeModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="danger" isLoading={concludeSubmitting}>
              Conclude & Finalize Match
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
