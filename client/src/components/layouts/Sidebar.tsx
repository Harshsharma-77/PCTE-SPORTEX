import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Trophy,
  LayoutDashboard,
  Users,
  GraduationCap,
  Shield,
  Award,
  Calendar,
  Layers,
  MapPin,
  Package,
  Bell,
  BarChart3,
  MessageSquare,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
  Activity,
  CheckSquare,
  UserCheck,
  User,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../utils/cn';
import { Badge } from '../ui/Badge';

export interface NavSection {
  title?: string;
  items: Array<{
    name: string;
    path: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }>;
}

export const Sidebar: React.FC<{ isCollapsed: boolean; onToggleCollapse: () => void; isMobile?: boolean }> = ({
  isCollapsed,
  onToggleCollapse,
  isMobile = false,
}) => {
  const { user } = useAuth();
  const location = useLocation();

  const getNavSections = (): NavSection[] => {
    const role = user?.role || 'STUDENT';

    if (role === 'SUPER_ADMIN' || role === 'SPORTS_ADMIN') {
      return [
        {
          title: 'Management Hub',
          items: [
            { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
            { name: 'Analytics & Reports', path: '/admin/analytics', icon: BarChart3 },
            { name: 'Audit Logs', path: '/admin/audit-logs', icon: FileText },
          ],
        },
        {
          title: 'Athletic Operations',
          items: [
            { name: 'Sports Catalog', path: '/admin/sports', icon: Layers },
            { name: 'Tournaments', path: '/admin/tournaments', icon: Trophy },
            { name: 'Fixtures & Schedule', path: '/admin/fixtures', icon: Calendar },
            { name: 'Results & Standings', path: '/admin/results', icon: Zap },
            { name: 'Venues & Courts', path: '/admin/venues', icon: MapPin },
          ],
        },
        {
          title: 'Teams & Rosters',
          items: [
            { name: 'Teams', path: '/admin/teams', icon: Shield },
            { name: 'Players & Squads', path: '/admin/players', icon: Users },
            { name: 'Coaches', path: '/admin/coaches', icon: UserCheck },
            { name: 'Referees', path: '/admin/referees', icon: Activity },
            { name: 'Students', path: '/admin/students', icon: GraduationCap },
          ],
        },
        {
          title: 'Administration',
          items: [
            { name: 'Inventory & Gear', path: '/admin/inventory', icon: Package },
            { name: 'QR Certificates', path: '/admin/certificates', icon: Award },
            { name: 'Announcements', path: '/admin/announcements', icon: Bell },
            { name: 'Feedback Desk', path: '/admin/feedback', icon: MessageSquare },
            { name: 'User Directory', path: '/admin/users', icon: User },
            { name: 'Settings', path: '/admin/settings', icon: Settings },
          ],
        },
      ];
    }

    if (role === 'COACH') {
      return [
        {
          title: 'Coach Center',
          items: [
            { name: 'Dashboard', path: '/coach/dashboard', icon: LayoutDashboard },
            { name: 'My Team & Squad', path: '/coach/team', icon: Shield },
            { name: 'Player Rosters', path: '/coach/players', icon: Users },
            { name: 'Attendance Ledger', path: '/coach/attendance', icon: CheckSquare },
            { name: 'Match Fixtures', path: '/coach/fixtures', icon: Calendar },
            { name: 'Team Statistics', path: '/coach/statistics', icon: BarChart3 },
          ],
        },
      ];
    }

    if (role === 'REFEREE') {
      return [
        {
          title: 'Official Console',
          items: [
            { name: 'Dashboard', path: '/referee/dashboard', icon: LayoutDashboard },
            { name: 'Assigned Matches', path: '/referee/assigned-matches', icon: Calendar },
            { name: 'Live Scorer Console', path: '/referee/live-matches', icon: Zap, badge: 'LIVE' },
            { name: 'Match History', path: '/referee/match-history', icon: FileText },
          ],
        },
      ];
    }

    // Default: STUDENT
    return [
      {
        title: 'Athlete Hub',
        items: [
          { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
          { name: 'Athlete Profile', path: '/student/profile', icon: User },
          { name: 'Sports & Varsity', path: '/student/sports', icon: Layers },
          { name: 'My Team', path: '/student/team', icon: Shield },
          { name: 'Fixtures Calendar', path: '/student/fixtures', icon: Calendar },
          { name: 'Results & Tables', path: '/student/results', icon: Zap },
          { name: 'Player Statistics', path: '/student/statistics', icon: BarChart3 },
          { name: 'My Certificates', path: '/student/certificates', icon: Award },
          { name: 'Notifications', path: '/student/notifications', icon: Bell },
        ],
      },
    ];
  };

  const sections = getNavSections();

  return (
    <aside
      className={cn(
        'relative flex flex-col h-full bg-slate-950 border-r border-slate-800 transition-all duration-300 select-none z-30',
        isMobile ? 'w-full' : isCollapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 sm:h-20 px-4 border-b border-slate-800">
        <NavLink to="/" className="flex items-center gap-3 overflow-hidden group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sportex-600 via-sportex-500 to-cyan-400 p-0.5 shadow-lg shadow-sportex-500/20 flex-shrink-0 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Trophy className="w-5 h-5 text-sportex-400" />
            </div>
          </div>

          {(!isCollapsed || isMobile) && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="truncate"
            >
              <div className="flex items-center gap-1">
                <span className="font-display font-black text-base tracking-wider text-white">PCTE</span>
                <span className="font-display font-bold text-base tracking-wider bg-gradient-to-r from-sportex-400 to-cyan-400 bg-clip-text text-transparent">
                  SPORTEX
                </span>
              </div>
              <p className="text-[9px] font-semibold tracking-widest text-slate-400 uppercase -mt-0.5">
                Sports Management
              </p>
            </motion.div>
          )}
        </NavLink>

        {!isMobile && (
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-colors"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Role Pill Banner */}
      {(!isCollapsed || isMobile) && (
        <div className="px-4 py-3 border-b border-slate-800/80 bg-slate-900/40">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Access Tier</span>
            <Badge variant="info" size="sm">
              {user?.role || 'STUDENT'}
            </Badge>
          </div>
        </div>
      )}

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6 no-scrollbar">
        {sections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-1">
            {section.title && (!isCollapsed || isMobile) && (
              <h4 className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                {section.title}
              </h4>
            )}

            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  title={isCollapsed && !isMobile ? item.name : undefined}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group relative',
                    isActive
                      ? 'bg-gradient-to-r from-sportex-600 to-sportex-500 text-white shadow-md shadow-sportex-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  )}
                >
                  <Icon
                    className={cn(
                      'w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110',
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-sportex-300'
                    )}
                  />

                  {(!isCollapsed || isMobile) && (
                    <span className="truncate flex-1">{item.name}</span>
                  )}

                  {item.badge && (!isCollapsed || isMobile) && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-cyan-400 text-slate-950 font-black animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </div>

      {/* Bottom Profile Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950">
        <NavLink
          to="/dashboard"
          className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-900 transition-colors group"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sportex-600 to-cyan-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>

          {(!isCollapsed || isMobile) && (
            <div className="truncate flex-1">
              <p className="text-xs font-bold text-white group-hover:text-sportex-300 transition-colors truncate">
                {user?.name}
              </p>
              <p className="text-[10px] font-mono text-slate-400 truncate">{user?.email}</p>
            </div>
          )}
        </NavLink>
      </div>
    </aside>
  );
};
