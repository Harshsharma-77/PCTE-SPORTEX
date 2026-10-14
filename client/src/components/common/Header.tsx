import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Trophy, Shield, Calendar, Users, Award, Bell, LogIn, LogOut, Menu, X, LayoutDashboard } from 'lucide-react';
import { ApiStatusBadge } from './ApiStatusBadge';
import { ThemeToggle } from './ThemeToggle';
import { useAuth } from '../../hooks/useAuth';

export const Header: React.FC = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  const navLinks = [
    { name: 'Tournaments', path: '/tournaments', icon: Trophy },
    { name: 'Live Scores', path: '/live', icon: Shield },
    { name: 'Fixtures', path: '/fixtures', icon: Calendar },
    { name: 'Teams & Athletes', path: '/teams', icon: Users },
    { name: 'Certificates', path: '/certificates/verify', icon: Award },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sportex-600 via-sportex-500 to-cyan-400 p-0.5 shadow-lg shadow-sportex-500/20 group-hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Trophy className="w-5 h-5 text-sportex-400 group-hover:text-sportex-300 transition-colors" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-black text-xl tracking-wider text-white">PCTE</span>
                <span className="font-display font-bold text-xl tracking-wider bg-gradient-to-r from-sportex-400 to-cyan-400 bg-clip-text text-transparent">SPORTEX</span>
              </div>
              <p className="text-[10px] font-semibold tracking-widest text-slate-400 uppercase -mt-1">
                College Sports Management
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-sportex-600/20 text-sportex-300 border border-sportex-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Area */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden lg:block">
              <ApiStatusBadge />
            </div>

            <ThemeToggle />

            {isAuthenticated && (
              <button className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all relative">
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-sportex-500" />
              </button>
            )}

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 border border-slate-700 hover:border-sportex-500 transition-all"
                >
                  <LayoutDashboard className="w-4 h-4 text-sportex-400" />
                  <span className="hidden sm:inline">{user?.name?.split(' ')[0]}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-sportex-950 text-sportex-300 border border-sportex-800 font-mono">
                    {user?.role}
                  </span>
                </Link>

                <button
                  onClick={logout}
                  title="Logout Session"
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-800/60 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-sportex-600 to-sportex-500 hover:from-sportex-500 hover:to-sportex-400 shadow-md shadow-sportex-600/30 hover:shadow-sportex-500/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <LogIn className="w-4 h-4" />
                <span>Portal Login</span>
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-800 space-y-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-900"
                >
                  <Icon className="w-4 h-4 text-sportex-400" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
            <div className="pt-2">
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-slate-800 border border-slate-700"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>My Dashboard Hub ({user?.name})</span>
                </Link>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-sportex-600"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Portal Login</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
