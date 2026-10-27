import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, LogOut, Key, User as UserIcon, LayoutDashboard, Search } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { ThemeToggle } from '../common/ThemeToggle';
import { ApiStatusBadge } from '../common/ApiStatusBadge';
import { Breadcrumbs } from '../common/Breadcrumbs';
import { NotificationDrawer } from '../common/NotificationDrawer';
import { GlobalSearchModal } from '../common/GlobalSearchModal';
import { Dropdown } from '../ui/Dropdown';
import { Avatar } from '../ui/Avatar';

export interface TopNavbarProps {
  onOpenMobileMenu: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({ onOpenMobileMenu }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = React.useState(false);

  const userDropdownItems = [
    {
      id: 'dashboard',
      label: 'My Hub Overview',
      icon: <LayoutDashboard className="w-3.5 h-3.5 text-sportex-400" />,
      onClick: () => {
        navigate('/dashboard');
      },
    },
    {
      id: 'profile',
      label: 'Profile Details',
      icon: <UserIcon className="w-3.5 h-3.5 text-slate-400" />,
      onClick: () => {
        if (user?.role === 'STUDENT') {
          navigate('/student/profile');
        } else if (user?.role === 'COACH') {
          navigate('/coach/team');
        } else {
          navigate('/dashboard');
        }
      },
    },
    {
      id: 'settings',
      label: 'Settings & Security',
      icon: <Key className="w-3.5 h-3.5 text-slate-400" />,
      onClick: () => {
        if (user?.role === 'SUPER_ADMIN' || user?.role === 'SPORTS_ADMIN') {
          navigate('/admin/settings');
        } else {
          navigate('/dashboard');
        }
      },
    },
    {
      id: 'logout',
      label: 'Sign Out Session',
      icon: <LogOut className="w-3.5 h-3.5 text-rose-400" />,
      danger: true,
      dividerBefore: true,
      onClick: () => {
        logout();
        navigate('/login');
      },
    },
  ];

  return (
    <header className="sticky top-0 z-40 w-full h-16 sm:h-20 bg-white/90 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 transition-colors duration-200">
      {/* Left: Mobile Drawer Trigger + Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800 transition-colors"
          aria-label="Open Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:block">
          <Breadcrumbs />
        </div>
      </div>

      {/* Right Action Bar */}
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        {/* Omnisearch Trigger Button */}
        <button
          onClick={() => setSearchOpen(true)}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 text-xs text-slate-400 hover:text-white transition-all shadow-inner"
        >
          <Search className="w-3.5 h-3.5 text-sportex-400" />
          <span>Quick search...</span>
          <kbd className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-500">
            Ctrl K
          </kbd>
        </button>

        {/* System Diagnostics */}
        <div className="hidden xl:block">
          <ApiStatusBadge />
        </div>

        {/* Theme Selector */}
        <ThemeToggle />

        {/* Real-Time Notifications Drawer */}
        <NotificationDrawer />

        <div className="h-5 w-[1px] bg-slate-800 hidden sm:block" />

        {/* User Profile Dropdown */}
        {user && (
          <Dropdown
            trigger={
              <div className="flex items-center gap-2.5 p-1.5 pr-3 rounded-2xl hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all">
                <Avatar name={user.name} size="sm" isOnline={true} />
                <div className="text-left hidden md:block">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-white leading-none">{user.name.split(' ')[0]}</p>
                    <span className="text-[9px] px-1 py-0.2 rounded bg-sportex-950 text-sportex-300 border border-sportex-800 font-mono">
                      {user.role}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono leading-tight mt-0.5">{user.email}</p>
                </div>
              </div>
            }
            items={userDropdownItems}
          />
        )}
      </div>

      {/* Global Omnisearch Dialog */}
      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
};
