import React, { useState, useRef, useEffect } from 'react';
import { Activity, Plus, Bell, RefreshCw, Cloud, Settings, ExternalLink, ShieldCheck, User, LogOut, ChevronDown } from 'lucide-react';

import { WebSocketStatus } from '../hooks/useWebSocket';

interface NavbarProps {
  onOpenAddMonitor: () => void;
  onOpenChannels: () => void;
  onOpenSettings: () => void;
  onRefresh: () => void;
  onLogout: () => void;
  isRefreshing: boolean;
  userInfo?: { authenticated: boolean; email?: string; provider?: string };
  wsStatus?: WebSocketStatus;
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
  onLogout,
  isRefreshing,
  userInfo,
  wsStatus = 'disconnected',
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const userEmail = userInfo?.email || 'admin@local';

  return (
    <header className="sticky top-0 z-40 glass-panel border-b border-slate-800/80 px-6 py-3.5 mb-8 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Brand & Logo */}
        <div className="flex items-center space-x-3.5">
          <div className="bg-emerald-500/10 p-2.5 rounded-2xl border border-emerald-500/30 text-emerald-400 shadow-lg shadow-emerald-500/10">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2.5">
              <h1 className="text-lg font-bold text-white tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                Health Monitor
              </h1>

              {/* Real-time Connection Status Badge */}
              <span
                className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border shadow-sm transition duration-300 ${
                  wsStatus === 'connected'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : wsStatus === 'connecting'
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse'
                    : 'bg-slate-800/80 text-slate-400 border-slate-700/60'
                }`}
                title={`Real-time WebSocket: ${wsStatus}`}
              >
                <span className="relative flex h-2 w-2">
                  {wsStatus === 'connected' && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  )}
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${
                    wsStatus === 'connected'
                      ? 'bg-emerald-400'
                      : wsStatus === 'connecting'
                      ? 'bg-amber-400'
                      : 'bg-slate-500'
                  }`} />
                </span>
                <span className="font-semibold">
                  {wsStatus === 'connected' ? 'Connected' : wsStatus === 'connecting' ? 'Connecting...' : 'Offline'}
                </span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-normal hidden sm:block">Serverless Cron Job & Uptime Switch</p>
          </div>
        </div>

        {/* Essential Action Bar */}
        <div className="flex items-center space-x-2.5">
          
          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-xl border border-slate-700/70 transition duration-150 active:scale-[0.96]"
            title="Refresh monitor status"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
          </button>

          {/* Alerts Button */}
          <button
            onClick={onOpenChannels}
            className="flex items-center space-x-1.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700/70 rounded-xl transition duration-150 active:scale-[0.96]"
            title="Manage alert notification channels"
          >
            <Bell className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Alerts</span>
          </button>

          {/* Primary Action: New Check */}
          <button
            onClick={onOpenAddMonitor}
            className="flex items-center space-x-2 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-lg shadow-emerald-900/40 border border-emerald-400/30 transition duration-150 active:scale-[0.96]"
          >
            <Plus className="w-4 h-4" />
            <span>New Check</span>
          </button>

          {/* User Profile & Action Dropdown Menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center space-x-2 pl-2.5 pr-2 py-1.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-xl transition duration-150 active:scale-[0.96] text-xs"
            >
              <div className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold font-mono text-[11px]">
                {userEmail.charAt(0).toUpperCase()}
              </div>
              <span className="max-w-[100px] truncate text-slate-200 font-medium hidden md:inline">
                {userEmail}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Card */}
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-[#0f172a] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden py-1 z-50 text-xs animate-fade-in">
                
                {/* Account Details Header */}
                <div className="px-3.5 py-2.5 border-b border-slate-800 bg-slate-900/60">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Signed in as</span>
                  <span className="font-semibold text-white font-mono truncate block mt-0.5">{userEmail}</span>
                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 mt-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>{userInfo?.provider || 'Admin Authenticated'}</span>
                  </span>
                </div>

                {/* Menu Items */}
                <div className="py-1">
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onOpenSettings();
                    }}
                    className="w-full px-3.5 py-2 text-left text-slate-300 hover:text-white hover:bg-slate-800/80 flex items-center space-x-2 transition"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    <span>Settings & Maintenance</span>
                  </button>

                  <a
                    href="https://deploy.workers.cloudflare.com/?url=https://github.com/mcontartesi/health-monitor"
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full px-3.5 py-2 text-left text-slate-300 hover:text-white hover:bg-slate-800/80 flex items-center justify-between transition"
                  >
                    <div className="flex items-center space-x-2">
                      <Cloud className="w-4 h-4 text-orange-400" />
                      <span>Deploy to Cloudflare</span>
                    </div>
                    <ExternalLink className="w-3 h-3 text-slate-500" />
                  </a>

                  <a
                    href="https://github.com/mcontartesi/health-monitor"
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full px-3.5 py-2 text-left text-slate-300 hover:text-white hover:bg-slate-800/80 flex items-center justify-between transition"
                  >
                    <div className="flex items-center space-x-2">
                      <GithubIcon className="w-4 h-4 text-slate-400" />
                      <span>GitHub Repository</span>
                    </div>
                    <ExternalLink className="w-3 h-3 text-slate-500" />
                  </a>
                </div>

                {/* Sign Out Action */}
                <div className="pt-1 border-t border-slate-800/80">
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full px-3.5 py-2 text-left text-rose-400 hover:bg-rose-500/10 flex items-center space-x-2 transition font-semibold"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out / Lock</span>
                  </button>
                </div>

              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
