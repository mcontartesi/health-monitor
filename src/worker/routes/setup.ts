import { Hono } from 'hono';
import { Env } from '../db/types';
import { DBClient } from '../db/client';

export const setupRouter = new Hono<{ Bindings: Env }>();

// GET /api/setup/status - Returns setup status
setupRouter.get('/status', async (c) => {
  const db = new DBClient(c.env);
  const status = await db.checkSetupStatus();
  return c.json({
    initialized: status.initialized,
    tableCount: status.tableCount,
    timestamp: new Date().toISOString(),
  });
});

// POST /api/setup/init - Initializes database schema, tables, and admin credentials
setupRouter.post('/init', async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const withSampleData = body.withSampleData !== false;
    const username = (body.username || '').trim();
    const password = (body.password || '').trim();

    if (!username || !password) {
      return c.json({ success: false, error: 'Admin username and password are required for initial setup' }, 400);
    }

    const db = new DBClient(c.env);
    const result = await db.initializeSchema({
      username,
      password,
      withSampleData,
    });

    const token = btoa(`${username}:${password}:health_monitor_salt_2026`);

    return c.json({
      success: true,
      message: 'Cloudflare D1 database schema and admin credentials initialized successfully!',
      executedCount: result.executedCount,
      withSampleData,
      token,
      username,
    });
  } catch (err: any) {
    console.error('Setup initialization failed:', err);
    return c.json(
      {
        success: false,
        error: err.message || 'Failed to initialize database tables',
      },
      500
    );
  }
});
