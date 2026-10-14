import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy,
  Award,
  Activity,
  Layers,
  GraduationCap,
  Shield,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { Tabs } from '../../components/ui/Tabs';
import { Skeleton } from '../../components/ui/Skeleton';
import { ErrorState } from '../../components/ui/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';
import { useToast } from '../../context/ToastContext';
import { analyticsApi } from '../../services/analyticsApi';
import { LeaderboardsData, CampusAnalyticsData } from '../../types/analytics';

export const LeaderboardsAnalyticsPage: React.FC = () => {
  const toast = useToast();

  const [leaderboards, setLeaderboards] = useState<LeaderboardsData | null>(null);
  const [analytics, setAnalytics] = useState<CampusAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('athletes');

  const fetchAnalyticsData = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    setError(null);
    try {
      const [leadData, campData] = await Promise.all([
        analyticsApi.getLeaderboards(),
        analyticsApi.getPerformanceAnalytics(),
      ]);

      setLeaderboards(leadData);
      setAnalytics(campData);
    } catch (err: any) {
      console.error('Failed to load leaderboards:', err);
      setError(err.response?.data?.message || err.message || 'Could not load leaderboards.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchAnalyticsData(false);
    toast.info('Recalculating athlete leaderboards and telemetry...');
  };

  const tabsList = [
    { id: 'athletes', label: 'Athlete Leaderboards', icon: <Trophy className="w-3.5 h-3.5" /> },
    { id: 'teams', label: 'Franchise Rankings', icon: <Shield className="w-3.5 h-3.5" /> },
    { id: 'analytics', label: 'Campus Telemetry', icon: <Activity className="w-3.5 h-3.5" /> },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Leaderboards & Athletic Analytics" subtitle="Official student statistics, top scorers, and performance telemetry." />
        <Skeleton variant="card" height={140} />
        <Skeleton variant="card" height={380} />
      </div>
    );
  }

  if (error || !leaderboards) {
    return (
      <div className="space-y-6">
        <PageHeader title="Leaderboards & Athletic Analytics" subtitle="Official student statistics, top scorers, and performance telemetry." />
        <ErrorState
          title="Telemetry Error"
          message={error || 'Could not connect to analytics database.'}
          onRetry={() => fetchAnalyticsData(true)}
        />
      </div>
    );
  }

  const { topScorers, mvpPodium, topAssists, teamLeaderboard } = leaderboards;

  return (
    <div className="space-y-8">
      {/* 1. Header Banner */}
      <PageHeader
        title="Leaderboards & Athletic Analytics"
        subtitle="Individual student honors, top goalscorers, franchise rankings, and campus analytics."
        badge={
          <Badge variant="purple" size="sm">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse mr-1" />
            Live DB Telemetry
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
            Re-Calculate
          </Button>
        }
      />

      {/* 2. Navigation Tabs */}
      <Tabs activeTab={activeTab} onChange={setActiveTab} tabs={tabsList} variant="pills" />

      {/* 3. Tab Panels */}
      <div>
        {/* TAB 1: ATHLETE LEADERBOARDS */}
        {activeTab === 'athletes' && (
          <div className="space-y-8">
            {/* MVP Podium Cards */}
            <div className="space-y-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" /> Tournament MVP Podium
              </h3>

              {mvpPodium.length === 0 ? (
                <Card variant="glass" className="p-6 text-center text-xs text-slate-500 italic">
                  No MVP records logged yet.
                </Card>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {mvpPodium.slice(0, 3).map((mvp, idx) => (
                    <Card
                      key={mvp.id}
                      variant={idx === 0 ? 'glow' : 'glass'}
                      className="p-5 text-center space-y-3 relative overflow-hidden"
                    >
                      <span
                        className={`w-7 h-7 rounded-full inline-flex items-center justify-center text-xs font-black font-mono mx-auto ${
                          idx === 0
                            ? 'bg-amber-500 text-slate-950 ring-4 ring-amber-500/20'
                            : idx === 1
                            ? 'bg-slate-300 text-slate-950'
                            : 'bg-amber-700 text-white'
                        }`}
                      >
                        #{idx + 1}
                      </span>

                      <div>
                        <h4 className="text-base font-bold text-white">{mvp.name}</h4>
                        <p className="text-xs text-slate-400 font-mono">
                          {mvp.teamName} ({mvp.department})
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-800 text-xs text-slate-300">
                        <span className="text-lg font-black text-amber-400 font-mono">
                          {mvp.mvpAwards} MVP Awards
                        </span>
                        <p className="text-[10px] text-slate-500 mt-0.5 font-mono">{mvp.sportName}</p>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Top Scorers Table */}
            <Card variant="glass" className="p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-emerald-400" /> Golden Boot / Top Scorers
                </h3>
                <Badge variant="success">All Sanctioned Sports</Badge>
              </div>

              {topScorers.length === 0 ? (
                <EmptyState
                  title="No Athlete Statistics Recorded"
                  description="Scores and player telemetry are logged automatically during live matches."
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                        <th className="pb-3 w-12 text-center">Rank</th>
                        <th className="pb-3">Athlete</th>
                        <th className="pb-3">Department & Team</th>
                        <th className="pb-3">Sport</th>
                        <th className="pb-3 text-center">Matches</th>
                        <th className="pb-3 text-center font-bold text-emerald-400">Total Score</th>
                        <th className="pb-3 text-right">Avg / Match</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-medium">
                      {topScorers.map((s, idx) => (
                        <tr key={s.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-3 text-center font-mono font-bold text-slate-400">
                            #{idx + 1}
                          </td>
                          <td className="py-3 font-bold text-white flex items-center gap-2.5">
                            <Avatar name={s.name} size="xs" />
                            <span>{s.name}</span>
                          </td>
                          <td className="py-3 text-slate-300">
                            {s.teamName} <span className="text-[10px] text-slate-500 font-mono">({s.department})</span>
                          </td>
                          <td className="py-3 text-slate-400">{s.sportName}</td>
                          <td className="py-3 text-center font-mono text-slate-300">{s.matchesPlayed}</td>
                          <td className="py-3 text-center font-mono text-sm font-black text-emerald-400">
                            {s.totalScore}
                          </td>
                          <td className="py-3 text-right font-mono text-slate-400">{s.scoringAverage}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>

            {/* Top Playmakers (Assists) */}
            {topAssists.length > 0 && (
              <Card variant="default" className="p-6 space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
                  <Zap className="w-4 h-4 text-cyan-400" /> Top Assist Playmakers
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                  {topAssists.map((a, idx) => (
                    <div
                      key={a.id}
                      className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-xs font-bold text-white">
                          #{idx + 1} {a.name}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {a.teamName} ({a.department})
                        </p>
                      </div>
                      <span className="text-xs font-mono font-bold text-cyan-400 px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800">
                        {a.assists} Assists
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}

        {/* TAB 2: TEAM LEADERBOARD */}
        {activeTab === 'teams' && (
          <Card variant="glass" className="p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Shield className="w-4 h-4 text-cyan-400" /> Varsity Franchise Leaderboard
                </h3>
                <p className="text-xs text-slate-400">Ranked across all college tournaments</p>
              </div>
            </div>

            {teamLeaderboard.length === 0 ? (
              <EmptyState title="No Team Standings" description="Points tables will appear as matches conclude." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                      <th className="pb-3 w-12 text-center">Rank</th>
                      <th className="pb-3">Team Franchise</th>
                      <th className="pb-3">Sport</th>
                      <th className="pb-3 text-center">P</th>
                      <th className="pb-3 text-center">W</th>
                      <th className="pb-3 text-center">L</th>
                      <th className="pb-3 text-center">Win Rate</th>
                      <th className="pb-3 text-right font-bold text-sportex-400">Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium">
                    {teamLeaderboard.map((team, idx) => (
                      <tr key={team.teamId} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 text-center font-mono font-bold text-slate-400">#{idx + 1}</td>
                        <td className="py-3 font-bold text-white">
                          {team.teamName} <span className="text-[10px] text-slate-400 font-normal">({team.department})</span>
                        </td>
                        <td className="py-3 text-slate-300">{team.sportName}</td>
                        <td className="py-3 text-center font-mono">{team.played}</td>
                        <td className="py-3 text-center font-mono text-emerald-400 font-bold">{team.won}</td>
                        <td className="py-3 text-center font-mono text-rose-400">{team.lost}</td>
                        <td className="py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-16 h-1.5 rounded-full bg-slate-950 overflow-hidden">
                              <div
                                className="h-full bg-cyan-500 rounded-full"
                                style={{ width: `${team.winRate}%` }}
                              />
                            </div>
                            <span className="font-mono text-[10px] text-slate-300">{team.winRate}%</span>
                          </div>
                        </td>
                        <td className="py-3 text-right font-mono font-bold text-sportex-400 text-sm">
                          {team.totalPoints} pts
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}

        {/* TAB 3: CAMPUS TELEMETRY */}
        {activeTab === 'analytics' && analytics && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Department Breakdown */}
            <Card variant="glass" className="md:col-span-6 p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-sportex-400" /> Athlete Distribution by Dept
                </h3>
              </div>

              <div className="space-y-3">
                {analytics.departmentDistribution.map((d, i) => {
                  const maxCount = Math.max(...analytics.departmentDistribution.map((x) => x.athletesCount), 1);
                  const pct = Math.round((d.athletesCount / maxCount) * 100);
                  return (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-white">{d.department}</span>
                        <span className="font-mono text-sportex-400">{d.athletesCount} Athletes</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.6 }}
                          className="h-full bg-gradient-to-r from-sportex-600 to-cyan-400 rounded-full"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Sport Catalog Telemetry */}
            <Card variant="glass" className="md:col-span-6 p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" /> Sport Participation
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {analytics.sportParticipation.map((sp, i) => (
                  <div key={i} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                    <div>
                      <p className="text-xs font-bold text-white">{sp.sport}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-mono">{sp.category}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-cyan-400 font-mono">{sp.teamsCount} Teams</span>
                      <p className="text-[10px] text-slate-500">{sp.tournamentsCount} Cups</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
