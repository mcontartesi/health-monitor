import { DBClient } from '../db/client';
import { Env } from '../db/types';
import { NotifierService } from './notifier';
import { broadcastRealtimeEvent } from './broadcaster';

export class MonitorEvaluator {
  constructor(private env: Env) {}

  async evaluateAllMonitors(): Promise<{ checked: number; transitionCount: number }> {
    const db = new DBClient(this.env);
    const monitors = await db.getMonitorsForEvaluation();
    const now = Date.now();
    let transitionCount = 0;

    for (const monitor of monitors) {
      if (!monitor.next_ping_expected_at) continue;

      const expectedTime = new Date(monitor.next_ping_expected_at).getTime();
      const graceMs = (monitor.grace_seconds || 900) * 1000;
      const graceTimeEnd = expectedTime + graceMs;

      // Current state
      const currentStatus = monitor.status;

      if (now > graceTimeEnd) {
        // Monitor has exceeded expected time + grace period -> MARK DOWN
        if (currentStatus !== 'down') {
          console.warn(`[Evaluator] Monitor "${monitor.name}" (${monitor.slug}) is DOWN! Overdue since ${monitor.next_ping_expected_at}`);
          
          await db.updateMonitor(monitor.id, { status: 'down' });
          const updated = { ...monitor, status: 'down' as const };
          transitionCount++;

          await broadcastRealtimeEvent(this.env, 'MONITOR_UPDATED', {
            monitor: updated,
            previousStatus: currentStatus,
          });

          // Fetch channels associated with project & alert
          const channels = await db.getChannels(monitor.project_id);
          await NotifierService.notifyStatusChange(
            updated,
            channels,
            currentStatus,
            'down'
          );
        }
      } else if (now > expectedTime && currentStatus === 'up') {
        // Monitor is in Grace period
        console.info(`[Evaluator] Monitor "${monitor.name}" (${monitor.slug}) entered GRACE state.`);
        await db.updateMonitor(monitor.id, { status: 'grace' });
        const updated = { ...monitor, status: 'grace' as const };
        transitionCount++;

        await broadcastRealtimeEvent(this.env, 'MONITOR_UPDATED', {
          monitor: updated,
          previousStatus: currentStatus,
        });
      }
    }

    return { checked: monitors.length, transitionCount };
  }
}
