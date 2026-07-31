import React, { useState } from 'react';
import { X, Copy, Check, Terminal, Code2, Server, ShieldCheck } from 'lucide-react';
import { Monitor } from '../../worker/db/types';

interface SnippetGeneratorModalProps {
  monitor: Monitor | null;
  onClose: () => void;
}

export const SnippetGeneratorModal: React.FC<SnippetGeneratorModalProps> = ({
  monitor,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'curl' | 'bash' | 'python' | 'node' | 'crontab' | 'ps'>('curl');
  const [copied, setCopied] = useState(false);

  if (!monitor) return null;

  const pingUrl = `${window.location.origin}/ping/${monitor.slug}`;

  const snippets = {
    curl: `# Simple Ping (HTTP GET / POST)
curl -m 10 --retry 5 "${pingUrl}"

# Signal Job Failure:
curl -m 10 "${pingUrl}/fail"

# Signal Job Start (enables duration tracking):
curl -m 10 "${pingUrl}/start"`,

    bash: `#!/usr/bin/env bash
# Signal job start
curl -s -m 10 "${pingUrl}/start" > /dev/null

# Execute your actual job/script here
/usr/local/bin/my-backup-task.sh
EXIT_CODE=$?

# Signal completion status to Health Monitor
if [ $EXIT_CODE -eq 0 ]; then
  curl -s -m 10 "${pingUrl}" > /dev/null
else
  curl -s -m 10 "${pingUrl}/fail" > /dev/null
fi`,

    python: `import requests

# 1. Signal Job Start
requests.get("${pingUrl}/start")

try:
    # Perform your cron/background work here
    print("Running scheduled task...")
    
    # 2. Signal Success
    requests.get("${pingUrl}")
except Exception as e:
    # 3. Signal Failure with error log payload
    requests.post("${pingUrl}/fail", data=str(e))
    raise e`,

    node: `import fetch from 'node-fetch';

async function runCronJob() {
  // Signal start
  await fetch("${pingUrl}/start");

  try {
    // Your task execution
    console.log("Executing background worker...");
    
    // Signal success
    await fetch("${pingUrl}");
  } catch (error) {
    // Signal failure with error body snippet
    await fetch("${pingUrl}/fail", {
      method: "POST",
      body: String(error)
    });
    process.exit(1);
  }
}

runCronJob();`,

    crontab: `# Add this line to your crontab (crontab -e):
0 3 * * * /usr/local/bin/backup.sh && curl -fsS --retry 3 "${pingUrl}"`,

    ps: `# PowerShell Integration
Invoke-RestMethod -Uri "${pingUrl}/start" -Method Get

try {
    # Run task
    Write-Output "Executing scheduled script..."
    Invoke-RestMethod -Uri "${pingUrl}" -Method Get
} catch {
    Invoke-RestMethod -Uri "${pingUrl}/fail" -Method Post -Body $_.Exception.Message
}`,
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(snippets[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="glass-modal w-full max-w-2xl rounded-2xl p-6 border border-slate-700 shadow-2xl space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <Terminal className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-bold text-white">Integration Snippets</h2>
            </div>
            <p className="text-xs text-slate-400">
              Copy & paste to integrate check <span className="text-emerald-400 font-bold">{monitor.name}</span>
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selector */}
        <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
          {[
            { id: 'curl', name: 'cURL' },
            { id: 'bash', name: 'Bash Script' },
            { id: 'python', name: 'Python' },
            { id: 'node', name: 'Node.js' },
            { id: 'crontab', name: 'Crontab' },
            { id: 'ps', name: 'PowerShell' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                activeTab === tab.id
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>

        {/* Code Snippet Container */}
        <div className="relative bg-slate-950 rounded-xl border border-slate-800 p-4 font-mono text-xs overflow-x-auto">
          <button
            onClick={copyToClipboard}
            className="absolute top-3 right-3 flex items-center space-x-1 px-2.5 py-1 text-xs font-sans font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Code'}</span>
          </button>
          <pre className="text-emerald-400 leading-relaxed pr-24 whitespace-pre-wrap">
            {snippets[activeTab]}
          </pre>
        </div>

        {/* SVG Badge Embed Preview */}
        <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800 flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1">GitHub README Badge</h4>
            <p className="text-xs text-slate-400">Embed real-time status in your project documentation:</p>
          </div>
          <div className="bg-slate-950 px-3 py-2 rounded border border-slate-800 flex items-center space-x-2">
            <img
              src={`${window.location.origin}/badge/${monitor.slug}/status.svg`}
              alt="Badge Status"
              className="h-5"
            />
          </div>
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
