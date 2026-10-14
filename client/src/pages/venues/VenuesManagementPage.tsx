import React, { useEffect, useState, useCallback } from 'react';
import {
  MapPin,
  Plus,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Users,
  Shield,
  Calendar,
  Layers,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { ErrorState } from '../../components/ui/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { venueApi } from '../../services/venueApi';
import { VenueItem, VenueConflictResult } from '../../types/venue';

export const VenuesManagementPage: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [venues, setVenues] = useState<VenueItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [addModalOpen, setAddModalOpen] = useState<boolean>(false);
  const [conflictModalOpen, setConflictModalOpen] = useState<boolean>(false);
  const [selectedVenue, setSelectedVenue] = useState<VenueItem | null>(null);

  // Add Venue Form
  const [addForm, setAddForm] = useState({
    name: '',
    location: '',
    capacity: 250,
    supportedSports: 'Football, Cricket, Athletics',
    isIndoor: false,
    notes: '',
  });

  // Conflict Check Form
  const [conflictDate, setConflictDate] = useState<string>(
    new Date().toISOString().slice(0, 16)
  );
  const [conflictDuration, setConflictDuration] = useState<number>(120);
  const [conflictResult, setConflictResult] = useState<VenueConflictResult | null>(null);
  const [isCheckingConflict, setIsCheckingConflict] = useState<boolean>(false);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'SPORTS_ADMIN';

  const fetchVenues = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    setError(null);
    try {
      const data = await venueApi.getAllVenues();
      setVenues(data);
    } catch (err: any) {
      console.error('Failed to load venues:', err);
      setError(err.response?.data?.message || err.message || 'Could not load campus venues.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchVenues();
  }, [fetchVenues]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchVenues(false);
    toast.info('Refreshing campus venue availability...');
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await venueApi.createVenue({
        name: addForm.name,
        location: addForm.location,
        capacity: Number(addForm.capacity),
        supportedSports: addForm.supportedSports.split(',').map((s) => s.trim()),
        isIndoor: addForm.isIndoor,
        notes: addForm.notes,
      });
      toast.success(`Venue ${addForm.name} registered successfully.`);
      setAddModalOpen(false);
      fetchVenues(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add venue');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRunConflictCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVenue) return;
    setIsCheckingConflict(true);
    try {
      const result = await venueApi.checkConflict(
        selectedVenue.id,
        conflictDate,
        conflictDuration
      );
      setConflictResult(result);
    } catch (err: any) {
      toast.error('Failed to check conflict');
    } finally {
      setIsCheckingConflict(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Campus Venues & Facilities" subtitle="Stadiums, floodlit arenas, and conflict detection calendar." />
        <Skeleton variant="card" height={120} />
        <Skeleton variant="card" height={360} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Campus Venues & Facilities" subtitle="Stadiums, floodlit arenas, and conflict detection calendar." />
        <ErrorState title="Venues Error" message={error} onRetry={() => fetchVenues(true)} />
      </div>
    );
  }

  const indoorCount = venues.filter((v) => v.isIndoor).length;
  const outdoorCount = venues.filter((v) => !v.isIndoor).length;

  return (
    <div className="space-y-8">
      {/* 1. Header Banner */}
      <PageHeader
        title="Campus Venues & Arenas"
        subtitle="Manage stadium grounds, spectator capacities, multi-sport courts, and schedule conflict detection."
        badge={
          <Badge variant="info" size="sm">
            <MapPin className="w-3.5 h-3.5 mr-1" />
            Grounds Catalog Active
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

            {isAdmin && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setAddModalOpen(true)}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                Add Venue
              </Button>
            )}
          </div>
        }
      />

      {/* 2. Metric Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card variant="glass" className="p-4 flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-sportex-500/10 border border-sportex-500/30 text-sportex-400">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Total Sanctioned Arenas</p>
            <h3 className="text-2xl font-black text-white font-mono">{venues.length}</h3>
          </div>
        </Card>

        <Card variant="glass" className="p-4 flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Indoor Complex Courts</p>
            <h3 className="text-2xl font-black text-cyan-400 font-mono">{indoorCount}</h3>
          </div>
        </Card>

        <Card variant="glass" className="p-4 flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Outdoor Stadiums</p>
            <h3 className="text-2xl font-black text-emerald-400 font-mono">{outdoorCount}</h3>
          </div>
        </Card>
      </div>

      {/* 3. Venues Grid */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-sportex-400" /> Campus Grounds Directory
        </h3>

        {venues.length === 0 ? (
          <EmptyState
            title="No Venues Configured"
            description="Register university sports grounds, courts, and stadiums."
            actionLabel="Add Venue"
            onAction={() => setAddModalOpen(true)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {venues.map((venue) => (
              <Card key={venue.id} variant="glass" className="p-6 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-base font-bold text-white">{venue.name}</h4>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" /> {venue.location}
                      </p>
                    </div>
                    <Badge variant={venue.isIndoor ? 'purple' : 'success'} size="sm">
                      {venue.isIndoor ? 'INDOOR' : 'OUTDOOR'}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-300 font-mono">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>Capacity: {venue.capacity || 200} Spectators</span>
                  </div>

                  {venue.supportedSports && venue.supportedSports.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {venue.supportedSports.map((sport, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md bg-slate-950 text-slate-400 border border-slate-800 text-[10px] font-mono"
                        >
                          {sport}
                        </span>
                      ))}
                    </div>
                  )}

                  {venue.notes && (
                    <p className="text-xs text-slate-400 italic pt-1 line-clamp-2">"{venue.notes}"</p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-mono text-emerald-400 font-bold">
                    {venue.activeMatchesCount || 0} Matches Slotted
                  </span>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedVenue(venue);
                      setConflictResult(null);
                      setConflictModalOpen(true);
                    }}
                    leftIcon={<Calendar className="w-3.5 h-3.5" />}
                  >
                    Check Conflict
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 4. CONFLICT CHECK MODAL                                                   */}
      {/* ========================================================================= */}
      <Modal
        isOpen={conflictModalOpen}
        onClose={() => setConflictModalOpen(false)}
        title={`Check Schedule Conflicts — ${selectedVenue?.name}`}
        description="Verifies venue availability against existing match calendars."
        maxWidth="md"
      >
        <form onSubmit={handleRunConflictCheck} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Requested Kickoff Time"
              type="datetime-local"
              required
              value={conflictDate}
              onChange={(e) => setConflictDate(e.target.value)}
            />

            <Input
              label="Match Slot Duration (mins)"
              type="number"
              min={30}
              max={300}
              required
              value={conflictDuration}
              onChange={(e) => setConflictDuration(Number(e.target.value))}
            />
          </div>

          <Button type="submit" variant="primary" size="sm" className="w-full" isLoading={isCheckingConflict}>
            Verify Ground Availability
          </Button>

          {/* Outcome Result Card */}
          {conflictResult && (
            <div className="pt-2">
              {!conflictResult.hasConflict ? (
                <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 flex items-center gap-3 text-xs text-emerald-300">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <div>
                    <p className="font-bold">Venue Fully Available!</p>
                    <p className="text-[11px] text-slate-300">No conflicting matches scheduled in this time window.</p>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-rose-400 font-bold">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Conflict Detected! ({conflictResult.conflictCount} Clashing Matches)</span>
                  </div>
                  <div className="space-y-1.5 pt-1">
                    {conflictResult.conflictingMatches.map((m) => (
                      <div key={m.id} className="p-2 rounded bg-slate-950 text-slate-300 text-[11px] font-mono">
                        <span className="font-bold text-white">{m.matchTitle}</span> ({m.roundName})
                        <span className="block text-slate-500 text-[9px]">{new Date(m.scheduledDate).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end pt-3 border-t border-slate-800">
            <Button type="button" variant="ghost" onClick={() => setConflictModalOpen(false)}>
              Close
            </Button>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* 5. ADD VENUE MODAL                                                        */}
      {/* ========================================================================= */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add Campus Arena / Venue"
        description="Register a new sports ground or court in the institutional directory."
        maxWidth="md"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <Input
            label="Venue / Ground Name"
            placeholder="e.g. PCTE Synthetic Turf Stadium"
            required
            value={addForm.name}
            onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Location"
              placeholder="e.g. Campus II Ground Floor"
              required
              value={addForm.location}
              onChange={(e) => setAddForm({ ...addForm, location: e.target.value })}
            />

            <Input
              label="Spectator Capacity"
              type="number"
              min={50}
              value={addForm.capacity}
              onChange={(e) => setAddForm({ ...addForm, capacity: Number(e.target.value) })}
            />
          </div>

          <Input
            label="Supported Sports (Comma separated)"
            placeholder="Football, Cricket, Badminton"
            value={addForm.supportedSports}
            onChange={(e) => setAddForm({ ...addForm, supportedSports: e.target.value })}
          />

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isIndoor"
              checked={addForm.isIndoor}
              onChange={(e) => setAddForm({ ...addForm, isIndoor: e.target.checked })}
              className="rounded bg-slate-900 border-slate-800 text-sportex-500 focus:ring-0"
            />
            <label htmlFor="isIndoor" className="text-xs font-semibold text-slate-300">
              Indoor Complex / Enclosed Arena
            </label>
          </div>

          <Input
            label="Facility Notes"
            placeholder="e.g. Floodlit ground with electronic scoreboard"
            value={addForm.notes}
            onChange={(e) => setAddForm({ ...addForm, notes: e.target.value })}
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <Button type="button" variant="ghost" onClick={() => setAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Register Venue
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
