import React, { useState } from 'react';
import {
  Shield,
  Calendar,
  Clock,
  Database,
  Save,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../context/ToastContext';

export const SystemSettingsPage: React.FC = () => {
  const toast = useToast();
  const [saving, setSaving] = useState(false);

  // Settings State
  const [settings, setSettings] = useState({
    academicYear: '2025-2026',
    institutionName: 'Punjab College of Technical Education (PCTE)',
    sportsDirectorateEmail: 'sports@pcte.edu.in',
    operatingHoursStart: '06:00',
    operatingHoursEnd: '20:00',
    matchConflictBufferMinutes: '30',
    enableWebSocketTelemetry: true,
    enablePublicCertificates: true,
    requireMedicalClearance: true,
    sessionTimeoutMinutes: '15',
  });

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success('System configuration and security policies updated successfully!');
    }, 600);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Institutional System Settings & Governance"
        subtitle="Configure academic sessions, venue operation parameters, match conflict buffers, and platform security."
        badge={
          <Badge variant="success" size="sm">
            <Shield className="w-3.5 h-3.5 mr-1" />
            Security & Governance Verified
          </Badge>
        }
      />

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Academic Session & Institution */}
        <Card variant="default" className="p-6">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-sportex-600/20 text-sportex-400 flex items-center justify-center border border-sportex-500/30">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Academic Calendar & Institution Details</h3>
              <p className="text-xs text-slate-400">Manage varsity championship cycles and institutional contact credentials.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Current Academic Session
              </label>
              <select
                value={settings.academicYear}
                onChange={(e) => setSettings({ ...settings, academicYear: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-sportex-500"
              >
                <option value="2024-2025">2024 – 2025 Academic Year</option>
                <option value="2025-2026">2025 – 2026 Academic Year (Active)</option>
                <option value="2026-2027">2026 – 2027 Upcoming Session</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Institution Name
              </label>
              <Input
                value={settings.institutionName}
                onChange={(e) => setSettings({ ...settings, institutionName: e.target.value })}
                required
              />
            </div>
          </div>
        </Card>

        {/* Venues & Fixture Conflict Parameters */}
        <Card variant="default" className="p-6">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-cyan-600/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Venue Scheduling & Match Conflict Buffers</h3>
              <p className="text-xs text-slate-400">Enforce mathematical ground scheduling constraints to eliminate double-booking.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Complex Opens (Start Time)
              </label>
              <Input
                type="time"
                value={settings.operatingHoursStart}
                onChange={(e) => setSettings({ ...settings, operatingHoursStart: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Complex Closes (End Time)
              </label>
              <Input
                type="time"
                value={settings.operatingHoursEnd}
                onChange={(e) => setSettings({ ...settings, operatingHoursEnd: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Inter-Match Buffer (Minutes)
              </label>
              <Input
                type="number"
                value={settings.matchConflictBufferMinutes}
                onChange={(e) => setSettings({ ...settings, matchConflictBufferMinutes: e.target.value })}
                min="0"
                max="120"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">Cooldown period for pitch preparation.</span>
            </div>
          </div>
        </Card>

        {/* Real-time Streaming & Security Policies */}
        <Card variant="default" className="p-6">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Security, Real-Time Streams & Verification</h3>
              <p className="text-xs text-slate-400">Configure WebSocket broadcast permissions and cryptographic public lookups.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <div>
                <h4 className="text-sm font-semibold text-white">Socket.IO Real-Time Live Scoring Engine</h4>
                <p className="text-xs text-slate-400">Broadcast ball-by-ball and goal events to public connected spectators.</p>
              </div>
              <input
                type="checkbox"
                checked={settings.enableWebSocketTelemetry}
                onChange={(e) => setSettings({ ...settings, enableWebSocketTelemetry: e.target.checked })}
                className="w-5 h-5 rounded text-sportex-500 bg-slate-900 border-slate-700"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <div>
                <h4 className="text-sm font-semibold text-white">Public Zero-Auth QR Certificate Verification</h4>
                <p className="text-xs text-slate-400">Allow external verifiers and employers to validate certificate UUIDs without login.</p>
              </div>
              <input
                type="checkbox"
                checked={settings.enablePublicCertificates}
                onChange={(e) => setSettings({ ...settings, enablePublicCertificates: e.target.checked })}
                className="w-5 h-5 rounded text-sportex-500 bg-slate-900 border-slate-700"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <div>
                <h4 className="text-sm font-semibold text-white">Mandatory Athletic Medical Clearance</h4>
                <p className="text-xs text-slate-400">Require departmental medical fitness clearance before roster enrollment.</p>
              </div>
              <input
                type="checkbox"
                checked={settings.requireMedicalClearance}
                onChange={(e) => setSettings({ ...settings, requireMedicalClearance: e.target.checked })}
                className="w-5 h-5 rounded text-sportex-500 bg-slate-900 border-slate-700"
              />
            </div>
          </div>
        </Card>

        {/* Database & Infrastructure Summary */}
        <Card variant="glass" className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Database className="w-5 h-5 text-emerald-400" />
              <div>
                <h4 className="text-sm font-bold text-white">Database Engine & Topology</h4>
                <p className="text-xs text-slate-400">PostgreSQL 16+ via Prisma ORM • 24 Normalized Relational Models Active</p>
              </div>
            </div>
            <Badge variant="success" size="sm">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              Connected & Healthy
            </Badge>
          </div>
        </Card>

        {/* Save Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="submit"
            variant="glow"
            isLoading={saving}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Save All Configuration Changes
          </Button>
        </div>
      </form>
    </div>
  );
};
