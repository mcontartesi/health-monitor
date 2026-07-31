import { Hono } from 'hono';
import { Env } from '../db/types';
import { DBClient } from '../db/client';
import { NotifierService } from '../services/notifier';
import { broadcastRealtimeEvent } from '../services/broadcaster';

import { setupRouter } from './setup';

export const apiRouter = new Hono<{ Bindings: Env }>();

apiRouter.route('/setup', setupRouter);

// WebSocket real-time connection endpoint
apiRouter.get('/ws', async (c) => {
  if (!c.env.REALTIME_BROADCASTER) {
    return c.text('Realtime WebSocket binding not configured', 503);
  }
  const id = c.env.REALTIME_BROADCASTER.idFromName('global_dashboard');
  const stub = c.env.REALTIME_BROADCASTER.get(id);
  return await stub.fetch(c.req.raw);
});

// Helper to create and verify admin bearer tokens
function generateAdminToken(username: string, pass: string): string {
  return btoa(`${username}:${pass}:health_monitor_salt_2026`);
}

async function getEffectiveAdminCredentials(c: any): Promise<{ username: string; pass: string } | null> {
  const envUser = c.env.ADMIN_USERNAME;
  const envPass = c.env.ADMIN_PASSWORD;

  if (envPass) {
    return { username: envUser || 'admin', pass: envPass };
  }

  const db = new DBClient(c.env);
  const dbUser = await db.getAppConfig('admin_username');
  const dbPass = await db.getAppConfig('admin_password');

  if (dbUser && dbPass) {
    return { username: dbUser, pass: dbPass };
  }

  return null;
}

async function isValidAuth(c: any): Promise<boolean> {
  // 1. Pass if Cloudflare Access header is present
  const cfAccessEmail = c.req.header('Cf-Access-Authenticated-User-Email');
  if (cfAccessEmail) return true;

  // 2. Pass if valid Bearer Token is provided
  const authHeader = c.req.header('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const creds = await getEffectiveAdminCredentials(c);
    if (creds) {
      const expectedToken = generateAdminToken(creds.username, creds.pass);
      if (token === expectedToken) return true;
    }
  }

  return false;
}

// Public Auth Endpoints
apiRouter.get('/user', async (c) => {
  const email = c.req.header('Cf-Access-Authenticated-User-Email');
  const country = c.req.header('Cf-Ipcountry');

  if (email) {
    return c.json({
      authenticated: true,
      provider: 'Cloudflare Access (Zero Trust)',
      email,
      country: country || 'Global',
    });
  }

  const authenticated = await isValidAuth(c);
  if (authenticated) {
    const creds = await getEffectiveAdminCredentials(c);
    return c.json({
      authenticated: true,
      provider: 'Admin Password',
      email: `${creds?.username || 'admin'}@local`,
      country: country || 'Local',
    });
  }

  return c.json({
    authenticated: false,
    provider: 'None',
  });
});

apiRouter.post('/auth/login', async (c) => {
  try {
    const body = await c.req.json();
    const username = (body.username || '').trim();
    const password = (body.password || '').trim();

    const creds = await getEffectiveAdminCredentials(c);
    if (!creds) {
      return c.json({ success: false, error: 'Admin credentials have not been initialized. Please run setup.' }, 401);
    }

    if (username === creds.username && password === creds.pass) {
      const token = generateAdminToken(creds.username, creds.pass);
      return c.json({
        success: true,
        token,
        username: creds.username,
      });
    }

    return c.json({ success: false, error: 'Invalid admin username or password' }, 401);
  } catch (err: any) {
    return c.json({ success: false, error: err.message || 'Login failed' }, 400);
  }
});

// Middleware: Require authentication for write/read API routes (except setup, user, login, ws)
apiRouter.use('*', async (c, next) => {
  const path = c.req.path;
  // Exclude setup, user, login, ws routes from middleware lock
  if (path.startsWith('/api/setup') || path.endsWith('/user') || path.endsWith('/login') || path.endsWith('/ws')) {
    return await next();
  }

  const db = new DBClient(c.env);
  const setupStatus = await db.checkSetupStatus();
  if (!setupStatus.initialized) {
    return c.json(
      {
        needSetup: true,
        monitors: [],
        stats: { total: 0, up: 0, grace: 0, down: 0, paused: 0 },
        message: 'D1 Database tables have not been created yet. Please run the setup wizard.',
      },
      200
    );
  }

  const authenticated = await isValidAuth(c);
  if (!authenticated) {
    return c.json(
      {
        error: 'Admin authentication required',
        authRequired: true,
      },
      401
    );
  }

  await next();
});

// Projects
apiRouter.get('/projects', async (c) => {
  const db = new DBClient(c.env);
  const projects = await db.getProjects();
  return c.json({ projects });
});

apiRouter.post('/projects', async (c) => {
  const body = await c.req.json();
  if (!body.name) return c.json({ error: 'Project name is required' }, 400);

  const db = new DBClient(c.env);
  const project = await db.createProject(body.name);
  return c.json({ project });
});

// Monitors
apiRouter.get('/monitors', async (c) => {
  const projectId = c.req.query('project_id');
  const db = new DBClient(c.env);

  const setupStatus = await db.checkSetupStatus();
  if (!setupStatus.initialized) {
    return c.json(
      {
        monitors: [],
        stats: { total: 0, up: 0, grace: 0, down: 0, paused: 0 },
        needSetup: true,
        message: 'D1 Database tables have not been created yet. Please run the setup wizard.',
      },
      200
    );
  }

  const monitors = await db.getMonitors(projectId);

  // Compute aggregate stats
  const stats = {
    total: monitors.length,
    up: monitors.filter((m) => m.status === 'up').length,
    grace: monitors.filter((m) => m.status === 'grace').length,
    down: monitors.filter((m) => m.status === 'down').length,
    paused: monitors.filter((m) => m.status === 'paused').length,
  };

  return c.json({ monitors, stats, needSetup: false });
});

