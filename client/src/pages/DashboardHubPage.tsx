import React, { useState } from 'react';
import {
  Shield,
  Key,
  LogOut,
  CheckCircle,
  XCircle,
  Terminal,
  Trophy,
  Users,
  Award,
  Zap,
  Lock,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { authApi } from '../services/authApi';

export const DashboardHubPage: React.FC = () => {
  const { user, logout, changePassword, accessToken } = useAuth();

  // Password Change Modal State
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passError, setPassError] = useState<string | null>(null);
  const [passLoading, setPassLoading] = useState(false);

  // RBAC Test State
  const [rbacLoading, setRbacLoading] = useState<string | null>(null);
  const [rbacLogs, setRbacLogs] = useState<
    Array<{ endpoint: string; status: number; message: string; success: boolean; timestamp: string }>
  >([]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);
    setPassLoading(true);

    try {
      await changePassword({ currentPassword, newPassword, confirmPassword });
      setPasswordModalOpen(false);
      alert('Password updated successfully! Please sign in with your new password.');
    } catch (err: any) {
      setPassError(err.response?.data?.message || err.message || 'Password update failed');
    } finally {
      setPassLoading(false);
    }
  };

  const testEndpoint = async (endpoint: string) => {
    setRbacLoading(endpoint);
    try {
      const res = await authApi.testRbac(endpoint);
      setRbacLogs((prev) => [
        {
          endpoint: `/api/v1/rbac-test/${endpoint}`,
          status: 200,
          message: res.message || 'Authorized 200 OK',
          success: true,
          timestamp: new Date().toLocaleTimeString(),
        },
        ...prev.slice(0, 7),
      ]);
    } catch (err: any) {
      const status = err.response?.status || 500;
      const message = err.response?.data?.message || err.message || 'Unauthorized / Forbidden';
      setRbacLogs((prev) => [
        {
          endpoint: `/api/v1/rbac-test/${endpoint}`,
          status,
          message: `[${status}] ${message}`,
          success: false,
          timestamp: new Date().toLocaleTimeString(),
        },
        ...prev.slice(0, 7),
      ]);
    } finally {
      setRbacLoading(null);
    }
  };

  const roleBadges: Record<
    string,
    { label: string; variant: 'default' | 'info' | 'success' | 'warning' | 'danger' | 'purple' }
  > = {
    SUPER_ADMIN: { label: 'Super Admin (Root)', variant: 'danger' },
    SPORTS_ADMIN: { label: 'Sports Coordinator', variant: 'info' },
    COACH: { label: 'Team Coach / Manager', variant: 'success' },
    REFEREE: { label: 'Match Official / Referee', variant: 'warning' },
    STUDENT: { label: 'Student Athlete', variant: 'purple' },
    VIEWER: { label: 'Public Viewer', variant: 'default' },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Banner with User Profile Summary */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-2xl mb-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sportex-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sportex-600 via-sportex-500 to-cyan-400 p-1 shadow-xl">
              <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center text-white font-display font-black text-2xl">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{user?.name}</h1>
                <Badge variant={roleBadges[user?.role || 'STUDENT']?.variant || 'info'}>
                  {roleBadges[user?.role || 'STUDENT']?.label || user?.role}
                </Badge>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 flex-wrap">
                <span>{user?.email}</span>
                {user?.student && (
                  <>
                    <span>•</span>
                    <span className="font-mono text-sportex-400">Roll: {user.student.rollNumber}</span>
                    <span>•</span>
                    <span>{user.student.department} (Sem {user.student.semester})</span>
                  </>
                )}
                {user?.coach && (
                  <>
                    <span>•</span>
                    <span className="text-emerald-400 font-semibold">{user.coach.specialization} Head Coach</span>
                  </>
                )}
                {user?.referee && (
                  <>
                    <span>•</span>
                    <span className="text-amber-400 font-semibold">License: {user.referee.licenseNumber || 'Active'}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPasswordModalOpen(true)}
              leftIcon={<Key className="w-4 h-4" />}
            >
              Change Password
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={logout}
              leftIcon={<LogOut className="w-4 h-4" />}
            >
              Logout Session
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Role Capabilities & Active Permissions (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-md shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-sportex-400" />
              <h3 className="text-lg font-bold text-white">Assigned Permissions & Scope</h3>
            </div>

            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Your session holds a cryptographic JWT access token with dual verification on every API request.
            </p>

            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Active System Permissions:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {user?.permissions && user.permissions.length > 0 ? (
                  user.permissions.map((p, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300"
                    >
                      {p}
                    </span>
                  ))
                ) : (
                  <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-400">
                    Standard Student Athlete Tier (Self-Profile, Fixtures, Certificates)
                  </span>
                )}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Active Token Status</span>
                <span className="text-emerald-400 font-mono flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Valid & Signed
                </span>
              </div>
              <p className="text-[10px] font-mono text-slate-500 truncate">{accessToken}</p>
            </div>
          </div>

          {/* Quick Role Navigation Modules Preview */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-md shadow-xl">
            <h3 className="text-lg font-bold text-white mb-4">Core Platform Subsystems</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <Trophy className="w-4 h-4 text-amber-400 mb-1.5" />
                <h4 className="text-xs font-bold text-white">Tournaments</h4>
                <p className="text-[10px] text-emerald-400 font-medium">Bracket Engine Active</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <Zap className="w-4 h-4 text-cyan-400 mb-1.5" />
                <h4 className="text-xs font-bold text-white">Live Scoring</h4>
                <p className="text-[10px] text-emerald-400 font-medium">WebSocket Streaming</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <Users className="w-4 h-4 text-emerald-400 mb-1.5" />
                <h4 className="text-xs font-bold text-white">Squad Rosters</h4>
                <p className="text-[10px] text-emerald-400 font-medium">Franchise Sync</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <Award className="w-4 h-4 text-indigo-400 mb-1.5" />
                <h4 className="text-xs font-bold text-white">QR Certificates</h4>
                <p className="text-[10px] text-emerald-400 font-medium">Cryptographic UUID</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live RBAC Test Center (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 backdrop-blur-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-bold text-white">Live Backend RBAC Tester</h3>
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-400 px-2 py-0.5 rounded bg-slate-800">
                Active Role: {user?.role}
              </span>
            </div>

            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Click below to dispatch real HTTP requests to role-guarded endpoints (`/api/v1/rbac-test/*`). The backend middleware enforces authorization.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-6">
              <Button
                variant="outline"
                size="sm"
                className="text-xs justify-start"
                onClick={() => testEndpoint('superadmin-only')}
                isLoading={rbacLoading === 'superadmin-only'}
              >
                Super Admin
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="text-xs justify-start"
                onClick={() => testEndpoint('admin-only')}
                isLoading={rbacLoading === 'admin-only'}
              >
                Sports Admin
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="text-xs justify-start"
                onClick={() => testEndpoint('coach-only')}
                isLoading={rbacLoading === 'coach-only'}
              >
                Coach Only
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="text-xs justify-start"
                onClick={() => testEndpoint('student-only')}
                isLoading={rbacLoading === 'student-only'}
              >
                Student Only
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="text-xs justify-start"
                onClick={() => testEndpoint('referee-only')}
                isLoading={rbacLoading === 'referee-only'}
              >
                Referee Only
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="text-xs justify-start"
                onClick={() => testEndpoint('permission-scoring')}
                isLoading={rbacLoading === 'permission-scoring'}
              >
                Live Scoring Perm
              </Button>
            </div>

            {/* Terminal Logs Output */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 font-mono text-xs space-y-2 max-h-60 overflow-y-auto">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest pb-1 border-b border-slate-900 flex justify-between items-center">
                <span>Authorization Terminal</span>
                <span>{rbacLogs.length} events</span>
              </div>

              {rbacLogs.length === 0 ? (
                <p className="text-slate-600 italic">Click any test button above to test authorization response...</p>
              ) : (
                rbacLogs.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-[11px] leading-tight">
                    {log.success ? (
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="font-semibold text-slate-200">{log.endpoint}</span>
                        <span className="text-[9px] text-slate-500">{log.timestamp}</span>
                      </div>
                      <p className={log.success ? 'text-emerald-400' : 'text-rose-400'}>{log.message}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      <Modal
        isOpen={passwordModalOpen}
        onClose={() => {
          setPasswordModalOpen(false);
          setPassError(null);
        }}
        title="Update Account Password"
        description="Change your security credentials. All other active sessions will be revoked."
        maxWidth="md"
      >
        <form onSubmit={handlePasswordChange} className="space-y-4">
          {passError && (
            <p className="text-xs text-rose-400 bg-rose-950/60 p-2.5 rounded-xl border border-rose-800">
              {passError}
            </p>
          )}

          <Input
            label="Current Password"
            type="password"
            placeholder="Enter current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            leftIcon={<Key className="w-4 h-4" />}
          />

          <Input
            label="New Password (min 8 chars, 1 uppercase, 1 number)"
            type="password"
            placeholder="Enter new strong password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            leftIcon={<Lock className="w-4 h-4" />}
          />

          <Input
            label="Confirm New Password"
            type="password"
            placeholder="Re-enter new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            leftIcon={<Lock className="w-4 h-4" />}
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <Button type="button" variant="ghost" onClick={() => setPasswordModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={passLoading}>
              Update Password
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
