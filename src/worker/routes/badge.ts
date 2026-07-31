import { Hono } from 'hono';
import { Env } from '../db/types';
import { DBClient } from '../db/client';

export const badgeRouter = new Hono<{ Bindings: Env }>();

badgeRouter.get('/:id/status.svg', async (c) => {
  const idOrSlug = c.req.param('id');
  const db = new DBClient(c.env);
  const monitor = await db.getMonitorBySlugOrId(idOrSlug);

  const status = monitor ? monitor.status : 'unknown';
  
  let statusText = status.toUpperCase();
  let bgColor = '#6B7280'; // gray

  if (status === 'up') {
    bgColor = '#10B981'; // green
    statusText = 'UP';
  } else if (status === 'grace') {
    bgColor = '#F59E0B'; // amber
    statusText = 'LATE';
  } else if (status === 'down') {
    bgColor = '#EF4444'; // red
    statusText = 'DOWN';
  } else if (status === 'paused') {
    bgColor = '#6B7280';
    statusText = 'PAUSED';
  }

  const label = 'health';
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="110" height="20" role="img" aria-label="${label}: ${statusText}">
  <title>${label}: ${statusText}</title>
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <clipPath id="r">
    <rect width="110" height="20" rx="3" fill="#fff"/>
  </clipPath>
  <g clip-path="url(#r)">
    <rect width="55" height="20" fill="#374151"/>
    <rect x="55" width="55" height="20" fill="${bgColor}"/>
    <rect width="110" height="20" fill="url(#s)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" text-rendering="geometricPrecision" font-size="110">
    <text x="285" y="140" transform="scale(.1)" fill="#fff">${label}</text>
    <text x="825" y="140" transform="scale(.1)" fill="#fff" font-weight="bold">${statusText}</text>
  </g>
</svg>
  `.trim();

  return c.text(svg, 200, {
    'Content-Type': 'image/svg+xml',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
  });
});
