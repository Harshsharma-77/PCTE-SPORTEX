import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface BreadcrumbsProps {
  customItems?: Array<{ label: string; path?: string }>;
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ customItems, className }) => {
  const location = useLocation();

  const getBreadcrumbItems = () => {
    if (customItems) return customItems;

    const pathSegments = location.pathname.split('/').filter(Boolean);
    return pathSegments.map((segment, idx) => {
      const path = `/${pathSegments.slice(0, idx + 1).join('/')}`;
      const label = segment
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      return { label, path: idx === pathSegments.length - 1 ? undefined : path };
    });
  };

  const items = getBreadcrumbItems();

  return (
    <nav className={cn('flex items-center gap-1.5 text-xs text-slate-400 font-medium py-1', className)} aria-label="Breadcrumb">
      <Link to="/" className="hover:text-white transition-colors flex items-center gap-1">
        <Home className="w-3.5 h-3.5 text-slate-500 hover:text-slate-300" />
      </Link>

      {items.map((item, idx) => (
        <React.Fragment key={idx}>
          <ChevronRight className="w-3 h-3 text-slate-600 flex-shrink-0" />
          {item.path ? (
            <Link to={item.path} className="hover:text-slate-200 transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-sportex-400 font-semibold">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};
