import { DBClient } from '../db/client';
import { Env } from '../db/types';
import { NotifierService } from './notifier';

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
          transitionCount++;

          // Fetch channels associated with project & alert
          const channels = await db.getChannels(monitor.project_id);
          await NotifierService.notifyStatusChange(
            { ...monitor, status: 'down' },
            channels,
            currentStatus,
            'down'
          );
        }
      } else if (now > expectedTime && currentStatus === 'up') {
        // Monitor is in Grace period
        console.info(`[Evaluator] Monitor "${monitor.name}" (${monitor.slug}) entered GRACE state.`);
        await db.updateMonitor(monitor.id, { status: 'grace' });
        transitionCount++;
      }
    }

    return { checked: monitors.length, transitionCount };
  }
}
