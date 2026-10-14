import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';

export interface DropdownItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
  disabled?: boolean;
  dividerBefore?: boolean;
}

export interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  placement?: 'left' | 'right';
  className?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  items,
  placement = 'right',
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -5 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={cn(
              'absolute z-50 mt-2 w-48 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl py-1.5 backdrop-blur-xl',
              placement === 'right' ? 'right-0' : 'left-0',
              className
            )}
          >
            {items.map((item) => (
              <React.Fragment key={item.id}>
                {item.dividerBefore && <div className="my-1.5 h-[1px] bg-slate-800" />}
                <button
                  onClick={() => {
                    if (!item.disabled) {
                      item.onClick?.();
                      setIsOpen(false);
                    }
                  }}
                  disabled={item.disabled}
                  className={cn(
                    'w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-left transition-colors',
                    item.danger
                      ? 'text-rose-400 hover:bg-rose-950/40 hover:text-rose-300'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white',
                    item.disabled && 'opacity-40 cursor-not-allowed'
                  )}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              </React.Fragment>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
