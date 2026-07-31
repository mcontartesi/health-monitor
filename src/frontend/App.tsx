import React, { useEffect, useState } from 'react';
import { Navbar } from './components/Navbar';
import { StatsOverview } from './components/StatsOverview';
import { MonitorCard } from './components/MonitorCard';
import { MonitorModal } from './components/MonitorModal';
import { SnippetGeneratorModal } from './components/SnippetGeneratorModal';
import { PingLogsModal } from './components/PingLogsModal';
import { ChannelsModal } from './components/ChannelsModal';
import { SetupWizardModal } from './components/SetupWizardModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { SettingsModal } from './components/SettingsModal';
import { Footer } from './components/Footer';
import { Search, ShieldAlert, Plus, RefreshCw, Cpu, Database, Lock } from 'lucide-react';
import { Monitor } from '../worker/db/types';

export default function App() {
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [stats, setStats] = useState({ total: 0, up: 0, grace: 0, down: 0, paused: 0 });
  const [projectId, setProjectId] = useState('proj_default');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [needSetup, setNeedSetup] = useState(false);
  const [userInfo, setUserInfo] = useState<{ authenticated: boolean; email?: string; provider?: string }>({ authenticated: false });

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isChannelsModalOpen, setIsChannelsModalOpen] = useState(false);
  const [isSetupWizardOpen, setIsSetupWizardOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [selectedSnippetMonitor, setSelectedSnippetMonitor] = useState<Monitor | null>(null);
  const [selectedLogsMonitor, setSelectedLogsMonitor] = useState<Monitor | null>(null);

  useEffect(() => {
    fetchMonitors();
    fetchUserInfo();
    // Auto-refresh every 30s
    const timer = setInterval(() => fetchMonitors(true), 30000);
    return () => clearInterval(timer);
  }, [projectId]);

  const authFetch = async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('health_monitor_token');
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string> || {}),
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(url, { ...options, headers });
    if (res.status === 401) {
      const cloned = res.clone();
      const data = await cloned.json().catch(() => ({}));
      if (data.needSetup) {
        setNeedSetup(true);
        setIsSetupWizardOpen(true);
        setIsAdminLoginOpen(false);
      } else {
        setIsAdminLoginOpen(true);
      }
    }
    return res;
  };

  const fetchUserInfo = async () => {
    try {
      const res = await authFetch('/api/user');
      const data = await res.json();
      if (data.authenticated) {
        setUserInfo(data);
      }
    } catch (err) {
      console.log('Zero Trust Auth check:', err);
    }
  };

  const fetchMonitors = async (silent = false) => {
    if (!silent) setIsLoading(true);
    setIsRefreshing(true);
    try {
      const res = await authFetch(`/api/monitors?project_id=${projectId}`);
      const data = await res.json();

      if (data.needSetup) {
        setNeedSetup(true);
        setIsSetupWizardOpen(true);
      } else {
        setNeedSetup(false);
      }

      setMonitors(data.monitors || []);
      setStats(data.stats || { total: 0, up: 0, grace: 0, down: 0, paused: 0 });
    } catch (err) {
      console.error('Failed to fetch monitors', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleCreateMonitor = async (data: any) => {
    await authFetch('/api/monitors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    fetchMonitors();
  };

  const handleTestPing = async (m: Monitor) => {
    await authFetch(`/api/monitors/${m.id}/ping`, { method: 'POST' });
    fetchMonitors(true);
  };

  const handleTogglePause = async (m: Monitor) => {
    await authFetch(`/api/monitors/${m.id}/pause`, { method: 'POST' });
    fetchMonitors(true);
  };

  const handleDeleteMonitor = async (m: Monitor) => {
    if (!confirm(`Are you sure you want to delete check "${m.name}"?`)) return;
    await authFetch(`/api/monitors/${m.id}`, { method: 'DELETE' });
    fetchMonitors();
  };

  const handleLogout = () => {
    localStorage.removeItem('health_monitor_token');
    setUserInfo({ authenticated: false });
    setIsAdminLoginOpen(true);
  };

  // Filter monitors based on search and status tabs
  const filteredMonitors = monitors.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.slug.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (statusFilter === 'all') return matchesSearch;
    return matchesSearch && m.status === statusFilter;
  });

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 flex flex-col">
      {/* Navbar */}
      <Navbar
        onOpenAddMonitor={() => setIsAddModalOpen(true)}
        onOpenChannels={() => setIsChannelsModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onRefresh={() => fetchMonitors()}
        isRefreshing={isRefreshing}
        userInfo={userInfo}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-6 flex-1 w-full pb-16">
        
        {/* Top Stats Overview */}
        <StatsOverview
          stats={stats}
          activeFilter={statusFilter}
          onFilterChange={(f) => setStatusFilter(f)}
        />

        {/* Search & Action Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search checks by name or slug..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-800/80 rounded-2xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500/80 focus:ring-2 focus:ring-emerald-500/20 outline-none transition duration-150"
            />
          </div>

          <div className="flex items-center space-x-2 text-xs text-slate-400 bg-slate-900/50 px-3 py-1.5 rounded-xl border border-slate-800/60">
            <Cpu className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>Evaluating health every 60s via Cloudflare Cron Trigger</span>
          </div>
        </div>

        {/* Monitors List */}
        {isLoading ? (
          <div className="p-12 text-center text-slate-500 glass-panel rounded-2xl">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-400" />
            <span>Loading health checks...</span>
          </div>
        ) : filteredMonitors.length === 0 ? (
          <div className="glass-panel p-12 rounded-2xl text-center space-y-4 border border-slate-800/80 shadow-xl">
            <ShieldAlert className="w-12 h-12 text-slate-600 mx-auto" />
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                {needSetup ? 'D1 Database Not Initialized' : 'No Health Checks Found'}
              </h3>
              <p className="text-xs text-slate-400">
                {needSetup
                  ? 'Click below to initialize your Cloudflare D1 database tables.'
                  : searchQuery
                  ? 'No checks match your search criteria.'
                  : 'Get started by creating your first heartbeat monitor!'}
              </p>
            </div>
            {needSetup ? (
              <button
                onClick={() => setIsSetupWizardOpen(true)}
                className="inline-flex items-center space-x-2 px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-lg shadow-emerald-950/50 transition duration-150 active:scale-[0.96]"
              >
                <Database className="w-4 h-4" />
                <span>Launch Setup Wizard</span>
              </button>
            ) : (
              !searchQuery && (
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="inline-flex items-center space-x-2 px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-lg shadow-emerald-950/50 transition duration-150 active:scale-[0.96]"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Check Now</span>
                </button>
              )
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredMonitors.map((monitor) => (
              <MonitorCard
                key={monitor.id}
                monitor={monitor}
                onOpenSnippets={(m) => setSelectedSnippetMonitor(m)}
                onOpenLogs={(m) => setSelectedLogsMonitor(m)}
                onTestPing={handleTestPing}
                onTogglePause={handleTogglePause}
                onDelete={handleDeleteMonitor}
              />
            ))}
          </div>
        )}

      </main>

      {/* Footer */}
      <Footer />

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onOpenSetupWizard={() => setIsSetupWizardOpen(true)}
        onOpenChannels={() => setIsChannelsModalOpen(true)}
        onLogout={handleLogout}
        userInfo={userInfo}
      />

      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onSuccess={() => {
          setIsAdminLoginOpen(false);
          fetchMonitors();
          fetchUserInfo();
        }}
      />

      <SetupWizardModal
        isOpen={isSetupWizardOpen}
        onClose={() => setIsSetupWizardOpen(false)}
        onSuccess={() => fetchMonitors()}
      />

      <MonitorModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleCreateMonitor}
        projectId={projectId}
      />

      <SnippetGeneratorModal
        monitor={selectedSnippetMonitor}
        onClose={() => setSelectedSnippetMonitor(null)}
      />

      <PingLogsModal
        monitor={selectedLogsMonitor}
        onClose={() => setSelectedLogsMonitor(null)}
      />

      <ChannelsModal
        isOpen={isChannelsModalOpen}
        onClose={() => setIsChannelsModalOpen(false)}
        projectId={projectId}
      />
    </div>
  );
}
