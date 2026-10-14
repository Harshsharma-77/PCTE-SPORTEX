import React from 'react';
import { Trophy, Github, Shield, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-800/80 bg-slate-950 mt-auto py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1 */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-sportex-600 flex items-center justify-center">
                <Trophy className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-bold text-lg text-white">PCTE SPORTEX</span>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              Official Sports Management & Real-Time Tournament Operations Platform for PCTE Group of Institutes. Built for high-performance collegiate athletics.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
              <Shield className="w-3.5 h-3.5 text-sportex-400" />
              <span>Final Year BTech CSE Capstone Project &copy; 2026</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-xs font-bold tracking-wider text-slate-300 uppercase mb-3">Portals</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="/login" className="hover:text-sportex-400 transition-colors">Admin & Sports Desk</a></li>
              <li><a href="/login" className="hover:text-sportex-400 transition-colors">Coach Hub</a></li>
              <li><a href="/login" className="hover:text-sportex-400 transition-colors">Referee Scoring App</a></li>
              <li><a href="/login" className="hover:text-sportex-400 transition-colors">Student Athlete Center</a></li>
            </ul>
          </div>

          {/* Col 3: Architecture Info */}
          <div>
            <h4 className="text-xs font-bold tracking-wider text-slate-300 uppercase mb-3">Tech Specs</h4>
            <ul className="space-y-1.5 text-xs text-slate-400 font-mono">
              <li className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-sportex-400" /> React 18 + TypeScript</li>
              <li className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Node.js + Express</li>
              <li className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-cyan-400" /> PostgreSQL + Prisma</li>
              <li className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Socket.IO WebSockets</li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>by BTech CSE Department, PCTE</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-mono">v1.0.0-phase1-verified</span>
            <div className="flex items-center gap-1 text-slate-400">
              <Github className="w-4 h-4" />
              <span>Production Architecture</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
