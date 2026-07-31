import React, { useEffect, useState } from 'react';
import { X, Bell, Plus, Trash2, Send, CheckCircle2 } from 'lucide-react';
import { Channel } from '../../worker/db/types';

interface ChannelsModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
}

export const ChannelsModal: React.FC<ChannelsModalProps> = ({ isOpen, onClose, projectId }) => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [name, setName] = useState('');
  const [type, setType] = useState<'discord' | 'slack' | 'telegram' | 'webhook'>('discord');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [botToken, setBotToken] = useState('');
  const [chatId, setChatId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) fetchChannels();
  }, [isOpen]);

  const fetchChannels = async () => {
    try {
      const res = await fetch(`/api/channels?project_id=${projectId}`);
      const data = await res.json();
      setChannels(data.channels || []);
    } catch (e) {
      console.error(e);
    }
  };

  if (!isOpen) return null;

  const handleAddChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    let config: any = {};
    if (type === 'discord' || type === 'slack' || type === 'webhook') {
      config.webhook_url = webhookUrl;
      config.url = webhookUrl;
    } else if (type === 'telegram') {
      config.bot_token = botToken;
      config.chat_id = chatId;
    }

    setIsSubmitting(true);
    try {
      await fetch('/api/channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projectId,
          name,
          type,
          config_json: JSON.stringify(config),
        }),
      });
      setName('');
      setWebhookUrl('');
      setBotToken('');
      setChatId('');
      fetchChannels();
    } catch (e) {
      alert('Failed to add channel');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteChannel = async (id: string) => {
    if (!confirm('Are you sure you want to delete this notification channel?')) return;
    await fetch(`/api/channels/${id}`, { method: 'DELETE' });
    fetchChannels();
  };

  const handleTestChannel = async (id: string) => {
    try {
      const res = await fetch(`/api/channels/${id}/test`, { method: 'POST' });
      const data = await res.json();
      alert(data.message || 'Test notification sent!');
    } catch (e) {
      alert('Failed to send test alert');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="glass-modal w-full max-w-2xl rounded-2xl p-6 border border-slate-700 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white">Alert Notification Integrations</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Existing Channels List */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Active Alert Channels</h3>
          {channels.length === 0 ? (
            <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 text-center text-slate-500 text-xs">
              No alert channels configured. Add Discord, Slack, Telegram or Webhook below!
            </div>
          ) : (
            channels.map((ch) => (
              <div key={ch.id} className="flex items-center justify-between p-3.5 bg-slate-900/80 rounded-xl border border-slate-800">
                <div className="flex items-center space-x-3">
                  <span className="px-2 py-0.5 text-[11px] font-bold uppercase rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                    {ch.type}
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-white">{ch.name}</h4>
                    <p className="text-[11px] text-slate-400 font-mono truncate max-w-xs">{ch.config_json}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleTestChannel(ch.id)}
                    className="flex items-center space-x-1 px-2.5 py-1 text-xs font-medium text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-md"
                  >
                    <Send className="w-3 h-3" />
                    <span>Test</span>
                  </button>
                  <button
                    onClick={() => handleDeleteChannel(ch.id)}
                    className="p-1 text-rose-400 hover:text-rose-300 rounded hover:bg-rose-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add Channel Form */}
        <form onSubmit={handleAddChannel} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>Add New Integration Channel</span>
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Channel Name</label>
              <input
                type="text"
                required
                placeholder="e.g. #ops-alerts Discord"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Channel Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white outline-none"
              >
                <option value="discord">Discord Webhook</option>
                <option value="slack">Slack Webhook</option>
                <option value="telegram">Telegram Bot</option>
                <option value="webhook">Generic HTTP Webhook</option>
              </select>
            </div>
          </div>

          {type !== 'telegram' ? (
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Webhook URL</label>
              <input
                type="url"
                required
                placeholder="https://discord.com/api/webhooks/..."
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono text-cyan-400 outline-none"
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Telegram Bot Token</label>
                <input
                  type="text"
                  required
                  placeholder="123456:ABC-DEF..."
                  value={botToken}
                  onChange={(e) => setBotToken(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono text-cyan-400 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Telegram Chat ID</label>
                <input
                  type="text"
                  required
                  placeholder="-1001234567"
                  value={chatId}
                  onChange={(e) => setChatId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono text-cyan-400 outline-none"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow"
            >
              {isSubmitting ? 'Saving...' : 'Add Integration'}
            </button>
          </div>
        </form>

        <div className="flex justify-end pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
