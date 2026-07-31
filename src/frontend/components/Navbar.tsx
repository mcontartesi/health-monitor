import React from 'react';
import { Activity, Plus, Bell, RefreshCw, Github, Cloud, Database, ExternalLink } from 'lucide-react';

interface NavbarProps {
  onOpenAddMonitor: () => void;
  onOpenChannels: () => void;
  onOpenSetupWizard: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAddMonitor,
  onOpenChannels,
  onOpenSetupWizard,
  onRefresh,
  isRefreshing,
}) => {
  return (
    <header className="sticky top-0 z-40 glass-panel border-b border-slate-800 px-6 py-3.5 mb-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Logo & Title */}
        <div className="flex items-center space-x-3">
          <div className="bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/30 text-emerald-400">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-white tracking-tight">Health Monitor</h1>
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Cloud className="w-3 h-3" />
                <span>Cloudflare Native</span>
              </span>
            </div>
            <p className="text-xs text-slate-400">Serverless Cron Job & Uptime Switch</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          {/* Cloudflare Deploy Button */}
          <a
            href="https://deploy.workers.cloudflare.com/?url=https://github.com/mcontartesi/health-monitor"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-orange-400 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 rounded-lg transition"
            title="Deploy to Cloudflare Workers with 1-Click"
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>Deploy to CF</span>
            <ExternalLink className="w-3 h-3 opacity-60" />
          </a>

          {/* Setup Wizard Button */}
          <button
            onClick={onOpenSetupWizard}
            className="flex items-center space-x-1.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700 rounded-lg transition"
            title="D1 Database Setup Wizard"
          >
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Setup Wizard</span>
          </button>

          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 rounded-lg border border-slate-700 transition duration-150"
            title="Refresh status"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
          </button>

          <button
            onClick={onOpenChannels}
            className="flex items-center space-x-2 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700 rounded-lg transition"
          >
            <Bell className="w-4 h-4 text-amber-400" />
            <span>Alerts</span>
          </button>

          <button
            onClick={onOpenAddMonitor}
            className="flex items-center space-x-2 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-lg shadow-emerald-900/30 transition transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>New Check</span>
          </button>

          <a
            href="https://github.com/mcontartesi/health-monitor"
            target="_blank"
            rel="noreferrer"
            className="p-2 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 rounded-lg border border-slate-700 transition"
          >
            <Github className="w-4 h-4" />
          </a>
        </div>
      </div>
    </header>
  );
};
