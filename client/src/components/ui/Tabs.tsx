import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  variant?: 'pills' | 'line' | 'cards';
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = 'pills',
  className,
}) => {
  return (
    <div
      className={cn(
        'flex items-center gap-1.5 overflow-x-auto no-scrollbar',
        variant === 'pills' && 'p-1 rounded-2xl bg-slate-900/80 border border-slate-800',
        variant === 'line' && 'border-b border-slate-800 gap-4',
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              'relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap',
              variant === 'pills' && (isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200'),
              variant === 'line' && (isActive ? 'text-sportex-400 pb-3' : 'text-slate-400 hover:text-white pb-3'),
              variant === 'cards' && (isActive ? 'bg-slate-900 border border-sportex-500/50 text-white' : 'bg-slate-950/60 border border-slate-800 text-slate-400')
            )}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={cn(
                  'text-[10px] px-1.5 py-0.2 rounded-full font-mono',
                  isActive ? 'bg-sportex-500 text-white' : 'bg-slate-800 text-slate-400'
                )}
              >
                {tab.badge}
              </span>
            )}

            {/* Pill Active Background Animation */}
            {variant === 'pills' && isActive && (
              <motion.div
                layoutId="activeTabPill"
                className="absolute inset-0 bg-sportex-600 rounded-xl -z-10 shadow-md shadow-sportex-600/30"
                transition={{ type: 'spring', damping: 20, stiffness: 250 }}
              />
            )}

            {/* Line Active Underline Animation */}
            {variant === 'line' && isActive && (
              <motion.div
                layoutId="activeTabLine"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-sportex-500 rounded-full"
                transition={{ type: 'spring', damping: 20, stiffness: 250 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
};
