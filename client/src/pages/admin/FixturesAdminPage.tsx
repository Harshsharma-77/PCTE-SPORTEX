import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Plus,
  RefreshCw,
  Search,
  Zap,
  Trash2,
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
import { fixtureApi } from '../../services/fixtureApi';
import { tournamentApi } from '../../services/tournamentApi';
import { teamApi } from '../../services/teamApi';
import { venueApi } from '../../services/venueApi';
import { FixtureItem } from '../../types/fixture';
import { TournamentItem } from '../../types/tournament';
import { TeamItem } from '../../types/team';
import { VenueItem } from '../../types/venue';

export const FixturesAdminPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [fixtures, setFixtures] = useState<FixtureItem[]>([]);
  const [tournaments, setTournaments] = useState<TournamentItem[]>([]);
  const [teams, setTeams] = useState<TeamItem[]>([]);
  const [venues, setVenues] = useState<VenueItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form
  const [form, setForm] = useState({
    tournamentId: '',
    homeTeamId: '',
    awayTeamId: '',
    roundName: 'Quarter Final',
    scheduledDate: new Date().toISOString().slice(0, 16),
    venueId: '',
  });

  const fetchData = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    setError(null);
    try {
      const [fixs, tourns, teamsData, venuesData] = await Promise.all([
        fixtureApi.getAllFixtures(),
        tournamentApi.getAllTournaments(),
        teamApi.getAllTeams(),
        venueApi.getAllVenues(),
      ]);
      setFixtures(fixs);
      setTournaments(tourns);
      setTeams(teamsData);
      setVenues(venuesData);
      if (tourns.length > 0 && !form.tournamentId) {
        setForm((prev) => ({ ...prev, tournamentId: tourns[0].id }));
      }
      if (teamsData.length >= 2 && !form.homeTeamId) {
        setForm((prev) => ({
          ...prev,
          homeTeamId: teamsData[0].id,
          awayTeamId: teamsData[1].id,
        }));
      }
      if (venuesData.length > 0 && !form.venueId) {
        setForm((prev) => ({ ...prev, venueId: venuesData[0].id }));
      }
    } catch (err: any) {
      console.error('Failed to load fixtures:', err);
      setError(err.response?.data?.message || err.message || 'Could not load match fixtures.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [form.tournamentId, form.homeTeamId, form.venueId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchData(false);
    toast.info('Refreshing match schedule...');
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.homeTeamId === form.awayTeamId) {
      toast.error('Home and away teams must be different!');
      return;
    }
    setIsSubmitting(true);
    try {
      await fixtureApi.createFixture(form);
      toast.success('Match fixture scheduled successfully!');
      setCreateModalOpen(false);
      fetchData(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to schedule match');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this match fixture?')) return;
    try {
      await fixtureApi.deleteFixture(id);
      toast.success('Match fixture deleted.');
      fetchData(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete fixture');
    }
  };

  const filteredFixtures = fixtures.filter(
    (f) =>
      f.homeTeam?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.awayTeam?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.tournament?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.roundName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Match Fixtures & Scheduling" subtitle="Assign venues, dates, referees, and launch real-time scoring." />
        <Skeleton variant="card" height={120} />
        <Skeleton variant="card" height={360} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Match Fixtures & Scheduling" subtitle="Assign venues, dates, referees, and launch real-time scoring." />
        <ErrorState title="Fixtures Error" message={error} onRetry={() => fetchData(true)} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 1. Header Banner */}
      <PageHeader
        title="Match Fixtures & Scheduling Directorate"
        subtitle="Schedule varsity matches, enforce venue conflict checks, assign certified officials, and launch scoring consoles."
        badge={
          <Badge variant="info" size="sm">
            <Calendar className="w-3.5 h-3.5 mr-1" />
            Calendar Active
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
              Schedule Match
            </Button>
          </div>
        }
      />

      {/* 2. Fixtures Table */}
      <Card variant="glass" className="p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Search fixture by team or round..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>
        </div>

        {filteredFixtures.length === 0 ? (
          <EmptyState
            title="No Fixtures Scheduled"
            description="Schedule a match or generate fixtures from a tournament."
            actionLabel="Schedule Match"
            onAction={() => setCreateModalOpen(true)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="pb-3">Tournament & Round</th>
                  <th className="pb-3">Matchup</th>
                  <th className="pb-3">Kickoff Schedule</th>
                  <th className="pb-3">Venue & Court</th>
                  <th className="pb-3 text-center">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {filteredFixtures.map((fix) => (
                  <tr key={fix.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5">
                      <p className="font-bold text-white">{fix.tournament?.name || 'Tournament'}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{fix.roundName}</p>
                    </td>

                    <td className="py-3.5 font-bold text-white">
                      {fix.homeTeam?.name} <span className="text-slate-500 font-normal">vs</span> {fix.awayTeam?.name}
                    </td>

                    <td className="py-3.5 text-slate-300 font-mono text-[11px]">
                      {new Date(fix.scheduledDate).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>

                    <td className="py-3.5 text-slate-400">
                      {fix.venue?.name || 'Unassigned Venue'}
                    </td>

                    <td className="py-3.5 text-center">
                      <Badge
                        variant={
                          fix.status === 'LIVE'
                            ? 'danger'
                            : fix.status === 'COMPLETED'
                            ? 'success'
                            : 'info'
                        }
                        size="sm"
                      >
                        {fix.status}
                      </Badge>
                    </td>

                    <td className="py-3.5 text-right space-x-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => navigate(`/live/${fix.id}`)}
                        leftIcon={<Zap className="w-3 h-3" />}
                      >
                        Live Console
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(fix.id)}
                        leftIcon={<Trash2 className="w-3 h-3 text-rose-400" />}
                      >
                        Del
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* 3. SCHEDULE FIXTURE MODAL */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Schedule Match Fixture"
        description="Assign participating teams, round, kickoff time, and ground venue."
        maxWidth="md"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <Select
            label="Championship Tournament"
            value={form.tournamentId}
            onChange={(e) => setForm({ ...form, tournamentId: e.target.value })}
            options={tournaments.map((t) => ({ value: t.id, label: t.name }))}
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Home Team"
              value={form.homeTeamId}
              onChange={(e) => setForm({ ...form, homeTeamId: e.target.value })}
              options={teams.map((t) => ({ value: t.id, label: t.name }))}
            />

            <Select
              label="Away Team"
              value={form.awayTeamId}
              onChange={(e) => setForm({ ...form, awayTeamId: e.target.value })}
              options={teams.map((t) => ({ value: t.id, label: t.name }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Round Name"
              placeholder="e.g. Quarter Final 1, Semi Final"
              required
              value={form.roundName}
              onChange={(e) => setForm({ ...form, roundName: e.target.value })}
            />

            <Input
              label="Scheduled Date & Kickoff"
              type="datetime-local"
              required
              value={form.scheduledDate}
              onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })}
            />
          </div>

          <Select
            label="Assigned Campus Venue"
            value={form.venueId}
            onChange={(e) => setForm({ ...form, venueId: e.target.value })}
            options={venues.map((v) => ({ value: v.id, label: `${v.name} (${v.location})` }))}
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <Button type="button" variant="ghost" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Schedule Match
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