apiRouter.post('/monitors', async (c) => {
  const body = await c.req.json();
  if (!body.name || !body.project_id) {
    return c.json({ error: 'Name and project_id are required' }, 400);
  }

  const db = new DBClient(c.env);
  const slug = body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  try {
    const monitor = await db.createMonitor({
      project_id: body.project_id,
      name: body.name,
      slug,
      description: body.description,
      schedule_type: body.schedule_type || 'simple',
      interval_seconds: Number(body.interval_seconds) || 3600,
      cron_expression: body.cron_expression,
      grace_seconds: Number(body.grace_seconds) || 900,
    });

    c.executionCtx.waitUntil(
      broadcastRealtimeEvent(c.env, 'MONITOR_CREATED', { monitor })
    );

    return c.json({ monitor }, 201);
  } catch (err: any) {
    return c.json({ error: err.message || 'Failed to create monitor' }, 400);
  }
});

apiRouter.put('/monitors/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const db = new DBClient(c.env);

  const updated = await db.updateMonitor(id, body);
  if (!updated) return c.json({ error: 'Monitor update failed or not found' }, 404);

  const monitor = await db.getMonitorBySlugOrId(id);

  if (monitor) {
    c.executionCtx.waitUntil(
      broadcastRealtimeEvent(c.env, 'MONITOR_UPDATED', { monitor })
    );
  }

  return c.json({ monitor });
});

apiRouter.post('/monitors/:id/pause', async (c) => {
  const id = c.req.param('id');
  const db = new DBClient(c.env);
  const monitor = await db.getMonitorBySlugOrId(id);
  if (!monitor) return c.json({ error: 'Monitor not found' }, 404);

  const newStatus = monitor.status === 'paused' ? 'up' : 'paused';
  await db.updateMonitor(id, { status: newStatus });
  const updatedMonitor = { ...monitor, status: newStatus as any };

  c.executionCtx.waitUntil(
    broadcastRealtimeEvent(c.env, 'MONITOR_UPDATED', { monitor: updatedMonitor })
  );

  return c.json({ success: true, status: newStatus });
});

apiRouter.post('/monitors/:id/ping', async (c) => {
  const id = c.req.param('id');
  const db = new DBClient(c.env);
  const monitor = await db.getMonitorBySlugOrId(id);
  if (!monitor) return c.json({ error: 'Monitor not found' }, 404);

  const ip = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || '127.0.0.1 (Dashboard)';
  const { monitor: updatedMonitor, logId } = await db.recordPing(monitor, 'success', {
    remote_addr: ip,
    user_agent: 'Manual Test Ping (Web Dashboard)',
    duration_ms: Math.floor(Math.random() * 20) + 15,
    body_snippet: 'Manual test triggered from dashboard UI',
  });

  c.executionCtx.waitUntil(
    broadcastRealtimeEvent(c.env, 'PING_RECEIVED', {
      monitor: updatedMonitor,
      logId,
      pingType: 'success',
    })
  );

  return c.json({ success: true, monitor: updatedMonitor, logId });
});

apiRouter.delete('/monitors/:id', async (c) => {
  const id = c.req.param('id');
  const db = new DBClient(c.env);
  const deleted = await db.deleteMonitor(id);

  if (deleted) {
    c.executionCtx.waitUntil(
      broadcastRealtimeEvent(c.env, 'MONITOR_DELETED', { monitorId: id })
    );
  }

  return c.json({ success: deleted });
});

// Logs
apiRouter.get('/monitors/:id/logs', async (c) => {
  const id = c.req.param('id');
  const db = new DBClient(c.env);
  const logs = await db.getPingLogs(id, 100);
  return c.json({ logs });
});

// Alert Channels
apiRouter.get('/channels', async (c) => {
  const projectId = c.req.query('project_id') || 'proj_default';
  const db = new DBClient(c.env);
  const channels = await db.getChannels(projectId);
  return c.json({ channels });
});

apiRouter.post('/channels', async (c) => {
  const body = await c.req.json();
  if (!body.name || !body.type || !body.config_json) {
    return c.json({ error: 'Missing channel configuration' }, 400);
  }

  const db = new DBClient(c.env);
  const channel = await db.createChannel({
    project_id: body.project_id || 'proj_default',
    name: body.name,
    type: body.type,
    config_json: typeof body.config_json === 'string' ? body.config_json : JSON.stringify(body.config_json),
  });

  return c.json({ channel }, 201);
});

apiRouter.delete('/channels/:id', async (c) => {
  const id = c.req.param('id');
  const db = new DBClient(c.env);
  const success = await db.deleteChannel(id);
  return c.json({ success });
});

apiRouter.post('/channels/:id/test', async (c) => {
  const id = c.req.param('id');
  const db = new DBClient(c.env);
  const channels = await db.getChannels('proj_default');
  const channel = channels.find((ch) => ch.id === id);

  if (!channel) return c.json({ error: 'Channel not found' }, 404);

  const mockMonitor: any = {
    id: 'chk_test',
    project_id: 'proj_default',
    name: 'Sample Test Alert Check',
    slug: 'test-check',
    status: 'down',
    last_ping_at: new Date().toISOString(),
  };

  await NotifierService.notifyStatusChange(mockMonitor, [channel], 'up', 'down');
  return c.json({ success: true, message: `Test notification sent via ${channel.name}` });
});
