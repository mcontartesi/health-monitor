import React from 'react';
import { 
  CheckCircle2, AlertTriangle, Clock, PauseCircle, Code, List, Play, Pause, Trash2, ShieldCheck, Copy
} from 'lucide-react';
import { Monitor } from '../../worker/db/types';

interface MonitorCardProps {
  monitor: Monitor;
  isHighlighted?: boolean;
  onOpenSnippets: (m: Monitor) => void;
  onOpenLogs: (m: Monitor) => void;
  onTestPing: (m: Monitor) => void;
  onTogglePause: (m: Monitor) => void;
  onDelete: (m: Monitor) => void;
}

export const MonitorCard: React.FC<MonitorCardProps> = ({
  monitor,
  isHighlighted = false,
  onOpenSnippets,
  onOpenLogs,
  onTestPing,
  onTogglePause,
  onDelete,
}) => {
  const [copied, setCopied] = React.useState(false);

  // Format interval string
  const formatInterval = (sec: number) => {
    if (sec < 60) return `${sec}s`;
    if (sec < 3600) return `${Math.round(sec / 60)}m`;
    if (sec < 86400) return `${Math.round(sec / 3600)}h`;
    return `${Math.round(sec / 86400)}d`;
  };

  const statusConfig = {
    up: {
      badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 status-pulse-up',
      dot: 'bg-emerald-400',
      label: 'UP',
      icon: CheckCircle2,
    },
    grace: {
      badge: 'bg-amber-500/15 text-amber-400 border-amber-500/30 status-pulse-grace',
      dot: 'bg-amber-400',
      label: 'GRACE',
      icon: Clock,
    },
    down: {
      badge: 'bg-rose-500/15 text-rose-400 border-rose-500/30 status-pulse-down',
      dot: 'bg-rose-500 animate-ping',
      label: 'DOWN',
      icon: AlertTriangle,
    },
    paused: {
      badge: 'bg-slate-800/80 text-slate-400 border-slate-700/80',
      dot: 'bg-slate-500',
      label: 'PAUSED',
      icon: PauseCircle,
    },
    new: {
      badge: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
      dot: 'bg-cyan-400',
      label: 'NEW',
      icon: ShieldCheck,
    },
  };

  const status = statusConfig[monitor.status] || statusConfig.new;
  const StatusIcon = status.icon;

  const pingUrl = `${window.location.origin}/ping/${monitor.slug}`;

  const copyPingUrl = () => {
    navigator.clipboard.writeText(pingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`glass-panel glass-panel-hover rounded-2xl p-5 border transition-all duration-300 group ${
        isHighlighted
          ? 'border-emerald-500/80 ring-2 ring-emerald-500/60 shadow-[0_0_30px_rgba(16,185,129,0.35)] bg-emerald-950/20 scale-[1.008]'
          : 'border-slate-800/80'
      }`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Left Info Section */}
        <div className="space-y-2 flex-1">
          <div className="flex items-center space-x-3">
            <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold tracking-wide border ${status.badge}`}>
              <span className={`w-2 h-2 rounded-full ${status.dot}`}></span>
              <StatusIcon className="w-3.5 h-3.5" />
              <span>{status.label}</span>
            </span>

            {isHighlighted && (
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-bounce shadow-md">
                <span>PING RECEIVED</span>
              </span>
            )}

            <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition duration-200 tracking-tight">
              {monitor.name}
            </h3>
          </div>

          <p className="text-xs text-slate-400 line-clamp-1 font-normal">
            {monitor.description || 'No description provided'}
          </p>

          <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-400 pt-1">
            <div className="flex items-center space-x-1 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800/80">
              <span className="text-slate-500 font-medium">Schedule:</span>
              <span className="font-mono text-slate-200 font-medium">
                {monitor.schedule_type === 'cron' ? monitor.cron_expression : `Every ${formatInterval(monitor.interval_seconds)}`}
              </span>
            </div>

            <div className="flex items-center space-x-1 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800/80">
              <span className="text-slate-500 font-medium">Grace:</span>
              <span className="font-mono text-slate-200 font-medium">{formatInterval(monitor.grace_seconds)}</span>
            </div>

            <div className="flex items-center space-x-1 text-xs">
              <span className="text-slate-500">Last Ping:</span>
              <span className="text-slate-300 font-semibold">
                {monitor.last_ping_at ? new Date(monitor.last_ping_at).toLocaleTimeString() : 'Never'}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Ping URL snippet input */}
        <div className="hidden lg:flex items-center space-x-2 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800/80 max-w-xs shadow-inner">
          <input
            type="text"
            readOnly
            value={pingUrl}
            className="bg-transparent text-xs font-mono text-emerald-400 outline-none select-all truncate w-48"
          />
          <button
            onClick={copyPingUrl}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800/80 transition duration-150 active:scale-[0.96]"
            title="Copy Ping URL"
          >
            <Copy className={`w-3.5 h-3.5 ${copied ? 'text-emerald-400' : ''}`} />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 pt-2 md:pt-0">
          <button
            onClick={() => onOpenSnippets(monitor)}
            className="flex items-center space-x-1.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/70 hover:bg-slate-800 border border-slate-700/80 rounded-xl transition duration-150 active:scale-[0.96]"
            title="Integration Code Snippets"
          >
            <Code className="w-3.5 h-3.5 text-cyan-400" />
            <span>Snippets</span>
          </button>

          <button
            onClick={() => onOpenLogs(monitor)}
            className="flex items-center space-x-1.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/70 hover:bg-slate-800 border border-slate-700/80 rounded-xl transition duration-150 active:scale-[0.96]"
            title="Audit Logs"
          >
            <List className="w-3.5 h-3.5 text-indigo-400" />
            <span>Logs</span>
          </button>

          <button
            onClick={() => onTestPing(monitor)}
            className="p-2 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-xl transition duration-150 active:scale-[0.96]"
            title="Send Manual Test Ping"
          >
            <Play className="w-3.5 h-3.5 fill-emerald-400" />
          </button>

          <button
            onClick={() => onTogglePause(monitor)}
            className="p-2 text-slate-400 hover:text-white bg-slate-800/70 hover:bg-slate-800 border border-slate-700/80 rounded-xl transition duration-150 active:scale-[0.96]"
            title={monitor.status === 'paused' ? 'Resume Monitor' : 'Pause Monitor'}
          >
            {monitor.status === 'paused' ? <Play className="w-3.5 h-3.5 text-amber-400" /> : <Pause className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => onDelete(monitor)}
            className="p-2 text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-xl transition duration-150 active:scale-[0.96]"
            title="Delete Check"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
