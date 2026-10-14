import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  Calendar,
  MapPin,
  RefreshCw,
  Zap,
  ArrowRight,
  Layers,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { ErrorState } from '../../components/ui/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';
import { useToast } from '../../context/ToastContext';
import { liveScoreApi } from '../../services/liveScoreApi';
import { getSocket } from '../../services/socket';
import { LiveMatch } from '../../types/liveScore';

export const LiveMatchCenterPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [matches, setMatches] = useState<LiveMatch[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSport, setSelectedSport] = useState<string>('ALL');

  const fetchLiveMatches = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    setError(null);
    try {
      const data = await liveScoreApi.getLiveMatchesFeed();
      setMatches(data);
    } catch (err: any) {
      console.error('Failed to load live matches feed:', err);
      setError(err.response?.data?.message || err.message || 'Could not connect to live match gateway.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchLiveMatches();

    // Connect to real-time Socket.IO global channel
    const socket = getSocket();

    const handleScoreTicker = (data: { matchId: string; homeScore: number; awayScore: number; latestEvent: string }) => {
      setMatches((prev) =>
        prev.map((m) =>
          m.id === data.matchId
            ? { ...m, homeScore: data.homeScore, awayScore: data.awayScore }
            : m
        )
      );
    };

    const handleMatchStarted = (data: { matchId: string; match: LiveMatch }) => {
      fetchLiveMatches(false);
      toast.info(`Match Kickoff: ${data.match?.homeTeam?.name} vs ${data.match?.awayTeam?.name} is now LIVE!`);
    };

    socket.on('live:score_ticker', handleScoreTicker);
    socket.on('live:match_started', handleMatchStarted);

    return () => {
      socket.off('live:score_ticker', handleScoreTicker);
      socket.off('live:match_started', handleMatchStarted);
    };
  }, [fetchLiveMatches]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchLiveMatches(false);
    toast.info('Refreshing live scores from PostgreSQL database...');
  };

  const sportsCategories = ['ALL', ...Array.from(new Set(matches.map((m) => m.tournament.sport.name)))];

  const filteredMatches = matches.filter((m) => {
    if (selectedSport === 'ALL') return true;
    return m.tournament.sport.name.toLowerCase() === selectedSport.toLowerCase();
  });

  const inPlayMatches = filteredMatches.filter((m) => m.status === 'LIVE' || m.status === 'WARMUP' || m.status === 'PAUSED');
  const upcomingMatches = filteredMatches.filter((m) => m.status === 'SCHEDULED');

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Campus Live Match Arena"
          subtitle="Real-time WebSocket match broadcasts, instant scoring, and commentary."
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton variant="card" height={240} />
          <Skeleton variant="card" height={240} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Campus Live Match Arena"
          subtitle="Real-time WebSocket match broadcasts, instant scoring, and commentary."
        />
        <ErrorState
          title="Live Arena Connection Error"
          message={error}
          onRetry={() => fetchLiveMatches(true)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 1. Header Banner */}
      <PageHeader
        title="Campus Live Match Arena"
        subtitle="Live WebSocket-powered scores, play-by-play telemetry, and varsity fixtures."
        badge={
          <Badge variant="danger" size="sm">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping mr-1.5" />
            {inPlayMatches.length} In-Play Live
          </Badge>
        }
        actions={
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            isLoading={isRefreshing}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />}
          >
            Sync Feeds
          </Button>
        }
      />

      {/* 2. Sport Category Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mr-2">
          <Layers className="w-3.5 h-3.5" /> Sport:
        </span>
        {sportsCategories.map((sport) => (
          <button
            key={sport}
            onClick={() => setSelectedSport(sport)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedSport === sport
                ? 'bg-sportex-500 text-white shadow-lg shadow-sportex-500/25'
                : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {sport}
          </button>
        ))}
      </div>

      {/* 3. Live In-Play Matches Showcase */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-rose-500 animate-pulse" /> Live In-Play Fixtures
          </h2>
          <span className="text-xs font-mono text-slate-400">Zero Page Refresh Required</span>
        </div>

        {inPlayMatches.length === 0 ? (
          <Card variant="glass" className="p-8 text-center">
            <EmptyState
              title="No In-Play Matches Right Now"
              description="No varsity matches are currently in-play. Check the upcoming scheduled fixtures below."
            />
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {inPlayMatches.map((match) => (
              <Card
                key={match.id}
                variant="glow"
                className="p-6 space-y-5 cursor-pointer hover:border-sportex-500/50 transition-all"
                onClick={() => navigate(`/live/${match.id}`)}
              >
                {/* Header: Tournament & Live Status */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-mono font-bold text-sportex-400 uppercase">
                      {match.tournament.sport.name} • {match.tournament.name}
                    </span>
                    <p className="text-[11px] text-slate-400">{match.roundName}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="danger" size="sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse mr-1" />
                      LIVE {match.currentPeriod || '1st Half'}
                    </Badge>
                  </div>
                </div>

                {/* Main Scoreboard Display */}
                <div className="grid grid-cols-3 items-center gap-4 py-2 border-y border-slate-800/80">
                  <div className="text-left space-y-1">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: match.homeTeam.jerseyColor || '#0284c7' }}
                      />
                      <h3 className="text-base font-bold text-white">{match.homeTeam.name}</h3>
                    </div>
                    {match.homeSubScore && (
                      <span className="text-[10px] font-mono text-cyan-400 font-bold block">
                        {match.homeSubScore}
                      </span>
                    )}
                  </div>

                  <div className="text-center">
                    <div className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight font-display">
                      {match.homeScore} - {match.awayScore}
                    </div>
                    <span className="text-[10px] text-rose-400 font-mono font-bold uppercase">
                      IN-PLAY
                    </span>
                  </div>

                  <div className="text-right space-y-1">
                    <div className="flex items-center justify-end gap-2">
                      <h3 className="text-base font-bold text-white">{match.awayTeam.name}</h3>
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: match.awayTeam.jerseyColor || '#ef4444' }}
                      />
                    </div>
                    {match.awaySubScore && (
                      <span className="text-[10px] font-mono text-cyan-400 font-bold block">
                        {match.awaySubScore}
                      </span>
                    )}
                  </div>
                </div>

                {/* Latest Event Commentary Ticker */}
                {match.events && match.events.length > 0 && (
                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs flex items-center justify-between text-slate-300">
                    <div className="flex items-center gap-2 truncate">
                      <Zap className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                      <span className="truncate">{match.events[0].commentary || `${match.events[0].eventType} logged`}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono flex-shrink-0 ml-2">
                      {match.events[0].period || 'Match'}
                    </span>
                  </div>
                )}

                {/* Footer Info & Action */}
                <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" /> {match.venue?.name || 'Main Stadium'}
                  </span>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/live/${match.id}`);
                    }}
                    rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                  >
                    Enter Live Arena
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* 4. Upcoming Scheduled Fixtures */}
      <div className="space-y-4 pt-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-purple-400" /> Upcoming Match Fixtures
        </h2>

        {upcomingMatches.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-4">No upcoming fixtures scheduled.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingMatches.map((m) => (
              <Card key={m.id} variant="default" className="p-4 space-y-3">
                <div className="flex justify-between text-xs text-slate-400">
                  <span className="font-bold text-sportex-400">{m.tournament.sport.name}</span>
                  <span className="font-mono text-purple-400 text-[10px]">{m.roundName}</span>
                </div>

                <div className="flex items-center justify-between my-2 font-bold text-white text-sm py-1.5 border-y border-slate-900">
                  <span>{m.homeTeam.name}</span>
                  <span className="text-xs font-mono text-slate-500 px-2 py-0.5 rounded bg-slate-900">VS</span>
                  <span>{m.awayTeam.name}</span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-500" /> {m.venue?.name || 'Main Stadium'}
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

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => navigate(`/live/${m.id}`)}
                >
                  View Match Arena
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
