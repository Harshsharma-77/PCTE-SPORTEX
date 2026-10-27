import React, { useState } from 'react';
import {
  Sparkles,
  Trophy,
  Users,
  Shield,
  Activity,
  Mail,
  Edit,
  Eye,
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { Tabs } from '../components/ui/Tabs';
import { Table, Column } from '../components/ui/Table';
import { Tooltip } from '../components/ui/Tooltip';
import { Pagination } from '../components/ui/Pagination';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { Modal } from '../components/ui/Modal';
import { Drawer } from '../components/ui/Drawer';
import { ConfirmationDialog } from '../components/ui/ConfirmationDialog';
import { AnimatedCounter } from '../components/common/AnimatedCounter';
import { useToast } from '../context/ToastContext';

interface SampleAthlete {
  id: string;
  name: string;
  rollNumber: string;
  department: string;
  sport: string;
  status: 'ACTIVE' | 'INJURED' | 'SUSPENDED';
  matches: number;
}

export const ComponentsShowcasePage: React.FC = () => {
  const toast = useToast();

  // Component States
  const [activeTab, setActiveTab] = useState('overview');
  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [counterValue, setCounterValue] = useState(2450);

  // Table Data
  const sampleAthletes: SampleAthlete[] = [
    { id: '1', name: 'Harsh Sharma', rollNumber: '2329263', department: 'CSE', sport: 'Football', status: 'ACTIVE', matches: 14 },
    { id: '2', name: 'Rahul Singh', rollNumber: '2329264', department: 'IT', sport: 'Football', status: 'ACTIVE', matches: 12 },
    { id: '3', name: 'Khushi Sharma', rollNumber: '2329265', department: 'BBA', sport: 'Badminton', status: 'ACTIVE', matches: 18 },
    { id: '4', name: 'Aman Deep', rollNumber: '2329266', department: 'ME', sport: 'Cricket', status: 'INJURED', matches: 9 },
    { id: '5', name: 'Simran Kaur', rollNumber: '2329267', department: 'BPHARM', sport: 'Basketball', status: 'ACTIVE', matches: 15 },
  ];

  const columns: Column<SampleAthlete>[] = [
    {
      key: 'athlete',
      header: 'Athlete',
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-3">
          <Avatar name={item.name} size="sm" isOnline={item.status === 'ACTIVE'} />
          <div>
            <p className="font-bold text-white leading-tight">{item.name}</p>
            <p className="text-[10px] text-slate-400 font-mono">Roll: {item.rollNumber}</p>
          </div>
        </div>
      ),
    },
    { key: 'department', header: 'Department', sortable: true },
    { key: 'sport', header: 'Sport', sortable: true },
    {
      key: 'status',
      header: 'Eligibility',
      render: (item) => (
        <Badge variant={item.status === 'ACTIVE' ? 'success' : 'danger'} size="sm">
          {item.status}
        </Badge>
      ),
    },
    {
      key: 'matches',
      header: 'Matches',
      sortable: true,
      render: (item) => <span className="font-mono font-bold text-sportex-400">{item.matches}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: () => (
        <div className="flex items-center gap-1.5">
          <Tooltip content="View Profile">
            <button className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white">
              <Eye className="w-3.5 h-3.5" />
            </button>
          </Tooltip>
          <Tooltip content="Edit Details">
            <button className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white">
              <Edit className="w-3.5 h-3.5" />
            </button>
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-10">
      <PageHeader
        title="Design System & Reusable Components"
        subtitle="Comprehensive UI/UX design tokens, micro-interactions, and component catalog."
        badge={<Badge variant="info">Component Library</Badge>}
        actions={
          <Button
            variant="glow"
            size="sm"
            onClick={() => setCounterValue((prev) => prev + 500)}
            leftIcon={<Sparkles className="w-4 h-4" />}
          >
            Increment Counter
          </Button>
        }
      />

      {/* 1. Animated Counters & Metric Cards */}
      <section className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">1. Animated Counters & Glass Cards</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card variant="glass" className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400">Registered Athletes</span>
              <Users className="w-4 h-4 text-sportex-400" />
            </div>
            <div className="text-3xl font-black text-white font-display">
              <AnimatedCounter value={counterValue} />
            </div>
            <p className="text-[10px] text-emerald-400 mt-1 font-semibold">+12% from last academic year</p>
          </Card>

          <Card variant="glow" className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400">Active Tournaments</span>
              <Trophy className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-black text-white font-display">
              <AnimatedCounter value={8} />
            </div>
            <p className="text-[10px] text-cyan-400 mt-1 font-semibold">4 Ongoing • 4 Upcoming</p>
          </Card>

          <Card variant="default" className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400">Live Scored Matches</span>
              <Activity className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-3xl font-black text-white font-display">
              <AnimatedCounter value={142} />
            </div>
            <p className="text-[10px] text-slate-400 mt-1 font-semibold">WebSocket synchronized</p>
          </Card>

          <Card variant="interactive" className="p-5" onClick={() => toast.success('Card interaction triggered!')}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400">Interactive Card CTA</span>
              <Shield className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-sm font-bold text-white">Click To Test Ripple</p>
            <p className="text-[10px] text-sportex-400 mt-1">Triggers toast micro-interaction</p>
          </Card>
        </div>
      </section>

      {/* 2. Buttons & Micro-Interactions */}
      <section className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">2. Button Variants & Sizes</h3>
        <Card variant="default" className="p-6">
          <div className="flex flex-wrap gap-3 items-center">
            <Button variant="primary" size="md">Primary Button</Button>
            <Button variant="glow" size="md">Glow Variant</Button>
            <Button variant="secondary" size="md">Secondary</Button>
            <Button variant="outline" size="md">Outline</Button>
            <Button variant="danger" size="md">Danger Action</Button>
            <Button variant="ghost" size="md">Ghost Button</Button>
            <Button variant="primary" size="md" isLoading={true}>Loading State</Button>
          </div>
        </Card>
      </section>

      {/* 3. Toast Notifications */}
      <section className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">3. Stackable Toast Notifications</h3>
        <Card variant="default" className="p-6">
          <div className="flex flex-wrap gap-3 items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.success('Match score synchronized to all live viewers in 24ms.', 'Score Updated')}
            >
              Trigger Success Toast
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.error('Failed to submit score: Referee session expired.', 'Auth Error')}
            >
              Trigger Error Toast
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.warning('Venue slot conflict detected between Football and Cricket.', 'Schedule Warning')}
            >
              Trigger Warning Toast
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.info('New tournament registration opened for PCTE ATHLOS 2026.', 'Announcement')}
            >
              Trigger Info Toast
            </Button>
          </div>
        </Card>
      </section>

      {/* 4. Form Inputs & Selects */}
      <section className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">4. Form Inputs & Select Controls</h3>
        <Card variant="default" className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input label="Athlete Name" placeholder="Harsh Sharma" leftIcon={<Users className="w-4 h-4" />} />
            <Input label="College Email" type="email" placeholder="student@pcte.edu.in" leftIcon={<Mail className="w-4 h-4" />} />
            <Select
              label="Assigned Department"
              options={[
                { value: 'CSE', label: 'Computer Science & Engineering' },
                { value: 'IT', label: 'Information Technology' },
                { value: 'ME', label: 'Mechanical Engineering' },
                { value: 'BBA', label: 'Business Administration' },
              ]}
            />
          </div>
        </Card>
      </section>

      {/* 5. Tabs & Responsive Data Table */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">5. Tabs & Responsive Data Table</h3>
          <Tabs
            activeTab={activeTab}
            onChange={setActiveTab}
            tabs={[
              { id: 'overview', label: 'Active Squads', badge: 5 },
              { id: 'injured', label: 'Medical Clearance', badge: 1 },
              { id: 'archived', label: 'Archived Rosters' },
            ]}
          />
        </div>

        <Table
          columns={columns}
          data={activeTab === 'injured' ? sampleAthletes.filter((a) => a.status === 'INJURED') : sampleAthletes}
          keyExtractor={(item) => item.id}
          sortColumn="athlete"
          sortDirection="asc"
        />

        <Pagination currentPage={currentPage} totalPages={4} totalItems={20} pageSize={5} onPageChange={setCurrentPage} />
      </section>

      {/* 6. Overlays: Modal, Drawer & Confirmation Dialog */}
      <section className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">6. Overlays & Dialogs</h3>
        <Card variant="default" className="p-6">
          <div className="flex flex-wrap gap-3 items-center">
            <Button variant="primary" size="sm" onClick={() => setModalOpen(true)}>
              Open Demo Modal
            </Button>

            <Button variant="outline" size="sm" onClick={() => setDrawerOpen(true)}>
              Open Slide-Out Drawer
            </Button>

            <Button variant="danger" size="sm" onClick={() => setConfirmOpen(true)}>
              Open Confirmation Dialog
            </Button>
          </div>
        </Card>
      </section>

      {/* 7. Skeleton Shimmer & States */}
      <section className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">7. Loading Skeletons, Empty & Error States</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card variant="default" className="p-5 space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton variant="circular" width={40} height={40} />
              <div className="space-y-1.5 flex-1">
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="text" width="40%" />
              </div>
            </div>
            <Skeleton variant="rectangular" height={80} />
          </Card>

          <EmptyState
            title="No Active Fixtures"
            description="All matches for this round have been completed."
            actionLabel="Schedule New Match"
            onAction={() => toast.info('Navigating to fixture scheduler...')}
          />

          <ErrorState
            title="Live Stream Disconnected"
            message="Could not establish WebSocket heartbeat."
            onRetry={() => toast.success('Reconnected to live score bus!')}
          />
        </div>
      </section>

      {/* Demo Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Quick Athlete Roster Modal" description="Sample modal overlay with backdrop blur">
        <div className="space-y-4">
          <Input label="Jersey Number" placeholder="e.g. 10" />
          <Input label="Assigned Position" placeholder="e.g. Striker / Forward" />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={() => { setModalOpen(false); toast.success('Roster saved!'); }}>Save Player</Button>
          </div>
        </div>
      </Modal>

      {/* Demo Drawer */}
      <Drawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} title="Athlete Performance Drawer" description="Slide-out drawer panel">
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <Avatar name="Harsh Sharma" size="lg" isOnline={true} />
            <div>
              <h4 className="text-base font-bold text-white">Harsh Sharma</h4>
              <p className="text-xs text-sportex-400 font-mono">CSE Cyber Strikers #10</p>
              <Badge variant="success" size="sm" className="mt-1">Captain</Badge>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs py-2 border-b border-slate-800">
              <span className="text-slate-400">Matches Played</span>
              <span className="font-bold text-white">14</span>
            </div>
            <div className="flex justify-between text-xs py-2 border-b border-slate-800">
              <span className="text-slate-400">Goals Scored</span>
              <span className="font-bold text-emerald-400">9</span>
            </div>
            <div className="flex justify-between text-xs py-2 border-b border-slate-800">
              <span className="text-slate-400">Disciplinary Cards</span>
              <span className="font-bold text-amber-400">1 Yellow</span>
            </div>
          </div>
        </div>
      </Drawer>

      {/* Demo Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          toast.error('Tournament bracket reset to initial seed state.');
        }}
        title="Reset Tournament Bracket?"
        message="This action will clear all scheduled match scores and reset team seeds. This action cannot be undone."
        confirmText="Yes, Reset Bracket"
      />
    </div>
  );
};
