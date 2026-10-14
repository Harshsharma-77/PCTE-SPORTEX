import React, { useEffect, useState, useCallback } from 'react';
import {
  Shield,
  Plus,
  RefreshCw,
  Search,
  UserPlus,
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
import { teamApi } from '../../services/teamApi';
import { sportApi } from '../../services/sportApi';
import { TeamItem } from '../../types/team';
import { SportItem } from '../../types/sport';

export const TeamsAdminPage: React.FC = () => {
  const toast = useToast();

  const [teams, setTeams] = useState<TeamItem[]>([]);
  const [sports, setSports] = useState<SportItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);
  const [addMemberModalOpen, setAddMemberModalOpen] = useState<boolean>(false);
  const [selectedTeam, setSelectedTeam] = useState<TeamItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Forms
  const [form, setForm] = useState({
    name: '',
    sportId: '',
    department: 'CSE',
    jerseyColor: '#0284c7',
  });

  const [memberForm, setMemberForm] = useState({
    studentId: '',
    jerseyNumber: 10,
    position: 'Forward',
    isCaptain: false,
  });

  const fetchTeamsAndSports = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    setError(null);
    try {
      const [teamsData, sportsData] = await Promise.all([
        teamApi.getAllTeams(),
        sportApi.getAllSports(),
      ]);
      setTeams(teamsData);
      setSports(sportsData);
      if (sportsData.length > 0 && !form.sportId) {
        setForm((prev) => ({ ...prev, sportId: sportsData[0].id }));
      }
    } catch (err: any) {
      console.error('Failed to load teams:', err);
      setError(err.response?.data?.message || err.message || 'Could not load team franchises.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [form.sportId]);

  useEffect(() => {
    fetchTeamsAndSports();
  }, [fetchTeamsAndSports]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchTeamsAndSports(false);
    toast.info('Refreshing teams directory...');
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await teamApi.createTeam(form);
      toast.success(`Team franchise "${form.name}" created.`);
      setCreateModalOpen(false);
      fetchTeamsAndSports(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create team');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeam) return;
    setIsSubmitting(true);
    try {
      await teamApi.addMember(selectedTeam.id, {
        studentId: memberForm.studentId,
        jerseyNumber: Number(memberForm.jerseyNumber),
        position: memberForm.position,
        isCaptain: memberForm.isCaptain,
      });
      toast.success('Player added to squad roster.');
      setAddMemberModalOpen(false);
      fetchTeamsAndSports(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add player');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredTeams = teams.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.sport?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Team Franchises & Squads" subtitle="Manage departmental squads, jersey colors, coaches, and rosters." />
        <Skeleton variant="card" height={120} />
        <Skeleton variant="card" height={360} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Team Franchises & Squads" subtitle="Manage departmental squads, jersey colors, coaches, and rosters." />
        <ErrorState title="Teams Error" message={error} onRetry={() => fetchTeamsAndSports(true)} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 1. Header Banner */}
      <PageHeader
        title="Team Franchises & Squad Rosters"
        subtitle="Manage varsity teams, departmental franchises, player assignments, captaincies, and coaches."
        badge={
          <Badge variant="info" size="sm">
            <Shield className="w-3.5 h-3.5 mr-1" />
            Franchise Directory
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
              Create Team
            </Button>
          </div>
        }
      />

      {/* 2. Teams Table */}
      <Card variant="glass" className="p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Search team by name or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>
        </div>

        {filteredTeams.length === 0 ? (
          <EmptyState
            title="No Team Franchises"
            description="Create your first departmental sports team."
            actionLabel="Create Team"
            onAction={() => setCreateModalOpen(true)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {filteredTeams.map((team) => (
              <div
                key={team.id}
                className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-base font-bold text-white flex items-center gap-2">
                        <span
                          className="w-3.5 h-3.5 rounded-full inline-block border border-white/20"
                          style={{ backgroundColor: team.jerseyColor || '#0284c7' }}
                        />
                        {team.name}
                      </h4>
                      <p className="text-[11px] font-mono text-slate-400">
                        {team.sport?.name} • Dept: {team.department || 'Varsity'}
                      </p>
                    </div>
                    <Badge variant="purple" size="sm">
                      {team.department || 'VARSITY'}
                    </Badge>
                  </div>

                  <div className="pt-2 grid grid-cols-2 gap-2 text-xs font-mono text-slate-300">
                    <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
                      <span className="text-[10px] text-slate-500 block">Head Coach</span>
                      <span className="font-bold text-white truncate block">
                        {team.coach?.user?.name || 'Unassigned'}
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
                      <span className="text-[10px] text-slate-500 block">Active Squad</span>
                      <span className="font-bold text-emerald-400">
                        {team._count?.members || 0} Players
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="font-mono text-slate-500 text-[11px]">
                    {team._count?.homeMatches || 0} Fixtures
                  </span>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedTeam(team);
                      setAddMemberModalOpen(true);
                    }}
                    leftIcon={<UserPlus className="w-3.5 h-3.5" />}
                  >
                    Add Player
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* 3. CREATE TEAM MODAL */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create Team Franchise"
        description="Register a new sports squad for departmental tournaments."
        maxWidth="md"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <Input
            label="Team Franchise Name"
            placeholder="e.g. CSE Cyber Strikers, MECH Warriors"
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
              label="Department"
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
              options={[
                { value: 'CSE', label: 'Computer Science & Eng' },
                { value: 'IT', label: 'Information Technology' },
                { value: 'ECE', label: 'Electronics & Comm' },
                { value: 'MECH', label: 'Mechanical Eng' },
                { value: 'CIVIL', label: 'Civil Eng' },
                { value: 'MANAGEMENT', label: 'Management / MBA' },
                { value: 'PHARMACY', label: 'Pharmacy' },
              ]}
            />
          </div>

          <Input
            label="Jersey Primary Hex Color"
            placeholder="#0284c7"
            value={form.jerseyColor}
            onChange={(e) => setForm({ ...form, jerseyColor: e.target.value })}
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <Button type="button" variant="ghost" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Create Team
            </Button>
          </div>
        </form>
      </Modal>

      {/* 4. ADD SQUAD MEMBER MODAL */}
      <Modal
        isOpen={addMemberModalOpen}
        onClose={() => setAddMemberModalOpen(false)}
        title={`Add Player to ${selectedTeam?.name || 'Squad'}`}
        description="Assign a student athlete to this team roster."
        maxWidth="md"
      >
        <form onSubmit={handleAddMemberSubmit} className="space-y-4">
          <Input
            label="Student Athlete ID"
            placeholder="Enter Student UUID"
            required
            value={memberForm.studentId}
            onChange={(e) => setMemberForm({ ...memberForm, studentId: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Jersey Number"
              type="number"
              min={1}
              max={99}
              required
              value={memberForm.jerseyNumber}
              onChange={(e) => setMemberForm({ ...memberForm, jerseyNumber: Number(e.target.value) })}
            />

            <Input
              label="Position / Role"
              placeholder="e.g. Forward, Goalkeeper, Batsman"
              required
              value={memberForm.position}
              onChange={(e) => setMemberForm({ ...memberForm, position: e.target.value })}
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isCaptain"
              checked={memberForm.isCaptain}
              onChange={(e) => setMemberForm({ ...memberForm, isCaptain: e.target.checked })}
              className="rounded bg-slate-900 border-slate-800 text-sportex-500 focus:ring-0"
            />
            <label htmlFor="isCaptain" className="text-xs font-semibold text-slate-300">
              Appoint as Team Captain
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <Button type="button" variant="ghost" onClick={() => setAddMemberModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Add Player to Roster
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
