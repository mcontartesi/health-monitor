import { Hono } from 'hono';
import { Env } from './db/types';
import { pingRouter } from './routes/ping';
import { badgeRouter } from './routes/badge';
import { apiRouter } from './routes/api';
import { MonitorEvaluator } from './services/evaluator';

const app = new Hono<{ Bindings: Env }>();

// Mount sub-routers
app.route('/ping', pingRouter);
app.route('/badge', badgeRouter);
app.route('/api', apiRouter);

// Health check endpoint for worker status
app.get('/health', (c) => {
  return c.json({ status: 'ok', service: 'Health Monitor Worker', timestamp: new Date().toISOString() });
});

// Fallback to Cloudflare Worker Static Assets for SPA UI routes
app.all('*', async (c) => {
  if (c.env.ASSETS) {
    return await c.env.ASSETS.fetch(c.req.raw);
  }
  return c.text('Health Monitor Backend API - Static UI assets binding not loaded.', 404);
});

export default {
  // HTTP fetch handler
  fetch: app.fetch,

  // Scheduled Cron trigger handler (Runs every minute)
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(
      (async () => {
        console.log(`[Cron Trigger] Evaluating monitors at ${new Date().toISOString()}...`);
        const evaluator = new MonitorEvaluator(env);
        const result = await evaluator.evaluateAllMonitors();
        console.log(`[Cron Trigger] Finished: checked ${result.checked} monitors, ${result.transitionCount} state changes.`);
      })()
    );
  },
};
