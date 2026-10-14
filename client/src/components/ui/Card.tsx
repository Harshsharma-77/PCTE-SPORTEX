import React from 'react';
import { cn } from '../../utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'glow' | 'interactive';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const variants = {
      default: 'bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-lg',
      glass: 'bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 shadow-xl',
      glow: 'bg-slate-900/80 backdrop-blur-md border border-sportex-500/30 rounded-2xl p-6 shadow-[0_0_25px_-5px_rgba(14,141,231,0.2)]',
      interactive:
        'bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-lg hover:border-sportex-500/50 hover:shadow-2xl hover:shadow-sportex-500/10 transition-all duration-300 cursor-pointer',
    };

    return (
      <div ref={ref} className={cn(variants[variant], className)} {...props}>
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
