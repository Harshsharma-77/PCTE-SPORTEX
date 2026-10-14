import React, { useEffect, useState, useCallback } from 'react';
import {
  Trophy,
  Plus,
  RefreshCw,
  Search,
  Users,
  CheckCircle2,
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
import { sportApi } from '../../services/sportApi';
import { SportItem } from '../../types/sport';

export const SportsAdminPage: React.FC = () => {
  const toast = useToast();

  const [sports, setSports] = useState<SportItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [form, setForm] = useState({
    name: '',
    category: 'TEAM',
    scoringType: 'POINTS',
    minPlayers: 5,
    maxPlayers: 11,
    benchSize: 5,
  });

  const fetchSports = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    setError(null);
    try {
      const data = await sportApi.getAllSports();
      setSports(data);
    } catch (err: any) {
      console.error('Failed to load sports:', err);
      setError(err.response?.data?.message || err.message || 'Could not load sports disciplines.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchSports();
  }, [fetchSports]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchSports(false);
    toast.info('Refreshing sports catalog...');
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await sportApi.createSport({
        name: form.name,
        category: form.category,
        scoringType: form.scoringType,
        minPlayers: Number(form.minPlayers),
        maxPlayers: Number(form.maxPlayers),
        benchSize: Number(form.benchSize),
      });
      toast.success(`Sport discipline "${form.name}" created.`);
      setCreateModalOpen(false);
      setForm({ name: '', category: 'TEAM', scoringType: 'POINTS', minPlayers: 5, maxPlayers: 11, benchSize: 5 });
      fetchSports(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create sport');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove "${name}" from the catalog?`)) return;
    try {
      await sportApi.deleteSport(id);
      toast.success(`Sport "${name}" deleted.`);
      fetchSports(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete sport');
    }
  };

  const filteredSports = sports.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Sports Disciplines Directorate" subtitle="Sanctioned varsity sports, scoring rules, and squad sizes." />
        <Skeleton variant="card" height={120} />
        <Skeleton variant="card" height={360} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Sports Disciplines Directorate" subtitle="Sanctioned varsity sports, scoring rules, and squad sizes." />
        <ErrorState title="Sports Catalog Error" message={error} onRetry={() => fetchSports(true)} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 1. Header Banner */}
      <PageHeader
        title="Sanctioned Sports Disciplines"
        subtitle="Configure university sports codes, scoring mechanisms, minimum roster constraints, and tournament categories."
        badge={
          <Badge variant="purple" size="sm">
            <Trophy className="w-3.5 h-3.5 mr-1" />
            Registry Active
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
              Add Sport
            </Button>
          </div>
        }
      />

      {/* 2. Metric Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card variant="glass" className="p-4 flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-sportex-500/10 border border-sportex-500/30 text-sportex-400">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Sanctioned Disciplines</p>
            <h3 className="text-2xl font-black text-white font-mono">{sports.length}</h3>
          </div>
        </Card>

        <Card variant="glass" className="p-4 flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Total Registered Teams</p>
            <h3 className="text-2xl font-black text-emerald-400 font-mono">
              {sports.reduce((acc, curr) => acc + (curr._count?.teams || 0), 0)}
            </h3>
          </div>
        </Card>

        <Card variant="glass" className="p-4 flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Active Tournaments</p>
            <h3 className="text-2xl font-black text-purple-400 font-mono">
              {sports.reduce((acc, curr) => acc + (curr._count?.tournaments || 0), 0)}
            </h3>
          </div>
        </Card>
      </div>

      {/* 3. Sports Grid */}
      <Card variant="glass" className="p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Search sports discipline..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>
        </div>

        {filteredSports.length === 0 ? (
          <EmptyState
            title="No Sports Configured"
            description="Create your first sanctioned sport discipline."
            actionLabel="Add Sport"
            onAction={() => setCreateModalOpen(true)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {filteredSports.map((sport) => (
              <div
                key={sport.id}
                className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-base font-bold text-white">{sport.name}</h4>
                      <p className="text-[11px] font-mono text-sportex-400">{sport.slug}</p>
                    </div>
                    <Badge variant={sport.category === 'TEAM' ? 'purple' : 'info'} size="sm">
                      {sport.category}
                    </Badge>
                  </div>

                  <div className="pt-2 grid grid-cols-2 gap-2 text-xs font-mono text-slate-300">
                    <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
                      <span className="text-[10px] text-slate-500 block">Scoring Mode</span>
                      <span className="font-bold text-white">{sport.scoringType}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
                      <span className="text-[10px] text-slate-500 block">Roster Size</span>
                      <span className="font-bold text-white">{sport.minPlayers} - {sport.maxPlayers}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="font-mono text-slate-400">
                    {sport._count?.teams || 0} Teams • {sport._count?.tournaments || 0} Cups
                  </span>

                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(sport.id, sport.name)}
                    leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* 4. CREATE SPORT MODAL */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Add Sanctioned Sport Discipline"
        description="Configure rules, squad limits, and scoring mechanics."
        maxWidth="md"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <Input
            label="Sport Discipline Name"
            placeholder="e.g. Football, Basketball, Cricket"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Sport Category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              options={[
                { value: 'TEAM', label: 'Team Sport' },
                { value: 'INDIVIDUAL', label: 'Individual Sport' },
                { value: 'DUAL', label: 'Dual / Doubles' },
                { value: 'ESPORTS', label: 'E-Sports' },
              ]}
            />

            <Select
              label="Scoring Engine"
              value={form.scoringType}
              onChange={(e) => setForm({ ...form, scoringType: e.target.value })}
              options={[
                { value: 'GOALS', label: 'Goals (Football, Hockey)' },
                { value: 'RUNS', label: 'Runs (Cricket)' },
                { value: 'POINTS', label: 'Points (Basketball, Kabaddi)' },
                { value: 'SETS', label: 'Sets (Badminton, Volleyball, Tennis)' },
              ]}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Min Players"
              type="number"
              min={1}
              required
              value={form.minPlayers}
              onChange={(e) => setForm({ ...form, minPlayers: Number(e.target.value) })}
            />

            <Input
              label="Max Players"
              type="number"
              min={1}
              required
              value={form.maxPlayers}
              onChange={(e) => setForm({ ...form, maxPlayers: Number(e.target.value) })}
            />

            <Input
              label="Bench Reserves"
              type="number"
              min={0}
              required
              value={form.benchSize}
              onChange={(e) => setForm({ ...form, benchSize: Number(e.target.value) })}
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <Button type="button" variant="ghost" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Create Sport
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
