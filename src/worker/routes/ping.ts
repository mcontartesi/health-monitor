import { Hono } from 'hono';
import { Env } from '../db/types';
import { DBClient } from '../db/client';
import { NotifierService } from '../services/notifier';

export const pingRouter = new Hono<{ Bindings: Env }>();

// High-performance ping handler
pingRouter.all('/:id/:type?', async (c) => {
  const idOrSlug = c.req.param('id');
  const typeParam = c.req.param('type');
  const db = new DBClient(c.env);

  const monitor = await db.getMonitorBySlugOrId(idOrSlug);
  if (!monitor) {
    return c.text('Monitor Not Found', 404);
  }

  // Determine ping status type
  let pingType: 'success' | 'start' | 'fail' = 'success';
  let exitCode = 0;

  if (typeParam === 'start') {
    pingType = 'start';
  } else if (typeParam === 'fail') {
    pingType = 'fail';
  } else if (typeParam && !isNaN(Number(typeParam))) {
    exitCode = Number(typeParam);
    pingType = exitCode === 0 ? 'success' : 'fail';
  }

  // Handle optional body snippet (up to 2048 chars)
  let bodySnippet: string | undefined;
  try {
    const text = await c.req.text();
    if (text) {
      bodySnippet = text.substring(0, 2048);
    }
  } catch (e) {
    // Ignore body parse errors
  }

  const userAgent = c.req.header('user-agent');
  const clientIp = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || 'unknown';

  const previousStatus = monitor.status;

  // Record Ping in DB
  const { monitor: updatedMonitor } = await db.recordPing(monitor, pingType, {
    remote_addr: clientIp,
    user_agent: userAgent,
    body_snippet: bodySnippet,
    exit_code: exitCode,
  });

  // If monitor was DOWN or GRACE and now recovered to UP, send Recovery Alert!
  if ((previousStatus === 'down' || previousStatus === 'grace') && updatedMonitor.status === 'up') {
    const channels = await db.getChannels(monitor.project_id);
    c.executionCtx.waitUntil(
      NotifierService.notifyStatusChange(updatedMonitor, channels, previousStatus, 'up')
    );
  }

  return c.text(`OK - Ping recorded for "${monitor.name}" (${updatedMonitor.status.toUpperCase()})`);
});
