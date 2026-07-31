import React from 'react';
import { Activity, Plus, Bell, RefreshCw, Cloud, Settings, ExternalLink, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  onOpenAddMonitor: () => void;
  onOpenChannels: () => void;
  onOpenSettings: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  userInfo?: { authenticated: boolean; email?: string };
}

const GithubIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAddMonitor,
  onOpenChannels,
  onOpenSettings,
  onRefresh,
  isRefreshing,
  userInfo,
}) => {
  return (
    <header className="sticky top-0 z-40 glass-panel border-b border-slate-800/80 px-6 py-3.5 mb-8 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Logo & Title */}
        <div className="flex items-center space-x-3.5">
          <div className="bg-emerald-500/10 p-2.5 rounded-2xl border border-emerald-500/30 text-emerald-400 shadow-lg shadow-emerald-500/10">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2.5">
              <h1 className="text-xl font-bold text-white tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">Health Monitor</h1>
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-sm">
                <Cloud className="w-3 h-3" />
                <span>Cloudflare Native</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 font-normal">Serverless Cron Job & Uptime Switch</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          {/* Cloudflare Access Identity Badge */}
          {userInfo?.authenticated && userInfo.email ? (
            <div className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="max-w-[150px] truncate">{userInfo.email}</span>
            </div>
          ) : null}

          {/* Cloudflare Deploy Button */}
          <a
            href="https://deploy.workers.cloudflare.com/?url=https://github.com/mcontartesi/health-monitor"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold text-orange-400 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 rounded-xl transition duration-150 active:scale-[0.96]"
            title="Deploy to Cloudflare Workers with 1-Click"
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>Deploy to CF</span>
            <ExternalLink className="w-3 h-3 opacity-60" />
          </a>

          {/* Settings Menu Button */}
          <button
            onClick={onOpenSettings}
            className="flex items-center space-x-1.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/70 hover:bg-slate-800 border border-slate-700/80 rounded-xl transition duration-150 active:scale-[0.96]"
            title="Application Settings"
          >
            <Settings className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Settings</span>
          </button>

          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 text-slate-400 hover:text-white bg-slate-800/70 hover:bg-slate-800 rounded-xl border border-slate-700/80 transition duration-150 active:scale-[0.96]"
            title="Refresh status"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
          </button>

          <button
            onClick={onOpenChannels}
            className="flex items-center space-x-2 px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/70 hover:bg-slate-800 border border-slate-700/80 rounded-xl transition duration-150 active:scale-[0.96]"
          >
            <Bell className="w-4 h-4 text-amber-400" />
            <span>Alerts</span>
          </button>

          <button
            onClick={onOpenAddMonitor}
            className="flex items-center space-x-2 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-lg shadow-emerald-900/40 border border-emerald-400/30 transition duration-150 active:scale-[0.96]"
          >
            <Plus className="w-4 h-4" />
            <span>New Check</span>
          </button>

          <a
            href="https://github.com/mcontartesi/health-monitor"
            target="_blank"
            rel="noreferrer"
            className="p-2 text-slate-400 hover:text-white bg-slate-800/70 hover:bg-slate-800 rounded-xl border border-slate-700/80 transition duration-150 active:scale-[0.96]"
          >
            <GithubIcon className="w-4 h-4" />
          </a>
        </div>
      </div>
    </header>
  );
};
