import React, { useEffect, useState } from 'react';
import { X, List, RefreshCw, AlertCircle, CheckCircle2, Play } from 'lucide-react';
import { Monitor, PingLog } from '../../worker/db/types';

interface PingLogsModalProps {
  monitor: Monitor | null;
  onClose: () => void;
}

export const PingLogsModal: React.FC<PingLogsModalProps> = ({ monitor, onClose }) => {
  const [logs, setLogs] = useState<PingLog[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (monitor) {
      fetchLogs();
    }
  }, [monitor]);

  const fetchLogs = async () => {
    if (!monitor) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/monitors/${monitor.id}/logs`);
      const data = await res.json();
      setLogs(data.logs || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!monitor) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="glass-modal w-full max-w-3xl rounded-2xl p-6 border border-slate-700 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-shrink-0">
          <div className="flex items-center space-x-2">
            <List className="w-5 h-5 text-indigo-400" />
            <div>
              <h2 className="text-lg font-bold text-white">Ping Audit Logs</h2>
              <p className="text-xs text-slate-400">
                History for check <span className="text-emerald-400 font-bold">{monitor.name}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={fetchLogs}
              className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg border border-slate-700"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Logs Table */}
        <div className="overflow-y-auto flex-1 border border-slate-800 rounded-xl bg-slate-950/60">
          {logs.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              No ping logs recorded yet for this monitor.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Source IP</th>
                  <th className="py-2.5 px-3">Duration</th>
                  <th className="py-2.5 px-3">User Agent / Snippet</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300 font-mono">
                {logs.map((log) => {
                  let badge = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
                  let Icon = CheckCircle2;
                  if (log.status === 'fail') {
                    badge = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
                    Icon = AlertCircle;
                  } else if (log.status === 'start') {
                    badge = 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
                    Icon = Play;
                  }

                  return (
                    <tr key={log.id} className="hover:bg-slate-900/40">
                      <td className="py-2 px-3">
                        <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-bold border ${badge}`}>
                          <Icon className="w-3 h-3" />
                          <span>{log.status.toUpperCase()}</span>
                        </span>
                      </td>
                      <td className="py-2 px-3 text-slate-400 whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="py-2 px-3 text-cyan-400">{log.remote_addr || 'N/A'}</td>
                      <td className="py-2 px-3 text-amber-400">
                        {log.duration_ms ? `${log.duration_ms}ms` : '-'}
                      </td>
                      <td className="py-2 px-3 max-w-xs truncate text-slate-400" title={log.body_snippet || log.user_agent || ''}>
                        {log.body_snippet || log.user_agent || '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
