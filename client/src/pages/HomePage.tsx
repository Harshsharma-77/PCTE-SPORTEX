import React from 'react';
import { motion, type Variants } from 'framer-motion';
import {
  Trophy,
  Shield,
  Zap,
  Users,
  QrCode,
  Layers,
  ArrowRight,
  Database,
  Radio,
  Server,
  Lock,
  CheckCircle2,
} from 'lucide-react';
import { ApiStatusBadge } from '../components/common/ApiStatusBadge';

export const HomePage: React.FC = () => {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  };

  const roles = [
    {
      title: 'Super & Sports Admin',
      role: 'SUPER_ADMIN / SPORTS_ADMIN',
      desc: 'Master tournament setup, bracket generation, venue & official scheduling, certificates & audit logs.',
      icon: Shield,
      accent: 'from-blue-600 to-indigo-600',
      badge: 'Full Governance',
    },
    {
      title: 'Coaches & Managers',
      role: 'COACH',
      desc: 'Squad rosters, player attendance logs, tactical lineups, match history and team performance.',
      icon: Users,
      accent: 'from-emerald-600 to-teal-600',
      badge: 'Team Operations',
    },
    {
      title: 'Referees & Officials',
      role: 'REFEREE',
      desc: 'Live match scoring console, real-time WebSocket score updates, card penalties & event timeline.',
      icon: Zap,
      accent: 'from-amber-600 to-orange-600',
      badge: 'Live Scoring',
    },
    {
      title: 'Student Athletes',
      role: 'STUDENT',
      desc: 'Player statistics, digital verified QR certificates, fixture timetable, notifications & equipment loan desk.',
      icon: Trophy,
      accent: 'from-sportex-600 to-cyan-600',
      badge: 'Athlete Hub',
    },
  ];

  const highlights = [
    { label: 'Real-Time WebSocket Scoring', value: '<50ms latency', icon: Radio },
    { label: 'Normalized PostgreSQL Models', value: '22 Core Entities', icon: Database },
    { label: 'Cryptographic QR Verification', value: 'UUID Signed', icon: QrCode },
    { label: 'Granular Access Control', value: '6 Roles Enforced', icon: Lock },
  ];

  return (
    <div className="relative overflow-hidden">
      {/* Background Glow Accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none -z-10">
        <div className="absolute top-[-100px] left-1/4 w-96 h-96 bg-sportex-600/20 rounded-full blur-[120px]" />
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-cyan-500/15 rounded-full blur-[120px]" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-24"
      >
        {/* Mobile Api Badge */}
        <div className="lg:hidden mb-6 flex justify-center">
          <ApiStatusBadge />
        </div>

        {/* Hero Section */}
        <motion.div variants={itemVariants} className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sportex-950/80 border border-sportex-500/30 text-sportex-300 text-xs font-semibold uppercase tracking-wider mb-6 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            Phase 1 Foundation Operational
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1] mb-6">
            PCTE <span className="bg-gradient-to-r from-sportex-400 via-cyan-300 to-sportex-500 bg-clip-text text-transparent">SPORTEX</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 font-normal leading-relaxed mb-8">
            The next-generation, production-grade College Sports Management Platform. Powered by real-time WebSockets, normalized PostgreSQL data architecture, automated brackets, and instant QR-verified certificates.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-bold text-white bg-gradient-to-r from-sportex-600 via-sportex-500 to-cyan-500 hover:from-sportex-500 hover:to-cyan-400 shadow-xl shadow-sportex-600/30 hover:scale-105 transition-all duration-300"
            >
              <span>Access Portals</span>
              <ArrowRight className="w-5 h-5" />
            </a>

            <a
              href="#architecture"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-semibold text-slate-300 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 hover:text-white transition-all"
            >
              <Layers className="w-5 h-5 text-sportex-400" />
              <span>Explore Architecture</span>
            </a>
          </div>
        </motion.div>

        {/* Highlights Bar */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-20">
          {highlights.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md hover:border-slate-700 transition-all group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-sportex-400 group-hover:scale-110 transition-transform">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{item.label}</span>
                </div>
                <div className="text-xl font-bold text-white font-display">{item.value}</div>
              </div>
            );
          })}
        </motion.div>

        {/* Role Portals Grid */}
        <motion.div variants={itemVariants} className="mb-20">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mb-3">Multi-Role Governance</h2>
            <p className="text-slate-400 text-sm sm:text-base">
              Engineered with strict backend authorization enforcing unique workflows for every stakeholder.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {roles.map((r, idx) => {
              const Icon = r.icon;
              return (
                <div
                  key={idx}
                  className="group relative p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-sportex-500/50 backdrop-blur-md flex flex-col justify-between hover:shadow-2xl hover:shadow-sportex-500/10 transition-all duration-300"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${r.accent} flex items-center justify-center text-white shadow-lg`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {r.badge}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1 group-hover:text-sportex-300 transition-colors">{r.title}</h3>
                    <p className="text-xs font-mono text-sportex-400 mb-3">{r.role}</p>
                    <p className="text-xs text-slate-400 leading-relaxed">{r.desc}</p>
                  </div>

                  <div className="pt-6 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-sportex-400 group-hover:text-sportex-300">
                    <span>Enter Portal</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Phase 1 Verification & Technical Architecture Card */}
        <motion.div variants={itemVariants} id="architecture" className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8 pb-6 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <h3 className="text-xl sm:text-2xl font-bold text-white">Phase 1: Project Foundation Verified</h3>
              </div>
              <p className="text-sm text-slate-400">
                Full-stack environment, typed contracts, normalized Prisma models, and Socket.IO real-time backbone are operational.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800/60 text-xs font-mono font-bold">
                Phase 1 of 20 Complete
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-xl bg-slate-950/70 border border-slate-800">
              <div className="flex items-center gap-2 text-sportex-400 mb-3">
                <Server className="w-5 h-5" />
                <h4 className="text-sm font-bold text-white">Backend Architecture</h4>
              </div>
              <ul className="space-y-2 text-xs text-slate-300 font-mono">
                <li className="flex items-center gap-2">✓ Node.js 24 + Express 4</li>
                <li className="flex items-center gap-2">✓ TypeScript Strict Compilation</li>
                <li className="flex items-center gap-2">✓ Centralized Zod Validation</li>
                <li className="flex items-center gap-2">✓ Security Helmet & Rate Limiter</li>
              </ul>
            </div>

            <div className="p-5 rounded-xl bg-slate-950/70 border border-slate-800">
              <div className="flex items-center gap-2 text-emerald-400 mb-3">
                <Database className="w-5 h-5" />
                <h4 className="text-sm font-bold text-white">Database Layer</h4>
              </div>
              <ul className="space-y-2 text-xs text-slate-300 font-mono">
                <li className="flex items-center gap-2">✓ PostgreSQL Schema Defined</li>
                <li className="flex items-center gap-2">✓ 22 Normalized Entities</li>
                <li className="flex items-center gap-2">✓ Prisma Client Generated</li>
                <li className="flex items-center gap-2">✓ Production Seeder Ready</li>
              </ul>
            </div>

            <div className="p-5 rounded-xl bg-slate-950/70 border border-slate-800">
              <div className="flex items-center gap-2 text-cyan-400 mb-3">
                <Radio className="w-5 h-5" />
                <h4 className="text-sm font-bold text-white">Real-Time & Client</h4>
              </div>
              <ul className="space-y-2 text-xs text-slate-300 font-mono">
                <li className="flex items-center gap-2">✓ Vite + React 18 + TS</li>
                <li className="flex items-center gap-2">✓ Tailwind CSS + Framer Motion</li>
                <li className="flex items-center gap-2">✓ Socket.IO Bidirectional Bus</li>
                <li className="flex items-center gap-2">✓ Responsive Dark/Light Base</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};
