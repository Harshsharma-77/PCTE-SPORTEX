import React from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { LucideIcon, Sparkles, Layers, ShieldCheck } from 'lucide-react';

export interface ModuleShellProps {
  title: string;
  subtitle: string;
  category: string;
  targetPhase: string;
  icon: LucideIcon;
  features: string[];
  stats?: Array<{ label: string; value: string | number }>;
}

export const ModuleShellPage: React.FC<ModuleShellProps> = ({
  title,
  subtitle,
  category,
  targetPhase,
  icon: Icon,
  features,
  stats = [
    { label: 'Module State', value: 'Phase Ready' },
    { label: 'Access Tier', value: 'RBAC Guarded' },
    { label: 'Data Model', value: 'PostgreSQL 3NF' },
  ],
}) => {
  return (
    <div>
      <PageHeader
        title={title}
        subtitle={subtitle}
        badge={
          <Badge variant="info" size="sm">
            {targetPhase}
          </Badge>
        }
        actions={
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Sparkles className="w-3.5 h-3.5 text-sportex-400" />}
          >
            {category}
          </Button>
        }
      />

      {/* Metric Counters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map((st, idx) => (
          <Card key={idx} variant="glass" className="p-4 sm:p-5">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{st.label}</p>
            <p className="text-xl font-bold text-white font-display mt-1">{st.value}</p>
          </Card>
        ))}
      </div>

      {/* Main Feature Spec Preview Card */}
      <Card variant="default" className="p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sportex-600 to-cyan-400 p-0.5 shadow-lg">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-sportex-400">
              <Icon className="w-6 h-6" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{title} Architecture & Capabilities</h3>
            <p className="text-xs text-slate-400">Scheduled for full interactive delivery in {targetPhase}</p>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Core Functional Specifications:
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {features.map((feat, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 font-medium"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>{feat}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950 border border-sportex-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <Layers className="w-4 h-4 text-sportex-400" />
            <span>UI/UX layout and routing verified for this module.</span>
          </div>
          <Badge variant="success" size="sm">
            Layout Verified
          </Badge>
        </div>
      </Card>
    </div>
  );
};
