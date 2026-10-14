import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import {
  Bell,
  Settings,
  Activity,
  UserCheck,
  User,
  GraduationCap,
} from 'lucide-react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { RootLayout } from './components/layouts/RootLayout';
import { DashboardLayout } from './components/layouts/DashboardLayout';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { DashboardHubPage } from './pages/DashboardHubPage';
import { UnauthorizedPage } from './pages/UnauthorizedPage';
import { ComponentsShowcasePage } from './pages/ComponentsShowcasePage';
import { ModuleShellPage } from './pages/ModuleShellPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { StudentDashboardPage } from './pages/student/StudentDashboardPage';
import { CoachDashboardPage } from './pages/coach/CoachDashboardPage';
import { RefereeDashboardPage } from './pages/referee/RefereeDashboardPage';
import { LiveMatchCenterPage } from './pages/live/LiveMatchCenterPage';
import { LiveMatchViewerPage } from './pages/live/LiveMatchViewerPage';
import { ResultsAndStandingsPage } from './pages/results/ResultsAndStandingsPage';
import { LeaderboardsAnalyticsPage } from './pages/analytics/LeaderboardsAnalyticsPage';
import { CertificatesAdminPage } from './pages/certificates/CertificatesAdminPage';
import { VerifyCertificatePage } from './pages/certificates/VerifyCertificatePage';
import { InventoryAdminPage } from './pages/inventory/InventoryAdminPage';
import { FeedbackDeskPage } from './pages/feedback/FeedbackDeskPage';
import { VenuesManagementPage } from './pages/venues/VenuesManagementPage';
import { AuditLogsPage } from './pages/audit/AuditLogsPage';
import { SportsAdminPage } from './pages/admin/SportsAdminPage';
import { TeamsAdminPage } from './pages/admin/TeamsAdminPage';
import { TournamentsAdminPage } from './pages/admin/TournamentsAdminPage';
import { FixturesAdminPage } from './pages/admin/FixturesAdminPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { RoleRoute } from './components/auth/RoleRoute';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Website Routes (Wrapped in RootLayout) */}
              <Route path="/" element={<RootLayout />}>
                <Route index element={<HomePage />} />
                <Route path="login" element={<LoginPage />} />
                <Route path="unauthorized" element={<UnauthorizedPage />} />
                <Route path="components-showcase" element={<ComponentsShowcasePage />} />
                <Route path="live" element={<LiveMatchCenterPage />} />
                <Route path="live/:matchId" element={<LiveMatchViewerPage />} />
                <Route path="results" element={<ResultsAndStandingsPage />} />
                <Route path="standings" element={<ResultsAndStandingsPage />} />
                <Route path="leaderboards" element={<LeaderboardsAnalyticsPage />} />
                <Route path="analytics" element={<LeaderboardsAnalyticsPage />} />
                <Route path="verify-certificate/:certificateId" element={<VerifyCertificatePage />} />
                <Route path="verify-certificate" element={<VerifyCertificatePage />} />
                <Route path="verify/:identifier" element={<VerifyCertificatePage />} />
              </Route>

              {/* Authenticated Dashboard Routes (Wrapped in DashboardLayout) */}
              <Route
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="dashboard" element={<DashboardHubPage />} />
                <Route path="ui-system" element={<ComponentsShowcasePage />} />
                <Route path="live" element={<LiveMatchCenterPage />} />
                <Route path="live/:matchId" element={<LiveMatchViewerPage />} />
                <Route path="results" element={<ResultsAndStandingsPage />} />
                <Route path="standings" element={<ResultsAndStandingsPage />} />
                <Route path="leaderboards" element={<LeaderboardsAnalyticsPage />} />
                <Route path="analytics" element={<LeaderboardsAnalyticsPage />} />
                <Route path="certificates" element={<CertificatesAdminPage />} />
                <Route path="verify-certificate/:certificateId" element={<VerifyCertificatePage />} />
                <Route path="inventory" element={<InventoryAdminPage />} />
                <Route path="feedback" element={<FeedbackDeskPage />} />
                <Route path="venues" element={<VenuesManagementPage />} />
                <Route path="audit-logs" element={<AuditLogsPage />} />

                {/* ========================================================= */}
                {/* ADMIN ROUTES (SUPER_ADMIN / SPORTS_ADMIN)                */}
                {/* ========================================================= */}
                <Route path="admin" element={<RoleRoute allowedRoles={['SUPER_ADMIN', 'SPORTS_ADMIN']}><AdminDashboardPage /></RoleRoute>}>
                  <Route index element={<AdminDashboardPage />} />
                  <Route path="dashboard" element={<AdminDashboardPage />} />
                  <Route
                    path="users"
                    element={
                      <ModuleShellPage
                        title="User & Identity Management"
                        subtitle="Manage college staff, coaches, referees, and student athlete roles and accounts."
                        category="Identity"
                        targetPhase="Phase 4"
                        icon={User}
                        features={['Multi-role invite system', 'Account activation & suspension', 'Password reset dispatch', 'KYC & Student ID verification']}
                      />
                    }
                  />
                  <Route
                    path="students"
                    element={
                      <ModuleShellPage
                        title="Student Athletes Directory"
                        subtitle="Departmental student athlete records, eligibility flags, and participation history."
                        category="Roster"
                        targetPhase="Phase 5"
                        icon={GraduationCap}
                        features={['Batch & semester directory', 'Medical fitness tracking', 'Sport varsity registrations', 'Disciplinary status']}
                      />
                    }
                  />
                  <Route path="sports" element={<SportsAdminPage />} />
                  <Route path="teams" element={<TeamsAdminPage />} />
                  <Route path="players" element={<TeamsAdminPage />} />
                  <Route
                    path="coaches"
                    element={
                      <ModuleShellPage
                        title="Coaching Staff"
                        subtitle="Varsity head coaches, specializations, qualifications, and team allocations."
                        category="Coaches"
                        targetPhase="Phase 6"
                        icon={UserCheck}
                        features={['Coaching licenses (AFC, BCCI, NIS)', 'Assigned sports squads', 'Experience tracking', 'Coach bio & contact']}
                      />
                    }
                  />
                  <Route
                    path="referees"
                    element={
                      <ModuleShellPage
                        title="Referees & Match Officials"
                        subtitle="Certified sports officials, licensing levels, and fixture assignment rosters."
                        category="Officials"
                        targetPhase="Phase 7"
                        icon={Activity}
                        features={['Officiating badges (District/State/National)', 'Certified sports array', 'Conflict of interest checks', 'Fixture assignment ledger']}
                      />
                    }
                  />
                  <Route path="tournaments" element={<TournamentsAdminPage />} />
                  <Route path="fixtures" element={<FixturesAdminPage />} />
                  <Route path="results" element={<ResultsAndStandingsPage />} />
                  <Route path="venues" element={<VenuesManagementPage />} />
                  <Route path="inventory" element={<InventoryAdminPage />} />
                  <Route path="certificates" element={<CertificatesAdminPage />} />
                  <Route
                    path="announcements"
                    element={
                      <ModuleShellPage
                        title="Announcements & Notices"
                        subtitle="Broadcast sports bulletins, fixture updates, and varsity notices to students & coaches."
                        category="Broadcast"
                        targetPhase="Phase 14"
                        icon={Bell}
                        features={['Target audience filter (All, Coaches, Students)', 'Pinned priority bulletins', 'Expiry date scheduling', 'Real-time WebSocket alerts']}
                      />
                    }
                  />
                  <Route path="analytics" element={<LeaderboardsAnalyticsPage />} />
                  <Route path="feedback" element={<FeedbackDeskPage />} />
                  <Route path="audit-logs" element={<AuditLogsPage />} />
                  <Route
                    path="settings"
                    element={
                      <ModuleShellPage
                        title="System Settings & Config"
                        subtitle="Platform configuration, academic session years, and security parameters."
                        category="Config"
                        targetPhase="Phase 18"
                        icon={Settings}
                        features={['Academic year session switcher', 'Default scoring multipliers', 'Email & SMS notification gateway', 'Backup & maintenance']}
                      />
                    }
                  />
                </Route>

                {/* ========================================================= */}
                {/* STUDENT ROUTES (STUDENT)                                 */}
                {/* ========================================================= */}
                <Route path="student" element={<RoleRoute allowedRoles={['STUDENT', 'SUPER_ADMIN', 'SPORTS_ADMIN']}><StudentDashboardPage /></RoleRoute>}>
                  <Route index element={<StudentDashboardPage />} />
                  <Route path="dashboard" element={<StudentDashboardPage />} />
                  <Route path="profile" element={<StudentDashboardPage />} />
                  <Route path="sports" element={<StudentDashboardPage />} />
                  <Route path="team" element={<StudentDashboardPage />} />
                  <Route path="fixtures" element={<StudentDashboardPage />} />
                  <Route path="results" element={<StudentDashboardPage />} />
                  <Route path="statistics" element={<StudentDashboardPage />} />
                  <Route path="certificates" element={<StudentDashboardPage />} />
                  <Route path="notifications" element={<StudentDashboardPage />} />
                </Route>

                {/* ========================================================= */}
                {/* COACH ROUTES (COACH)                                     */}
                {/* ========================================================= */}
                <Route path="coach" element={<RoleRoute allowedRoles={['COACH', 'SUPER_ADMIN', 'SPORTS_ADMIN']}><CoachDashboardPage /></RoleRoute>}>
                  <Route index element={<CoachDashboardPage />} />
                  <Route path="dashboard" element={<CoachDashboardPage />} />
                  <Route path="team" element={<CoachDashboardPage />} />
                  <Route path="players" element={<CoachDashboardPage />} />
                  <Route path="attendance" element={<CoachDashboardPage />} />
                  <Route path="fixtures" element={<CoachDashboardPage />} />
                  <Route path="statistics" element={<CoachDashboardPage />} />
                </Route>

                {/* ========================================================= */}
                {/* REFEREE ROUTES (REFEREE)                                 */}
                {/* ========================================================= */}
                <Route path="referee" element={<RoleRoute allowedRoles={['REFEREE', 'SUPER_ADMIN', 'SPORTS_ADMIN']}><RefereeDashboardPage /></RoleRoute>}>
                  <Route index element={<RefereeDashboardPage />} />
                  <Route path="dashboard" element={<RefereeDashboardPage />} />
                  <Route path="assigned-matches" element={<RefereeDashboardPage />} />
                  <Route path="live-matches" element={<RefereeDashboardPage />} />
                  <Route path="match-history" element={<RefereeDashboardPage />} />
                </Route>
              </Route>

              {/* Catch-all Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
