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

        let badgeBg = 'bg-slate-800/80 text-slate-400 border-slate-700/80';
        let activeStyle = 'border-slate-800 hover:border-slate-700';

        if (card.color === 'emerald') {
          badgeBg = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 shadow-sm shadow-emerald-500/10';
          if (isActive) activeStyle = 'border-emerald-500/80 ring-2 ring-emerald-500/25 bg-emerald-950/20';
        } else if (card.color === 'amber') {
          badgeBg = 'bg-amber-500/15 text-amber-400 border-amber-500/30 shadow-sm shadow-amber-500/10';
          if (isActive) activeStyle = 'border-amber-500/80 ring-2 ring-amber-500/25 bg-amber-950/20';
        } else if (card.color === 'rose') {
          badgeBg = 'bg-rose-500/15 text-rose-400 border-rose-500/30 shadow-sm shadow-rose-500/10';
          if (isActive) activeStyle = 'border-rose-500/80 ring-2 ring-rose-500/25 bg-rose-950/20';
        } else if (isActive) {
          activeStyle = 'border-slate-500 ring-2 ring-slate-500/25 bg-slate-800/30';
        }

        return (
          <button
            key={card.id}
            onClick={() => onFilterChange(card.id)}
            className={`glass-panel p-4 rounded-2xl border text-left transition duration-200 active:scale-[0.96] cursor-pointer ${activeStyle}`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {card.label}
              </span>
              <div className={`p-2 rounded-xl border ${badgeBg}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-white tracking-tight">{card.count}</div>
          </button>
        );
      })}
    </div>
  );
};
