import { Monitor, Channel, PingLog } from '../../worker/db/types';

const isGitHubPages = typeof window !== 'undefined' && (
  window.location.hostname === 'mcontartesi.github.io' ||
  window.location.hostname.endsWith('.github.io') ||
  window.location.pathname.startsWith('/health-monitor')
);

if (isGitHubPages) {
  console.log('[Demo Mode] Intercepting fetch and WebSocket for GitHub Pages preview.');

  // Mock WebSocket
  class MockWebSocket {
    url: string;
    readyState: number = 0; // CONNECTING
    onopen: (() => void) | null = null;
    onclose: (() => void) | null = null;
    onerror: ((err: any) => void) | null = null;
    onmessage: ((ev: any) => void) | null = null;

    constructor(url: string) {
      this.url = url;
      setTimeout(() => {
        this.readyState = 1; // OPEN
        if (this.onopen) this.onopen();
        if (this.onmessage) {
          this.onmessage({
            data: JSON.stringify({
              type: 'CONNECTED',
              timestamp: new Date().toISOString(),
            }),
          } as any);
        }
      }, 200);
    }

    send(data: string) {
      // Keep-alive or other events from client
    }

    close() {
      this.readyState = 3; // CLOSED
      if (this.onclose) this.onclose();
    }
  }

  (window as any).WebSocket = MockWebSocket;

  // Initial Seed Data
  const MOCK_DEMO_MONITORS: Monitor[] = [
    {
      id: 'demo_1',
      project_id: 'proj_default',
      name: 'Primary API Gateway (Muestra)',
      slug: 'api-gateway',
      description: 'Main API Gateway endpoint health check',
      schedule_type: 'simple',
      interval_seconds: 300,
      cron_expression: null,
      cron_tz: 'UTC',
      grace_seconds: 60,
      status: 'up',
      last_ping_at: new Date(Date.now() - 120000).toISOString(),
      next_ping_expected_at: new Date(Date.now() + 180000).toISOString(),
      last_duration_ms: 45,
      last_exit_code: 0,
      created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
      updated_at: new Date(Date.now() - 120000).toISOString(),
    },
    {
      id: 'demo_2',
      project_id: 'proj_default',
      name: 'Nightly DB Backup Cron (Muestra)',
      slug: 'db-backup-cron',
      description: 'Database backup cron job status',
      schedule_type: 'cron',
      interval_seconds: 86400,
      cron_expression: '0 3 * * *',
      cron_tz: 'UTC',
      grace_seconds: 3600,
      status: 'up',
      last_ping_at: new Date(Date.now() - 3600000 * 4).toISOString(),
      next_ping_expected_at: new Date(Date.now() + 3600000 * 20).toISOString(),
      last_duration_ms: 1250,
      last_exit_code: 0,
      created_at: new Date(Date.now() - 86400000 * 60).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    },
    {
      id: 'demo_3',
      project_id: 'proj_default',
      name: 'Staging Payment Webhook (Muestra)',
      slug: 'payment-webhook',
      description: 'Processes webhook notifications from stripe staging',
      schedule_type: 'simple',
      interval_seconds: 600,
      cron_expression: null,
      cron_tz: 'UTC',
      grace_seconds: 120,
      status: 'grace',
      last_ping_at: new Date(Date.now() - 650000).toISOString(),
      next_ping_expected_at: new Date(Date.now() - 50000).toISOString(),
      last_duration_ms: 88,
      last_exit_code: 0,
      created_at: new Date(Date.now() - 86400000 * 15).toISOString(),
      updated_at: new Date(Date.now() - 650000).toISOString(),
    },
    {
      id: 'demo_4',
      project_id: 'proj_default',
      name: 'Redis Cache Sync Worker (Muestra)',
      slug: 'redis-sync',
      description: 'Synchronizes in-memory cache with database updates',
      schedule_type: 'simple',
      interval_seconds: 60,
      cron_expression: null,
      cron_tz: 'UTC',
      grace_seconds: 15,
      status: 'down',
      last_ping_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      next_ping_expected_at: new Date(Date.now() - 3600000 * 2 + 75000).toISOString(),
      last_duration_ms: null,
      last_exit_code: 1,
      created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      id: 'demo_5',
      project_id: 'proj_default',
      name: 'User Email Notification Queue (Muestra)',
      slug: 'email-queue',
      description: 'Sends activation and transactional emails to users',
      schedule_type: 'simple',
      interval_seconds: 300,
      cron_expression: null,
      cron_tz: 'UTC',
      grace_seconds: 60,
      status: 'paused',
      last_ping_at: null,
      next_ping_expected_at: null,
      last_duration_ms: null,
      last_exit_code: 0,
      created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
      updated_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
  ];

  const MOCK_DEMO_CHANNELS: Channel[] = [
    {
      id: 'chan_1',
      project_id: 'proj_default',
      name: 'Discord alerts-channel',
      type: 'discord',
      config_json: JSON.stringify({ webhook_url: 'https://discord.com/api/webhooks/...' }),
      enabled: 1,
      created_at: new Date().toISOString(),
    },
    {
      id: 'chan_2',
      project_id: 'proj_default',
      name: 'Telegram Ops Group',
      type: 'telegram',
      config_json: JSON.stringify({ bot_token: '***', chat_id: '123456' }),
      enabled: 1,
      created_at: new Date().toISOString(),
    }
  ];

  const getStoredMonitors = (): Monitor[] => {
    const val = localStorage.getItem('demo_monitors');
    if (!val) {
      localStorage.setItem('demo_monitors', JSON.stringify(MOCK_DEMO_MONITORS));
      return MOCK_DEMO_MONITORS;
    }
    try {
      return JSON.parse(val);
    } catch {
      return MOCK_DEMO_MONITORS;
    }
  };

  const saveStoredMonitors = (mons: Monitor[]) => {
    localStorage.setItem('demo_monitors', JSON.stringify(mons));
  };

  const getStoredChannels = (): Channel[] => {
    const val = localStorage.getItem('demo_channels');
    if (!val) {
      localStorage.setItem('demo_channels', JSON.stringify(MOCK_DEMO_CHANNELS));
      return MOCK_DEMO_CHANNELS;
    }
    try {
      return JSON.parse(val);
    } catch {
      return MOCK_DEMO_CHANNELS;
    }
  };

  const saveStoredChannels = (chans: Channel[]) => {
    localStorage.setItem('demo_channels', JSON.stringify(chans));
  };

  const getStoredLogs = (monitorId: string): PingLog[] => {
    const val = localStorage.getItem(`demo_logs_${monitorId}`);
    if (!val) {
      const seedLogs: PingLog[] = [
        {
          id: `log_seed_${monitorId}_1`,
          monitor_id: monitorId,
          status: 'success',
          remote_addr: '8.8.8.8 (Seed)',
          user_agent: 'curl/7.68.0',
          duration_ms: 120,
          body_snippet: null,
          exit_code: 0,
          created_at: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: `log_seed_${monitorId}_2`,
          monitor_id: monitorId,
          status: 'success',
          remote_addr: '1.1.1.1 (Seed)',
          user_agent: 'GitHub-Hookshot',
          duration_ms: 95,
          body_snippet: null,
          exit_code: 0,
          created_at: new Date(Date.now() - 7200000).toISOString(),
        }
      ];
      localStorage.setItem(`demo_logs_${monitorId}`, JSON.stringify(seedLogs));
      return seedLogs;
    }
    try {
      return JSON.parse(val);
    } catch {
      return [];
    }
  };

  const addStoredLog = (monitorId: string, status: 'success' | 'start' | 'fail', details?: { duration_ms?: number; body_snippet?: string }) => {
    const logs = getStoredLogs(monitorId);
    const newLog: PingLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      monitor_id: monitorId,
      status,
      remote_addr: '127.0.0.1 (Web Demo)',
      user_agent: navigator.userAgent,
      duration_ms: details?.duration_ms || null,
      body_snippet: details?.body_snippet || null,
      exit_code: status === 'fail' ? 1 : 0,
      created_at: new Date().toISOString(),
    };
    logs.unshift(newLog);
    localStorage.setItem(`demo_logs_${monitorId}`, JSON.stringify(logs.slice(0, 20)));
  };

  const originalFetch = window.fetch;

  window.fetch = async function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const urlStr = typeof input === 'string' ? input : (input as any).url || input.toString();

    if (urlStr.includes('/api/')) {
      const parsedUrl = new URL(urlStr, window.location.origin);
      const path = parsedUrl.pathname;
      const method = init?.method?.toUpperCase() || 'GET';

      if (path === '/api/setup/init' && method === 'POST') {
        localStorage.setItem('demo_setup_done', 'true');
        return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }

      if (path === '/api/auth/login' && method === 'POST') {
        localStorage.setItem('demo_logged_in', 'true');
        localStorage.setItem('health_monitor_token', 'demo-secret-token');
        return new Response(JSON.stringify({ success: true, token: 'demo-secret-token' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }

      if (path === '/api/user') {
        const loggedIn = localStorage.getItem('demo_logged_in') === 'true';
        return new Response(JSON.stringify({
          authenticated: loggedIn,
          email: loggedIn ? 'demo-admin@healthmonitor.dev' : undefined,
          provider: loggedIn ? 'Demo Credentials' : undefined
        }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }

      if (path === '/api/monitors') {
        const setupDone = localStorage.getItem('demo_setup_done') === 'true';
        if (!setupDone) {
          return new Response(JSON.stringify({ needSetup: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }

        if (method === 'GET') {
          const monitors = getStoredMonitors();
          const total = monitors.length;
          const up = monitors.filter(m => m.status === 'up').length;
          const grace = monitors.filter(m => m.status === 'grace').length;
          const down = monitors.filter(m => m.status === 'down').length;
          const paused = monitors.filter(m => m.status === 'paused').length;

          return new Response(JSON.stringify({
            monitors,
            stats: { total, up, grace, down, paused }
          }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }

        if (method === 'POST') {
          const body = JSON.parse(init?.body as string || '{}');
          const monitors = getStoredMonitors();
          const newMonitor: Monitor = {
            id: `mon_${Date.now()}`,
            project_id: body.project_id || 'proj_default',
            name: body.name,
            slug: body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            description: body.description || 'Custom monitor added in Demo Mode',
            schedule_type: body.schedule_type || 'simple',
            interval_seconds: Number(body.interval_seconds) || 300,
            cron_expression: body.cron_expression || null,
            cron_tz: body.cron_tz || 'UTC',
            grace_seconds: Number(body.grace_seconds) || 60,
            status: 'up',
            last_ping_at: null,
            next_ping_expected_at: null,
            last_duration_ms: null,
            last_exit_code: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          monitors.unshift(newMonitor);
          saveStoredMonitors(monitors);
          return new Response(JSON.stringify({ success: true, monitor: newMonitor }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }
      }

      const monitorMatch = path.match(/\/api\/monitors\/([^\/]+)(?:\/(ping|pause|logs))?$/);
      if (monitorMatch) {
        const monitorId = monitorMatch[1];
        const subAction = monitorMatch[2];

        const monitors = getStoredMonitors();
        const monIdx = monitors.findIndex(m => m.id === monitorId);

        if (method === 'DELETE') {
          if (monIdx !== -1) {
            monitors.splice(monIdx, 1);
            saveStoredMonitors(monitors);
          }
          return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }

        if (subAction === 'ping' && method === 'POST') {
          if (monIdx !== -1) {
            const m = monitors[monIdx];
            m.status = 'up';
            m.last_ping_at = new Date().toISOString();
            m.next_ping_expected_at = new Date(Date.now() + m.interval_seconds * 1000).toISOString();
            const duration = Math.floor(Math.random() * 50) + 5;
            m.last_duration_ms = duration;
            m.last_exit_code = 0;
            saveStoredMonitors(monitors);
            addStoredLog(monitorId, 'success', { duration_ms: duration });
          }
          return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }

        if (subAction === 'pause' && method === 'POST') {
          if (monIdx !== -1) {
            const m = monitors[monIdx];
            m.status = m.status === 'paused' ? 'up' : 'paused';
            saveStoredMonitors(monitors);
          }
          return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }

        if (subAction === 'logs' && method === 'GET') {
          const logs = getStoredLogs(monitorId);
          return new Response(JSON.stringify({ logs }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }
      }

      if (path === '/api/channels') {
        if (method === 'GET') {
          const channels = getStoredChannels();
          return new Response(JSON.stringify({ channels }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }

        if (method === 'POST') {
          const body = JSON.parse(init?.body as string || '{}');
          const channels = getStoredChannels();
          const newChannel: Channel = {
            id: `chan_${Date.now()}`,
            project_id: body.project_id || 'proj_default',
            name: body.name,
            type: body.type,
            config_json: body.config_json || '{}',
            enabled: 1,
            created_at: new Date().toISOString(),
          };
          channels.push(newChannel);
          saveStoredChannels(channels);
          return new Response(JSON.stringify({ success: true, channel: newChannel }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }
      }

      const channelMatch = path.match(/\/api\/channels\/([^\/]+)(?:\/test)?$/);
      if (channelMatch) {
        const channelId = channelMatch[1];
        const isTest = path.endsWith('/test');

        const channels = getStoredChannels();
        const chanIdx = channels.findIndex(c => c.id === channelId);

        if (method === 'DELETE') {
          if (chanIdx !== -1) {
            channels.splice(chanIdx, 1);
            saveStoredChannels(channels);
          }
          return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }

        if (isTest && method === 'POST') {
          return new Response(JSON.stringify({ success: true, message: 'Test notification sent successfully (Demo Mode)!' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }
      }
    }

    return originalFetch(input, init);
  };
}
