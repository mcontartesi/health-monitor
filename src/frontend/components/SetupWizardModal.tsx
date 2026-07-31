import React, { useState } from 'react';
import { X, Database, CheckCircle2, Sparkles, AlertTriangle, Layers, Server, ArrowRight, RefreshCw, ShieldCheck } from 'lucide-react';

interface SetupWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function SetupWizardModal({ isOpen, onClose, onSuccess }: SetupWizardModalProps) {
  const [withSampleData, setWithSampleData] = useState(true);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  if (!isOpen) return null;

  const handleInitDatabase = async () => {
    setIsInitializing(true);
    setError(null);

    try {
      const res = await fetch('/api/setup/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ withSampleData }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to execute D1 schema initialization');
      }

      setIsComplete(true);
      setTimeout(() => {
        setIsComplete(false);
        onSuccess();
        onClose();
      }, 1800);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during setup');
    } finally {
      setIsInitializing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#0f172a] border border-slate-800 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-100">
        
        {/* Header Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
              <Database className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                First-Time Setup Wizard
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Cloudflare D1
                </span>
              </h2>
              <p className="text-xs text-slate-400">Initialize serverless database tables & default workspace</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          {isComplete ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto text-emerald-400 animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">Database Setup Complete!</h3>
                <p className="text-xs text-slate-400">All 6 relational tables and performance indexes have been created.</p>
              </div>
            </div>
          ) : (
            <>
              {/* Alert notice */}
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-200 text-xs flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block text-amber-300">Uninitialized Database Detected</span>
                  Your Cloudflare D1 instance has not yet executed the relational SQL schema. Run this setup wizard to start monitoring!
                </div>
              </div>

              {/* Table details grid */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  What will be created:
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center space-x-2">
                    <Layers className="w-4 h-4 text-emerald-400" />
                    <span><strong className="text-white">monitors</strong> (Cron Heartbeats)</span>
                  </div>
                  <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center space-x-2">
                    <Server className="w-4 h-4 text-blue-400" />
                    <span><strong className="text-white">ping_logs</strong> (Execution Audit)</span>
                  </div>
                  <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-purple-400" />
                    <span><strong className="text-white">channels</strong> (Alert Integrations)</span>
                  </div>
                  <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center space-x-2">
                    <Database className="w-4 h-4 text-amber-400" />
                    <span><strong className="text-white">projects & api_keys</strong></span>
                  </div>
                </div>
              </div>

              {/* Options */}
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    <div>
                      <span className="text-xs font-bold text-white block">Seed Demo Health Checks</span>
                      <span className="text-[11px] text-slate-400">Includes sample monitors (db-backup, analytics-sync, ssl-checker)</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={withSampleData}
                    onChange={(e) => setWithSampleData(e.target.checked)}
                    className="w-4 h-4 accent-emerald-500 rounded border-slate-700 bg-slate-800 cursor-pointer"
                  />
                </label>
              </div>

              {error && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs rounded-xl">
                  {error}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        {!isComplete && (
          <div className="px-6 py-4 bg-slate-900/80 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={onClose}
              disabled={isInitializing}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition"
            >
              Cancel / Dismiss
            </button>

            <button
              onClick={handleInitDatabase}
              disabled={isInitializing}
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-950/50 transition disabled:opacity-50"
            >
              {isInitializing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Executing D1 SQL Schema...</span>
                </>
              ) : (
                <>
                  <span>Create Tables & Initialize</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
