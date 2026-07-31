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

// POST /api/setup/init - Initializes database schema and tables
setupRouter.post('/init', async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const withSampleData = body.withSampleData !== false; // defaults to true

    const db = new DBClient(c.env);
    const result = await db.initializeSchema(withSampleData);

    return c.json({
      success: true,
      message: 'Cloudflare D1 database schema initialized successfully!',
      executedCount: result.executedCount,
      withSampleData,
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
