import { Channel, Monitor } from '../db/types';

export class NotifierService {
  static async notifyStatusChange(
    monitor: Monitor,
    channels: Channel[],
    previousStatus: string,
    newStatus: string
  ): Promise<void> {
    const isDown = newStatus === 'down';
    const title = isDown
      ? `🔴 MONITOR DOWN: ${monitor.name}`
      : `🟢 MONITOR RECOVERED: ${monitor.name}`;

    const text = isDown
      ? `Check "${monitor.name}" (${monitor.slug}) missed its scheduled ping and is now DOWN.\nLast ping: ${monitor.last_ping_at || 'Never'}`
      : `Check "${monitor.name}" (${monitor.slug}) received a ping and has RECOVERED to UP status.`;

    const promises = channels.map(async (channel) => {
      if (!channel.enabled) return;
      try {
        const config = JSON.parse(channel.config_json);

        if (channel.type === 'discord' && config.webhook_url) {
          await fetch(config.webhook_url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              username: 'Health Monitor',
              embeds: [
                {
                  title,
                  description: text,
                  color: isDown ? 15158332 : 3066993, // Red vs Green
                  timestamp: new Date().toISOString(),
                },
              ],
            }),
          });
        } else if (channel.type === 'slack' && config.webhook_url) {
          await fetch(config.webhook_url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: `${title}\n${text}`,
            }),
          });
        } else if (channel.type === 'telegram' && config.bot_token && config.chat_id) {
          const telegramUrl = `https://api.telegram.org/bot${config.bot_token}/sendMessage`;
          await fetch(telegramUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: config.chat_id,
              text: `${title}\n\n${text}`,
              parse_mode: 'Markdown',
            }),
          });
        } else if (channel.type === 'webhook' && config.url) {
          await fetch(config.url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              event: isDown ? 'monitor.down' : 'monitor.up',
              monitor_id: monitor.id,
              monitor_slug: monitor.slug,
              monitor_name: monitor.name,
              previous_status: previousStatus,
              current_status: newStatus,
              last_ping_at: monitor.last_ping_at,
              timestamp: new Date().toISOString(),
            }),
          });
        }
      } catch (err) {
        console.error(`Failed to send notification via ${channel.type} (${channel.name}):`, err);
      }
    });

    await Promise.allSettled(promises);
  }
}
