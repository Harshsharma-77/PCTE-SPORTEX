import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search,
  Users,
  Shield,
  Trophy,
  ArrowRight,
  X,
  Zap,
} from 'lucide-react';
import { searchApi } from '../../services/searchApi';
import { OmnisearchResults, SearchResultItem } from '../../types/search';

export interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<OmnisearchResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults(null);
    }
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setResults(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const data = await searchApi.omnisearch(query.trim(), 4);
        setResults(data);
      } catch (err) {
        console.error('Omnisearch error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Trigger open via custom event or prop
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSelect = (item: SearchResultItem) => {
    onClose();
    navigate(item.url);
  };

  const hasAnyResults =
    results &&
    (results.students.length > 0 ||
      results.teams.length > 0 ||
      results.sports.length > 0 ||
      results.tournaments.length > 0 ||
      results.matches.length > 0 ||
      results.announcements.length > 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-950/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -10 }}
        transition={{ duration: 0.15 }}
        className="w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
      >
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3 bg-slate-950/50">
          <Search className="w-5 h-5 text-sportex-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search students, teams, sports, tournaments, matches... (ESC to close)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-white text-sm focus:outline-none placeholder-slate-500 font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Results Container */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {isLoading && (
            <p className="text-xs text-slate-400 py-6 text-center font-mono animate-pulse">
              Searching SPORTEX institutional database...
            </p>
          )}

          {!isLoading && !hasAnyResults && query.length >= 2 && (
            <div className="py-8 text-center space-y-1">
              <p className="text-sm font-bold text-white">No results found</p>
              <p className="text-xs text-slate-400">No records matching "{query}" found.</p>
            </div>
          )}

          {!isLoading && !query && (
            <div className="py-6 text-center space-y-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Quick Navigation</p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  onClick={() => { onClose(); navigate('/live'); }}
                  className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:border-sportex-500"
                >
                  ⚡ Live Arena
                </button>
                <button
                  onClick={() => { onClose(); navigate('/results'); }}
                  className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:border-sportex-500"
                >
                  🏆 Points Table
                </button>
                <button
                  onClick={() => { onClose(); navigate('/analytics'); }}
                  className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:border-sportex-500"
                >
                  📊 Leaderboards
                </button>
                <button
                  onClick={() => { onClose(); navigate('/certificates'); }}
                  className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:border-sportex-500"
                >
                  🎖️ Certificates
                </button>
              </div>
            </div>
          )}

          {/* Results Categorized */}
          {!isLoading && results && (
            <div className="space-y-4">
              {/* Students */}
              {results.students.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2">
                    <Users className="w-3 h-3 text-sportex-400" /> Student Athletes
                  </div>
                  <div className="space-y-1">
                    {results.students.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleSelect(item)}
                        className="p-2.5 rounded-xl hover:bg-slate-800/60 cursor-pointer flex items-center justify-between transition-colors text-xs"
                      >
                        <div>
                          <p className="font-bold text-white">{item.title}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{item.subtitle}</p>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Teams */}
              {results.teams.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2">
                    <Shield className="w-3 h-3 text-cyan-400" /> Team Franchises
                  </div>
                  <div className="space-y-1">
                    {results.teams.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleSelect(item)}
                        className="p-2.5 rounded-xl hover:bg-slate-800/60 cursor-pointer flex items-center justify-between transition-colors text-xs"
                      >
                        <div>
                          <p className="font-bold text-white">{item.title}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{item.subtitle}</p>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Matches */}
              {results.matches.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2">
                    <Zap className="w-3 h-3 text-amber-400" /> Matches
                  </div>
                  <div className="space-y-1">
                    {results.matches.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleSelect(item)}
                        className="p-2.5 rounded-xl hover:bg-slate-800/60 cursor-pointer flex items-center justify-between transition-colors text-xs"
                      >
                        <div>
                          <p className="font-bold text-white">{item.title}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{item.subtitle}</p>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tournaments */}
              {results.tournaments.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2">
                    <Trophy className="w-3 h-3 text-purple-400" /> Tournaments
                  </div>
                  <div className="space-y-1">
                    {results.tournaments.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleSelect(item)}
                        className="p-2.5 rounded-xl hover:bg-slate-800/60 cursor-pointer flex items-center justify-between transition-colors text-xs"
                      >
                        <div>
                          <p className="font-bold text-white">{item.title}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{item.subtitle}</p>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Shortcut Bar */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-[10px] text-slate-500 font-mono">
          <span>Search SPORTEX registry</span>
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">ESC to close</span>
            <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">ENTER to select</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
