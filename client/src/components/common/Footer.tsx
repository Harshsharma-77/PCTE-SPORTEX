import React from 'react';
import { Trophy, Github, Shield, MapPin, Mail, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 mt-auto py-10 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1: Institutional Branding */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-sportex-600 flex items-center justify-center">
                <Trophy className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-bold text-lg text-slate-900 dark:text-white">PCTE SPORTEX</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Official Sports Management & Real-Time Tournament Operations Platform for PCTE Group of Institutes, Ludhiana.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <Shield className="w-3.5 h-3.5 text-sportex-500" />
              <span>Directorate of Sports & Athletics</span>
            </div>
          </div>

          {/* Col 2: Role Portals */}
          <div>
            <h4 className="text-xs font-bold tracking-wider text-slate-900 dark:text-slate-200 uppercase mb-3">Campus Portals</h4>
            <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
              <li><Link to="/login" className="hover:text-sportex-500 transition-colors">Sports Admin Directorate</Link></li>
              <li><Link to="/login" className="hover:text-sportex-500 transition-colors">Varsity Coach Portal</Link></li>
              <li><Link to="/login" className="hover:text-sportex-500 transition-colors">Referee Live Scoring Desk</Link></li>
              <li><Link to="/login" className="hover:text-sportex-500 transition-colors">Student Athlete Center</Link></li>
            </ul>
          </div>

          {/* Col 3: Varsity Disciplines */}
          <div>
            <h4 className="text-xs font-bold tracking-wider text-slate-900 dark:text-slate-200 uppercase mb-3">Athletics & Features</h4>
            <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
              <li><Link to="/tournaments" className="hover:text-sportex-500 transition-colors">Inter-Department Tournaments</Link></li>
              <li><Link to="/fixtures" className="hover:text-sportex-500 transition-colors">Match Fixtures & Schedule</Link></li>
              <li><Link to="/teams" className="hover:text-sportex-500 transition-colors">Campus Franchises & Squads</Link></li>
              <li><Link to="/certificates/verify" className="hover:text-sportex-500 transition-colors">Digital Certificate Verification</Link></li>
            </ul>
          </div>

          {/* Col 4: Campus & Department Contact */}
          <div className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
            <h4 className="text-xs font-bold tracking-wider text-slate-900 dark:text-slate-200 uppercase mb-3">Campus Contact</h4>
            <div className="flex items-start gap-2">
              <MapPin className="w-3.5 h-3.5 text-sportex-500 flex-shrink-0 mt-0.5" />
              <span>PCTE Group of Institutes, Baddowal Campus, Ferozepur Road, Ludhiana, Punjab 142021</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-sportex-500 flex-shrink-0" />
              <a href="mailto:sports@pcte.edu.in" className="hover:text-sportex-500 transition-colors">sports@pcte.edu.in</a>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-3.5 h-3.5 text-sportex-500 flex-shrink-0" />
              <span>Dept. of Computer Science & Engineering</span>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5 text-center sm:text-left">
            <span>&copy; 2026 PCTE SPORTEX. Final Year Major Project by</span>
            <span className="font-semibold text-slate-900 dark:text-white">Harsh Sharma & Team</span>
            <span>(B.Tech CSE)</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300">
              v1.0.0
            </span>
            <a
              href="https://github.com/Harshsharma-77/PCTE-SPORTEX"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-slate-600 dark:text-slate-300 hover:text-sportex-500 transition-colors"
            >
              <Github className="w-4 h-4" />
              <span>Source Repository</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
