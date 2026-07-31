import React from 'react';
import { X, Settings, ShieldCheck, LogOut, Database, RefreshCw, Bell, ExternalLink, Key, Cpu, HelpCircle } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSetupWizard: () => void;
  onOpenChannels: () => void;
  onLogout: () => void;
  userInfo?: { authenticated: boolean; provider?: string; email?: string };
}

export function SettingsModal({
  isOpen,
  onClose,
  onOpenSetupWizard,
  onOpenChannels,
  onLogout,
  userInfo,
}: SettingsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#0f172a] border border-slate-800 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-100">
        
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-emerald-400">
              <Settings className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">System Settings & Configuration</h2>
              <p className="text-xs text-slate-400">Manage security, database setup, and alert integrations</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 flex-1 overflow-y-auto">
          
          {/* Section 1: Security & Identity */}
          <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center space-x-2 text-xs font-bold text-white">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Security & Identity</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-mono">
                {userInfo?.provider || 'Active Session'}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <div>
                <span className="text-slate-400 block text-[11px]">Authenticated Account</span>
                <span className="font-semibold text-white font-mono">{userInfo?.email || 'admin@local'}</span>
              </div>

              <button
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold rounded-lg transition active:scale-95"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Lock / Sign Out</span>
              </button>
            </div>
          </div>

          {/* Section 2: Database & System Maintenance */}
          <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center space-x-2 text-xs font-bold text-white">
                <Database className="w-4 h-4 text-blue-400" />
                <span>Cloudflare D1 Database</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20 font-mono">
                Serverless SQLite
              </span>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <div className="space-y-0.5">
                <span className="text-slate-300 font-medium block">Schema & Credential Maintenance</span>
                <span className="text-[11px] text-slate-400 block">Re-run database wizard or update admin password</span>
              </div>

              <button
                onClick={() => {
                  onClose();
                  onOpenSetupWizard();
                }}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-lg transition active:scale-95"
              >
                <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                <span>Re-run Setup</span>
              </button>
            </div>
          </div>

          {/* Section 3: Notification Channels */}
          <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center space-x-2 text-xs font-bold text-white">
                <Bell className="w-4 h-4 text-amber-400" />
                <span>Alert Integrations</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <div className="space-y-0.5">
                <span className="text-slate-300 font-medium block">Discord, Slack, Telegram & Webhooks</span>
                <span className="text-[11px] text-slate-400 block">Configure notification channels for downtime alerts</span>
              </div>

              <button
                onClick={() => {
                  onClose();
                  onOpenChannels();
                }}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-semibold rounded-lg transition active:scale-95"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Manage Alerts</span>
              </button>
            </div>
          </div>

          {/* Section 4: Project Info & Links */}
          <div className="p-4 bg-slate-900/40 border border-slate-800/80 rounded-xl text-xs space-y-2 text-slate-400">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-300">Health Monitor Engine</span>
              <span className="font-mono text-emerald-400">v1.0.0 (Cloudflare Worker)</span>
            </div>
            <p className="text-[11px]">
              Running 100% serverless on Cloudflare Edge locations. Supports dynamic SVG status badges:
            </p>
            <code className="block bg-slate-950 p-2 rounded text-[11px] font-mono text-emerald-300 select-all border border-slate-800">
              GET /badge/:slug/status.svg
            </code>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-900/80 border-t border-slate-800 flex items-center justify-between">
          <a
            href="https://github.com/mcontartesi/health-monitor"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center space-x-1 text-xs text-slate-400 hover:text-white transition"
          >
            <span>GitHub Documentation</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl transition"
          >
            Close Settings
          </button>
        </div>
      </div>
    </div>
  );
}
