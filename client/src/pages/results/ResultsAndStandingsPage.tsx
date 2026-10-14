import React, { useEffect, useState, useCallback } from 'react';
import {
  Trophy,
  CheckCircle2,
  RefreshCw,
  Eye,
  Shield,
  FileText,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Tabs } from '../../components/ui/Tabs';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { ErrorState } from '../../components/ui/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';
import { useToast } from '../../context/ToastContext';
import { resultsApi } from '../../services/resultsApi';
import { CompletedMatch, TournamentStandingsData } from '../../types/results';

export const ResultsAndStandingsPage: React.FC = () => {
  const toast = useToast();

  const [results, setResults] = useState<CompletedMatch[]>([]);
  const [standingsData, setStandingsData] = useState<TournamentStandingsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('results');

  // Selected Match Scorecard Modal
  const [selectedMatch, setSelectedMatch] = useState<CompletedMatch | null>(null);

  // Head-to-Head Comparison State
  const [teamAId, setTeamAId] = useState<string>('');
  const [teamBId, setTeamBId] = useState<string>('');

  const fetchResultsAndStandings = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    setError(null);
    try {
      const [resData, standData] = await Promise.all([
        resultsApi.getCompletedResults(),
        resultsApi.getTournamentStandings(),
      ]);

      setResults(resData);
      setStandingsData(standData);

      if (standData.standings.length >= 2) {
        if (!teamAId) setTeamAId(standData.standings[0].teamId);
        if (!teamBId) setTeamBId(standData.standings[1].teamId);
      }
    } catch (err: any) {
      console.error('Failed to load results and standings:', err);
      setError(err.response?.data?.message || err.message || 'Could not load match results.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [teamAId, teamBId]);

  useEffect(() => {
    fetchResultsAndStandings();
  }, [fetchResultsAndStandings]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchResultsAndStandings(false);
    toast.info('Synchronizing standings and match results...');
  };

  const tabsList = [
    { id: 'results', label: 'Match Results', badge: results.length, icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
    { id: 'standings', label: 'Points Table & Standings', icon: <Trophy className="w-3.5 h-3.5" /> },
    { id: 'comparison', label: 'Head-to-Head Matrix', icon: <Shield className="w-3.5 h-3.5" /> },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Match Results & Points Tables" subtitle="Official tournament scorecards, league tables, and standings." />
        <Skeleton variant="card" height={100} />
        <Skeleton variant="card" height={380} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Match Results & Points Tables" subtitle="Official tournament scorecards, league tables, and standings." />
        <ErrorState
          title="Results Connection Error"
          message={error}
          onRetry={() => fetchResultsAndStandings(true)}
        />
      </div>
    );
  }

  const standings = standingsData?.standings || [];
  const teamA = standings.find((s) => s.teamId === teamAId);
  const teamB = standings.find((s) => s.teamId === teamBId);

  return (
    <div className="space-y-8">
      {/* 1. Header Banner */}
      <PageHeader
        title="Match Results & Points Tables"
        subtitle="Automated tournament standings, goal differences, and official match scorecards."
        badge={
          <Badge variant="success" size="sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1" />
            PostgreSQL Auto-Calculated
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
            Sync Standings
          </Button>
        }
      />

      {/* 2. Navigation Tabs */}
      <Tabs activeTab={activeTab} onChange={setActiveTab} tabs={tabsList} variant="pills" />

      {/* 3. Tab Panels */}
      <div>
        {/* TAB 1: MATCH RESULTS */}
        {activeTab === 'results' && (
          <div className="space-y-4">
            {results.length === 0 ? (
              <Card variant="glass" className="p-8 text-center">
                <EmptyState
                  title="No Completed Matches Yet"
                  description="Completed matches and verified scorecards will appear here automatically."
                />
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.map((match) => (
                  <Card
                    key={match.id}
                    variant="glass"
                    className="p-5 space-y-3 cursor-pointer hover:border-sportex-500/40 transition-colors"
                    onClick={() => setSelectedMatch(match)}
                  >
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <div>
                        <span className="font-bold text-sportex-400 uppercase font-mono">
                          {match.tournament.sport.name}
                        </span>
                        <span className="text-slate-500 ml-1.5">({match.tournament.name})</span>
                      </div>
                      <span className="font-mono text-purple-400 text-[10px]">{match.roundName}</span>
                    </div>

                    {/* Scoreboard Strip */}
                    <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-sm font-bold">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: match.homeTeam.jerseyColor || '#0284c7' }}
                        />
                        <span className="text-white">{match.homeTeam.name}</span>
                      </div>

                      <div className="px-3 py-1 rounded-xl bg-slate-900 font-mono text-base font-black text-sportex-400 border border-slate-800">
                        {match.homeScore} - {match.awayScore}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-white">{match.awayTeam.name}</span>
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: match.awayTeam.jerseyColor || '#ef4444' }}
                        />
                      </div>
                    </div>

                    {/* Winner / Outcome Tag */}
                    <div className="flex items-center justify-between text-xs pt-1">
                      <div>
                        {match.isDraw ? (
                          <Badge variant="warning" size="sm">
                            Match Drawn
                          </Badge>
                        ) : match.winnerTeam ? (
                          <Badge variant="success" size="sm">
                            Winner: {match.winnerTeam.name}
                          </Badge>
                        ) : null}
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-slate-400 hover:text-white"
                        leftIcon={<Eye className="w-3.5 h-3.5" />}
                      >
                        Scorecard
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: POINTS TABLE & STANDINGS */}
        {activeTab === 'standings' && (
          <Card variant="glass" className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  {standingsData?.tournament?.name || 'Varsity League Standings'}
                </h3>
                <p className="text-xs text-slate-400">
                  {standingsData?.tournament?.sportName} • Academic Session {standingsData?.tournament?.academicYear}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="purple">Win: 3 pts | Draw: 1 pt</Badge>
              </div>
            </div>

            {standings.length === 0 ? (
              <EmptyState
                title="No Standings Generated"
                description="Standings are calculated automatically as match scorecards are submitted."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                      <th className="pb-3 text-center w-12">Pos</th>
                      <th className="pb-3">Franchise Squad</th>
                      <th className="pb-3 text-center">P</th>
                      <th className="pb-3 text-center">W</th>
                      <th className="pb-3 text-center">D</th>
                      <th className="pb-3 text-center">L</th>
                      <th className="pb-3 text-center">GF</th>
                      <th className="pb-3 text-center">GA</th>
                      <th className="pb-3 text-center">GD</th>
                      <th className="pb-3 text-center font-bold text-sportex-400">PTS</th>
                      <th className="pb-3 text-right">Form</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium">
                    {standings.map((team, idx) => (
                      <tr key={team.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3.5 text-center font-mono font-bold">
                          <span
                            className={`w-6 h-6 rounded-full inline-flex items-center justify-center text-[10px] ${
                              idx === 0
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-black'
                                : idx === 1
                                ? 'bg-slate-500/20 text-slate-300 border border-slate-500/40'
                                : idx === 2
                                ? 'bg-amber-700/20 text-amber-400 border border-amber-700/40'
                                : 'text-slate-500'
                            }`}
                          >
                            #{team.rank}
                          </span>
                        </td>

                        <td className="py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div
                              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                              style={{ backgroundColor: team.jerseyColor || '#0284c7' }}
                            />
                            <div>
                              <p className="font-bold text-white text-xs">{team.teamName}</p>
                              {team.department && (
                                <p className="text-[10px] text-slate-400 font-mono">
                                  Dept: {team.department}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 text-center font-mono">{team.played}</td>
                        <td className="py-3.5 text-center font-mono text-emerald-400 font-bold">{team.won}</td>
                        <td className="py-3.5 text-center font-mono text-amber-400">{team.drawn}</td>
                        <td className="py-3.5 text-center font-mono text-rose-400">{team.lost}</td>
                        <td className="py-3.5 text-center font-mono text-slate-300">{team.pointsFor}</td>
                        <td className="py-3.5 text-center font-mono text-slate-400">{team.pointsAgainst}</td>
                        <td
                          className={`py-3.5 text-center font-mono font-bold ${
                            team.goalDifference > 0
                              ? 'text-emerald-400'
                              : team.goalDifference < 0
                              ? 'text-rose-400'
                              : 'text-slate-400'
                          }`}
                        >
                          {team.goalDifference > 0 ? `+${team.goalDifference}` : team.goalDifference}
                        </td>

                        <td className="py-3.5 text-center font-mono text-sm font-black text-sportex-400">
                          {team.totalPoints}
                        </td>

                        <td className="py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {team.form.length === 0 ? (
                              <span className="text-[10px] text-slate-500">-</span>
                            ) : (
                              team.form.map((res, i) => (
                                <span
                                  key={i}
                                  className={`w-4 h-4 rounded text-[9px] font-black inline-flex items-center justify-center ${
                                    res === 'W'
                                      ? 'bg-emerald-600 text-white'
                                      : res === 'D'
                                      ? 'bg-amber-600 text-white'
                                      : 'bg-rose-600 text-white'
                                  }`}
                                >
                                  {res}
                                </span>
                              ))
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}

        {/* TAB 3: HEAD-TO-HEAD MATRIX */}
        {activeTab === 'comparison' && (
          <Card variant="glass" className="p-6 space-y-6">
            <div className="pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Franchise Head-to-Head Comparison</h3>
              <p className="text-xs text-slate-400">Compare statistics, win rates, and standings between squads</p>
            </div>

            {/* Team Selectors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Select Team A"
                value={teamAId}
                onChange={(e) => setTeamAId(e.target.value)}
                options={standings.map((s) => ({ value: s.teamId, label: s.teamName }))}
              />

              <Select
                label="Select Team B"
                value={teamBId}
                onChange={(e) => setTeamBId(e.target.value)}
                options={standings.map((s) => ({ value: s.teamId, label: s.teamName }))}
              />
            </div>

            {/* Comparison Matrix Cards */}
            {teamA && teamB ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                {/* Team A Card */}
                <Card variant="default" className="p-5 space-y-3 text-center">
                  <div
                    className="w-8 h-8 rounded-full mx-auto"
                    style={{ backgroundColor: teamA.jerseyColor || '#0284c7' }}
                  />
                  <h4 className="text-lg font-bold text-white">{teamA.teamName}</h4>
                  <p className="text-xs text-slate-400 font-mono">Rank #{teamA.rank} • {teamA.department}</p>
                  <div className="pt-2 border-t border-slate-800 text-2xl font-black text-sportex-400 font-mono">
                    {teamA.totalPoints} pts
                  </div>
                </Card>

                {/* Metrics Centerpiece */}
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-900">
                    <span className="font-bold text-white">{teamA.won}</span>
                    <span className="text-slate-400 uppercase font-semibold">Wins</span>
                    <span className="font-bold text-white">{teamB.won}</span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-slate-900">
                    <span className="font-bold text-white">{teamA.lost}</span>
                    <span className="text-slate-400 uppercase font-semibold">Losses</span>
                    <span className="font-bold text-white">{teamB.lost}</span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-slate-900">
                    <span className="font-bold text-white">{teamA.pointsFor}</span>
                    <span className="text-slate-400 uppercase font-semibold">Goals / Points For</span>
                    <span className="font-bold text-white">{teamB.pointsFor}</span>
                  </div>

                  <div className="flex justify-between py-1">
                    <span className="font-bold text-white">{teamA.goalDifference}</span>
                    <span className="text-slate-400 uppercase font-semibold">Goal Diff</span>
                    <span className="font-bold text-white">{teamB.goalDifference}</span>
                  </div>
                </div>

                {/* Team B Card */}
                <Card variant="default" className="p-5 space-y-3 text-center">
                  <div
                    className="w-8 h-8 rounded-full mx-auto"
                    style={{ backgroundColor: teamB.jerseyColor || '#ef4444' }}
                  />
                  <h4 className="text-lg font-bold text-white">{teamB.teamName}</h4>
                  <p className="text-xs text-slate-400 font-mono">Rank #{teamB.rank} • {teamB.department}</p>
                  <div className="pt-2 border-t border-slate-800 text-2xl font-black text-sportex-400 font-mono">
                    {teamB.totalPoints} pts
                  </div>
                </Card>
              </div>
            ) : null}
          </Card>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 4. DETAILED MATCH SCORECARD MODAL                                         */}
      {/* ========================================================================= */}
      <Modal
        isOpen={!!selectedMatch}
        onClose={() => setSelectedMatch(null)}
        title="Official Match Scorecard Summary"
        description={`${selectedMatch?.tournament.sport.name} • ${selectedMatch?.tournament.name}`}
        maxWidth="lg"
      >
        {selectedMatch && (
          <div className="space-y-6">
            {/* Scorecard Hero */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-4">
              <span className="text-xs font-mono font-bold text-sportex-400 uppercase">
                {selectedMatch.roundName}
              </span>

              <div className="grid grid-cols-3 items-center gap-4">
                <div className="text-left">
                  <h3 className="text-lg font-bold text-white">{selectedMatch.homeTeam.name}</h3>
                  <span className="text-xs text-slate-400 font-mono">{selectedMatch.homeTeam.department}</span>
                </div>

                <div>
                  <div className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
                    {selectedMatch.homeScore} : {selectedMatch.awayScore}
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono font-bold">FULL TIME</span>
                </div>

                <div className="text-right">
                  <h3 className="text-lg font-bold text-white">{selectedMatch.awayTeam.name}</h3>
                  <span className="text-xs text-slate-400 font-mono">{selectedMatch.awayTeam.department}</span>
                </div>
              </div>

              {selectedMatch.winnerTeam && (
                <Badge variant="success" size="sm">
                  Winner: {selectedMatch.winnerTeam.name}
                </Badge>
              )}
            </div>

            {/* Match Events Chronology */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase">Match Incidents & Goals</h4>
              {(!selectedMatch.events || selectedMatch.events.length === 0) ? (
                <p className="text-xs text-slate-500 italic py-2">No event records logged.</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {selectedMatch.events.map((ev) => (
                    <div
                      key={ev.id}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <Badge
                          variant={ev.eventType === 'GOAL' || ev.scoreValue > 0 ? 'success' : 'info'}
                          size="sm"
                        >
                          {ev.eventType}
                        </Badge>
                        <span className="text-white font-semibold">{ev.commentary || `${ev.eventType} recorded`}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">{ev.period || 'Match'}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Official Referee Disciplinary Notes */}
            {selectedMatch.notes && (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-purple-400" /> Referee Sign-Off Report
                </span>
                <p className="text-slate-300 italic">{selectedMatch.notes}</p>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <Button variant="ghost" onClick={() => setSelectedMatch(null)}>
                Close Scorecard
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
