import React, { useEffect, useState, useCallback } from 'react';
import {
  Trophy,
  Plus,
  RefreshCw,
  Search,
  Zap,
  Users,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { ErrorState } from '../../components/ui/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';
import { useToast } from '../../context/ToastContext';
import { tournamentApi } from '../../services/tournamentApi';
import { sportApi } from '../../services/sportApi';
import { teamApi } from '../../services/teamApi';
import { TournamentItem } from '../../types/tournament';
import { SportItem } from '../../types/sport';
import { TeamItem } from '../../types/team';

export const TournamentsAdminPage: React.FC = () => {
  const toast = useToast();

  const [tournaments, setTournaments] = useState<TournamentItem[]>([]);
  const [sports, setSports] = useState<SportItem[]>([]);
  const [teams, setTeams] = useState<TeamItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);
  const [registerModalOpen, setRegisterModalOpen] = useState<boolean>(false);
  const [selectedTournament, setSelectedTournament] = useState<TournamentItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Forms
  const [form, setForm] = useState({
    name: '',
    academicYear: '2025-2026',
    sportId: '',
    format: 'KNOCKOUT',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    maxTeams: 8,
    description: '',
  });

  const [registerForm, setRegisterForm] = useState({
    teamId: '',
    seed: 1,
    groupName: 'Group A',
  });

  const fetchData = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    setError(null);
    try {
      const [tourns, sportsData, teamsData] = await Promise.all([
        tournamentApi.getAllTournaments(),
        sportApi.getAllSports(),
        teamApi.getAllTeams(),
      ]);
      setTournaments(tourns);
      setSports(sportsData);
      setTeams(teamsData);
      if (sportsData.length > 0 && !form.sportId) {
        setForm((prev) => ({ ...prev, sportId: sportsData[0].id }));
      }
      if (teamsData.length > 0 && !registerForm.teamId) {
        setRegisterForm((prev) => ({ ...prev, teamId: teamsData[0].id }));
      }
    } catch (err: any) {
      console.error('Failed to load tournaments:', err);
      setError(err.response?.data?.message || err.message || 'Could not load tournaments.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [form.sportId, registerForm.teamId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchData(false);
    toast.info('Refreshing tournaments...');
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await tournamentApi.createTournament(form);
      toast.success(`Tournament "${form.name}" created.`);
      setCreateModalOpen(false);
      fetchData(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create tournament');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterTeamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTournament) return;
    setIsSubmitting(true);
    try {
      await tournamentApi.registerTeam(selectedTournament.id, {
        teamId: registerForm.teamId,
        seed: Number(registerForm.seed),
        groupName: registerForm.groupName,
      });
      toast.success('Team registered for tournament.');
      setRegisterModalOpen(false);
      fetchData(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to register team');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerateFixtures = async (tournamentId: string, name: string) => {
    if (!window.confirm(`Generate automated match pairings and fixture schedule for "${name}"?`)) return;
    try {
      const res = await tournamentApi.generateFixtures(tournamentId);
      toast.success(res.message || 'Tournament fixtures generated!');
      fetchData(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to generate fixtures');
    }
  };

  const filteredTournaments = tournaments.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.sport?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Tournaments & Championships" subtitle="Manage tournament cups, team seeds, and automated fixture schedules." />
        <Skeleton variant="card" height={120} />
        <Skeleton variant="card" height={360} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Tournaments & Championships" subtitle="Manage tournament cups, team seeds, and automated fixture schedules." />
        <ErrorState title="Tournaments Error" message={error} onRetry={() => fetchData(true)} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 1. Header Banner */}
      <PageHeader
        title="Tournaments & Championship Cups"
        subtitle="Manage academic sports tournaments, knockout brackets, round-robin leagues, and auto-pairing engines."
        badge={
          <Badge variant="purple" size="sm">
            <Trophy className="w-3.5 h-3.5 mr-1" />
            Tournament Directorate
          </Badge>
        }
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              isLoading={isRefreshing}
              leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />}
            >
              Sync
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={() => setCreateModalOpen(true)}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Create Tournament
            </Button>
          </div>
        }
      />

      {/* 2. Tournaments Table */}
      <Card variant="glass" className="p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Search tournament by name or sport..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>
        </div>

        {filteredTournaments.length === 0 ? (
          <EmptyState
            title="No Tournaments Configured"
            description="Create your first academic year championship tournament."
            actionLabel="Create Tournament"
            onAction={() => setCreateModalOpen(true)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {filteredTournaments.map((tourn) => (
              <div
                key={tourn.id}
                className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-base font-bold text-white">{tourn.name}</h4>
                      <p className="text-[11px] font-mono text-slate-400">
                        {tourn.sport?.name} • Session: {tourn.academicYear}
                      </p>
                    </div>
                    <Badge
                      variant={
                        tourn.status === 'ONGOING'
                          ? 'success'
                          : tourn.status === 'COMPLETED'
                          ? 'purple'
                          : 'info'
                      }
                      size="sm"
                    >
                      {tourn.status}
                    </Badge>
                  </div>

                  <div className="pt-2 grid grid-cols-2 gap-2 text-xs font-mono text-slate-300">
                    <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
                      <span className="text-[10px] text-slate-500 block">Format</span>
                      <span className="font-bold text-white truncate block">{tourn.format}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
                      <span className="text-[10px] text-slate-500 block">Registered Teams</span>
                      <span className="font-bold text-emerald-400">
                        {tourn._count?.registeredTeams || 0} / {tourn.maxTeams}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedTournament(tourn);
                      setRegisterModalOpen(true);
                    }}
                    leftIcon={<Users className="w-3.5 h-3.5" />}
                  >
                    Register Team
                  </Button>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleGenerateFixtures(tourn.id, tourn.name)}
                    leftIcon={<Zap className="w-3.5 h-3.5" />}
                  >
                    Pair Fixtures
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* 3. CREATE TOURNAMENT MODAL */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create Championship Tournament"
        description="Configure academic tournament, max teams, and dates."
        maxWidth="md"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <Input
            label="Tournament Name"
            placeholder="e.g. PCTE ATHLOS 2026 Inter-Department Cup"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Sport Discipline"
              value={form.sportId}
              onChange={(e) => setForm({ ...form, sportId: e.target.value })}
              options={sports.map((s) => ({ value: s.id, label: s.name }))}
            />

            <Select
              label="Tournament Format"
              value={form.format}
              onChange={(e) => setForm({ ...form, format: e.target.value })}
              options={[
                { value: 'KNOCKOUT', label: 'Single Elimination Knockout' },
                { value: 'ROUND_ROBIN', label: 'Round Robin League' },
                { value: 'LEAGUE_CUM_KNOCKOUT', label: 'League Cum Knockout' },
              ]}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              required
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            />

            <Input
              label="End Date"
              type="date"
              required
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            />
          </div>

          <Input
            label="Max Participating Teams"
            type="number"
            min={2}
            max={32}
            value={form.maxTeams}
            onChange={(e) => setForm({ ...form, maxTeams: Number(e.target.value) })}
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <Button type="button" variant="ghost" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Create Cup
            </Button>
          </div>
        </form>
      </Modal>

      {/* 4. REGISTER TEAM MODAL */}
      <Modal
        isOpen={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
        title={`Register Team for ${selectedTournament?.name}`}
        description="Select a team franchise and optional seed."
        maxWidth="md"
      >
        <form onSubmit={handleRegisterTeamSubmit} className="space-y-4">
          <Select
            label="Team Franchise"
            value={registerForm.teamId}
            onChange={(e) => setRegisterForm({ ...registerForm, teamId: e.target.value })}
            options={teams.map((t) => ({
              value: t.id,
              label: `${t.name} (${t.sport?.name} • ${t.department || 'Varsity'})`,
            }))}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Seed Number"
              type="number"
              min={1}
              max={16}
              value={registerForm.seed}
              onChange={(e) => setRegisterForm({ ...registerForm, seed: Number(e.target.value) })}
            />

            <Input
              label="Group Designation"
              placeholder="e.g. Group A"
              value={registerForm.groupName}
              onChange={(e) => setRegisterForm({ ...registerForm, groupName: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <Button type="button" variant="ghost" onClick={() => setRegisterModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Confirm Registration
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
