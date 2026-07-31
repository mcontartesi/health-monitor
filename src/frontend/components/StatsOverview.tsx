import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, PauseCircle, Layers } from 'lucide-react';

interface StatsOverviewProps {
  stats: {
    total: number;
    up: number;
    grace: number;
    down: number;
    paused: number;
  };
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  stats,
  activeFilter,
  onFilterChange,
}) => {
  const cards = [
    { id: 'all', label: 'Total Checks', count: stats.total, icon: Layers, color: 'slate' },
    { id: 'up', label: 'Passing (UP)', count: stats.up, icon: CheckCircle2, color: 'emerald' },
    { id: 'grace', label: 'Grace Period', count: stats.grace, icon: Clock, color: 'amber' },
    { id: 'down', label: 'Failing (DOWN)', count: stats.down, icon: AlertTriangle, color: 'rose' },
    { id: 'paused', label: 'Paused', count: stats.paused, icon: PauseCircle, color: 'slate' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
      {cards.map((card) => {
        const Icon = card.icon;
        const isActive = activeFilter === card.id;

        let badgeBg = 'bg-slate-800 text-slate-400 border-slate-700';
        let activeBorder = 'border-slate-700';

        if (card.color === 'emerald') {
          badgeBg = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
          if (isActive) activeBorder = 'border-emerald-500 ring-2 ring-emerald-500/20';
        } else if (card.color === 'amber') {
          badgeBg = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
          if (isActive) activeBorder = 'border-amber-500 ring-2 ring-amber-500/20';
        } else if (card.color === 'rose') {
          badgeBg = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
          if (isActive) activeBorder = 'border-rose-500 ring-2 ring-rose-500/20';
        } else if (isActive) {
          activeBorder = 'border-slate-500 ring-2 ring-slate-500/20';
        }

        return (
          <button
            key={card.id}
            onClick={() => onFilterChange(card.id)}
            className={`glass-panel p-4 rounded-xl border text-left transition hover:border-slate-600 ${activeBorder}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {card.label}
              </span>
              <div className={`p-1.5 rounded-lg border ${badgeBg}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-white">{card.count}</div>
          </button>
        );
      })}
    </div>
  );
};
