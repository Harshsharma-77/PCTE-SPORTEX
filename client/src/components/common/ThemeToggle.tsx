import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Laptop, ChevronDown } from 'lucide-react';
import { useTheme, ThemeMode } from '../../context/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { mode, theme, setMode } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const options: Array<{ mode: ThemeMode; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { mode: 'light', label: 'Light', icon: Sun },
    { mode: 'dark', label: 'Dark', icon: Moon },
    { mode: 'system', label: 'System', icon: Laptop },
  ];

  const currentIcon = () => {
    if (mode === 'system') return <Laptop className="w-4 h-4 text-cyan-400" />;
    return theme === 'dark' ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-400" />;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        type="button"
        title={`Theme: ${mode.toUpperCase()} (${theme})`}
        aria-label="Toggle Theme Menu"
        className="flex items-center gap-1.5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 dark:hover:bg-slate-800 border border-slate-800 transition-all hover:scale-105"
      >
        {currentIcon()}
        <ChevronDown className="w-3 h-3 text-slate-500 hidden sm:block" />
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-36 rounded-2xl bg-slate-900 dark:bg-slate-900 border border-slate-800 shadow-2xl py-1.5 z-50 backdrop-blur-xl">
          {options.map((opt) => {
            const Icon = opt.icon;
            const isSelected = mode === opt.mode;
            return (
              <button
                key={opt.mode}
                onClick={() => {
                  setMode(opt.mode);
                  setDropdownOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium transition-colors ${
                  isSelected
                    ? 'bg-sportex-600/20 text-sportex-300 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-sportex-400' : 'text-slate-400'}`} />
                <span>{opt.label}</span>
                {isSelected && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-sportex-400" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
