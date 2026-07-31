import React, { useState } from 'react';
import { X, Clock, Calendar, ShieldAlert } from 'lucide-react';

interface MonitorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  projectId: string;
}

export const MonitorModal: React.FC<MonitorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  projectId,
}) => {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [scheduleType, setScheduleType] = useState<'simple' | 'cron'>('simple');
  const [intervalSeconds, setIntervalSeconds] = useState(3600); // default 1 hour
  const [cronExpression, setCronExpression] = useState('0 * * * *');
  const [graceSeconds, setGraceSeconds] = useState(900); // default 15 mins
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await onSave({
        project_id: projectId,
        name,
        slug: slug.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        description,
        schedule_type: scheduleType,
        interval_seconds: intervalSeconds,
        cron_expression: scheduleType === 'cron' ? cronExpression : undefined,
        grace_seconds: graceSeconds,
      });
      onClose();
    } catch (err) {
      alert('Failed to save monitor');
    } finally {
      setIsSubmitting(false);
    }
  };

  const intervalPresets = [
    { label: '5 Minutes', val: 300 },
    { label: '15 Minutes', val: 900 },
    { label: '1 Hour', val: 3600 },
    { label: '6 Hours', val: 21600 },
    { label: '12 Hours', val: 43200 },
    { label: '1 Day', val: 86400 },
    { label: '7 Days', val: 604800 },
  ];

  const gracePresets = [
    { label: '5 min', val: 300 },
    { label: '15 min', val: 900 },
    { label: '30 min', val: 1800 },
    { label: '1 hour', val: 3600 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="glass-modal w-full max-w-lg rounded-2xl p-6 border border-slate-700 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white">Create New Health Check</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Check Name</label>
            <input
              type="text"
              required
              placeholder="e.g., Nightly Database Backup"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-white focus:border-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Slug / Unique ID (Optional)</label>
            <input
              type="text"
              placeholder="db-backup (auto-generated if empty)"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2 text-sm font-mono text-emerald-400 focus:border-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Description</label>
            <input
              type="text"
              placeholder="Brief summary of what this job monitors"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-300 focus:border-emerald-500 outline-none"
            />
          </div>

          {/* Schedule Switcher */}
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">Schedule Type</label>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                type="button"
                onClick={() => setScheduleType('simple')}
                className={`py-2 px-3 text-xs font-semibold rounded-lg border flex items-center justify-center space-x-2 ${
                  scheduleType === 'simple'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500'
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Simple Interval</span>
              </button>
              <button
                type="button"
                onClick={() => setScheduleType('cron')}
                className={`py-2 px-3 text-xs font-semibold rounded-lg border flex items-center justify-center space-x-2 ${
                  scheduleType === 'cron'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500'
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Cron Expression</span>
              </button>
            </div>

            {scheduleType === 'simple' ? (
              <div className="grid grid-cols-3 gap-2">
                {intervalPresets.map((p) => (
                  <button
                    key={p.val}
                    type="button"
                    onClick={() => setIntervalSeconds(p.val)}
                    className={`py-1.5 px-2 text-xs rounded-lg border text-center transition ${
                      intervalSeconds === p.val
                        ? 'bg-emerald-500 text-white font-bold border-emerald-400'
                        : 'bg-slate-900/60 text-slate-300 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            ) : (
              <div>
                <input
                  type="text"
                  placeholder="0 * * * *"
                  value={cronExpression}
                  onChange={(e) => setCronExpression(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2 text-sm font-mono text-cyan-400 outline-none"
                />
                <p className="text-[11px] text-slate-500 mt-1">Standard 5-field cron syntax (e.g. 0 3 * * * = daily at 3am)</p>
              </div>
            )}
          </div>

          {/* Grace Period */}
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Grace Period</span>
              <span className="text-[11px] text-slate-400 normal-case">Extra leeway before marking DOWN</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {gracePresets.map((g) => (
                <button
                  key={g.val}
                  type="button"
                  onClick={() => setGraceSeconds(g.val)}
                  className={`py-1.5 px-2 text-xs rounded-lg border text-center transition ${
                    graceSeconds === g.val
                      ? 'bg-amber-500 text-white font-bold border-amber-400'
                      : 'bg-slate-900/60 text-slate-300 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white bg-slate-800/50 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-lg shadow-emerald-900/30 transition"
            >
              {isSubmitting ? 'Saving...' : 'Create Check'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
