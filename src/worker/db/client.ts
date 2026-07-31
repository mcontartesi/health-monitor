import { Env, Monitor, Project, PingLog, Channel, MonitorStatus } from './types';

export class DBClient {
  constructor(private env: Env) {}

  // Setup & Health Diagnostics
  async checkSetupStatus(): Promise<{ initialized: boolean; tableCount: number }> {
    try {
      const { results } = await this.env.DB.prepare(
        `SELECT name FROM sqlite_master WHERE type='table' AND name IN ('monitors', 'projects', 'ping_logs', 'channels')`
      ).all<{ name: string }>();

      const tableNames = (results || []).map((r) => r.name);
      const initialized = tableNames.includes('monitors') && tableNames.includes('projects');
      return { initialized, tableCount: tableNames.length };
    } catch (err) {
      return { initialized: false, tableCount: 0 };
    }
  }

  async initializeSchema(options: {
    username?: string;
    password?: string;
    withSampleData?: boolean;
  } = {}): Promise<{ success: boolean; executedCount: number }> {
    const withSampleData = options.withSampleData !== false;
    const stmts = [
      `CREATE TABLE IF NOT EXISTS projects (id TEXT PRIMARY KEY, name TEXT NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);`,
      `CREATE TABLE IF NOT EXISTS monitors (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, name TEXT NOT NULL, slug TEXT UNIQUE NOT NULL, description TEXT, schedule_type TEXT NOT NULL DEFAULT 'simple', interval_seconds INTEGER DEFAULT 3600, cron_expression TEXT, cron_tz TEXT DEFAULT 'UTC', grace_seconds INTEGER DEFAULT 900, status TEXT NOT NULL DEFAULT 'new', last_ping_at DATETIME, next_ping_expected_at DATETIME, last_duration_ms INTEGER, last_exit_code INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE);`,
      `CREATE TABLE IF NOT EXISTS ping_logs (id TEXT PRIMARY KEY, monitor_id TEXT NOT NULL, status TEXT NOT NULL, remote_addr TEXT, user_agent TEXT, duration_ms INTEGER, body_snippet TEXT, exit_code INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (monitor_id) REFERENCES monitors(id) ON DELETE CASCADE);`,
      `CREATE TABLE IF NOT EXISTS channels (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, name TEXT NOT NULL, type TEXT NOT NULL, config_json TEXT NOT NULL, enabled INTEGER DEFAULT 1, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE);`,
      `CREATE TABLE IF NOT EXISTS monitor_channels (monitor_id TEXT NOT NULL, channel_id TEXT NOT NULL, PRIMARY KEY (monitor_id, channel_id), FOREIGN KEY (monitor_id) REFERENCES monitors(id) ON DELETE CASCADE, FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE CASCADE);`,
      `CREATE TABLE IF NOT EXISTS api_keys (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, name TEXT NOT NULL, key_prefix TEXT NOT NULL, secret_hash TEXT NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE);`,
      `CREATE TABLE IF NOT EXISTS app_config (key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP);`,
      `CREATE INDEX IF NOT EXISTS idx_monitors_project ON monitors(project_id);`,
      `CREATE INDEX IF NOT EXISTS idx_monitors_slug ON monitors(slug);`,
      `CREATE INDEX IF NOT EXISTS idx_monitors_status ON monitors(status);`,
      `CREATE INDEX IF NOT EXISTS idx_ping_logs_monitor ON ping_logs(monitor_id, created_at DESC);`,
      `INSERT OR IGNORE INTO projects (id, name) VALUES ('proj_default', 'Production Environment');`
    ];

    if (options.username) {
      stmts.push(`INSERT OR REPLACE INTO app_config (key, value) VALUES ('admin_username', '${options.username.replace(/'/g, "''")}');`);
    }
    if (options.password) {
      stmts.push(`INSERT OR REPLACE INTO app_config (key, value) VALUES ('admin_password', '${options.password.replace(/'/g, "''")}');`);
    }

    if (withSampleData) {
      stmts.push(
        `INSERT OR IGNORE INTO monitors (id, project_id, name, slug, description, schedule_type, interval_seconds, grace_seconds, status) VALUES ('chk_backup_db', 'proj_default', 'Database Nightly Backup', 'db-backup', 'Daily PostgreSQL automated dump to Cloudflare R2', 'simple', 86400, 3600, 'up'), ('chk_sync_analytics', 'proj_default', 'Analytics Sync Service', 'analytics-sync', 'Hourly data warehouse sync process', 'simple', 3600, 600, 'up'), ('chk_ssl_cert', 'proj_default', 'SSL Certificate Expiry Monitor', 'ssl-checker', 'Weekly SSL validity verification cron', 'cron', 604800, 7200, 'new');`
      );
    }

    const batchPrepares = stmts.map((s) => this.env.DB.prepare(s));
    await this.env.DB.batch(batchPrepares);
    return { success: true, executedCount: stmts.length };
  }

  async getAppConfig(key: string): Promise<string | null> {
    try {
      const res = await this.env.DB.prepare(
        `SELECT value FROM app_config WHERE key = ?`
      ).bind(key).first<{ value: string }>();
      return res ? res.value : null;
    } catch (err) {
      return null;
    }
  }

  // Projects
  async getProjects(): Promise<Project[]> {
    try {
      const { results } = await this.env.DB.prepare(
        `SELECT * FROM projects ORDER BY created_at DESC`
      ).all<Project>();
      return results || [];
    } catch (err: any) {
      if (err.message && err.message.includes('no such table')) return [];
      throw err;
    }
  }

  async createProject(name: string): Promise<Project> {
    const id = `proj_${crypto.randomUUID().replace(/-/g, '').substring(0, 12)}`;
    await this.env.DB.prepare(
      `INSERT INTO projects (id, name) VALUES (?, ?)`
    ).bind(id, name).run();
    
    return { id, name, created_at: new Date().toISOString() };
  }

  // Monitors
  async getMonitors(projectId?: string): Promise<Monitor[]> {
    try {
      let query = `SELECT * FROM monitors`;
      const params: any[] = [];
      if (projectId) {
        query += ` WHERE project_id = ?`;
        params.push(projectId);
      }
      query += ` ORDER BY created_at DESC`;
      const { results } = await this.env.DB.prepare(query).bind(...params).all<Monitor>();
      return results || [];
    } catch (err: any) {
      if (err.message && err.message.includes('no such table')) return [];
      throw err;
    }
  }

  async getMonitorBySlugOrId(identifier: string): Promise<Monitor | null> {
    const result = await this.env.DB.prepare(
      `SELECT * FROM monitors WHERE id = ? OR slug = ?`
    ).bind(identifier, identifier).first<Monitor>();
    return result;
  }

  async createMonitor(data: {
    project_id: string;
    name: string;
    slug: string;
    description?: string;
    schedule_type: 'simple' | 'cron';
    interval_seconds?: number;
    cron_expression?: string;
    grace_seconds?: number;
  }): Promise<Monitor> {
    const id = `chk_${crypto.randomUUID().replace(/-/g, '').substring(0, 12)}`;
    const interval = data.interval_seconds || 3600;
    const grace = data.grace_seconds || 900;
    const now = new Date().toISOString();

    await this.env.DB.prepare(
      `INSERT INTO monitors (id, project_id, name, slug, description, schedule_type, interval_seconds, cron_expression, grace_seconds, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', ?, ?)`
    ).bind(
      id,
      data.project_id,
      data.name,
      data.slug,
      data.description || null,
      data.schedule_type,
      interval,
      data.cron_expression || null,
      grace,
      now,
      now
    ).run();

    return (await this.getMonitorBySlugOrId(id))!;
  }

  async updateMonitor(id: string, data: Partial<Monitor>): Promise<boolean> {
    const fields: string[] = [];
    const params: any[] = [];

    const allowedKeys: (keyof Monitor)[] = [
      'name', 'slug', 'description', 'schedule_type', 'interval_seconds',
      'cron_expression', 'grace_seconds', 'status', 'last_ping_at',
      'next_ping_expected_at', 'last_duration_ms', 'last_exit_code'
    ];

    for (const key of allowedKeys) {
      if (data[key] !== undefined) {
        fields.push(`${key} = ?`);
        params.push(data[key]);
      }
    }

    if (fields.length === 0) return false;

    fields.push(`updated_at = ?`);
    params.push(new Date().toISOString());
    params.push(id);

    const query = `UPDATE monitors SET ${fields.join(', ')} WHERE id = ?`;
    const res = await this.env.DB.prepare(query).bind(...params).run();
    return res.success;
  }

  async deleteMonitor(id: string): Promise<boolean> {
    const res = await this.env.DB.prepare(`DELETE FROM monitors WHERE id = ?`).bind(id).run();
    return res.success;
  }

  // Ping Operations
  async recordPing(
    monitor: Monitor,
    pingType: 'success' | 'start' | 'fail',
    meta: {
      remote_addr?: string;
      user_agent?: string;
      duration_ms?: number;
      body_snippet?: string;
      exit_code?: number;
    }
  ): Promise<{ monitor: Monitor; logId: string }> {
    const logId = `log_${crypto.randomUUID().replace(/-/g, '').substring(0, 12)}`;
    const now = new Date();
    const nowIso = now.toISOString();

    // Calculate next expected ping time
    const intervalMs = (monitor.interval_seconds || 3600) * 1000;
    const nextExpectedIso = new Date(now.getTime() + intervalMs).toISOString();

    let newStatus: MonitorStatus = monitor.status;
    if (pingType === 'success') {
      newStatus = 'up';
    } else if (pingType === 'fail') {
      newStatus = 'down';
    }

    // Insert Log
    await this.env.DB.prepare(
      `INSERT INTO ping_logs (id, monitor_id, status, remote_addr, user_agent, duration_ms, body_snippet, exit_code, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      logId,
      monitor.id,
      pingType,
      meta.remote_addr || null,
      meta.user_agent || null,
      meta.duration_ms || null,
      meta.body_snippet || null,
      meta.exit_code || 0,
      nowIso
    ).run();

    // Update Monitor state
    if (pingType !== 'start') {
      await this.env.DB.prepare(
        `UPDATE monitors SET 
           status = ?, 
           last_ping_at = ?, 
           next_ping_expected_at = ?,
           last_duration_ms = ?,
           last_exit_code = ?,
           updated_at = ?
         WHERE id = ?`
      ).bind(
        newStatus,
        nowIso,
        nextExpectedIso,
        meta.duration_ms || monitor.last_duration_ms,
        meta.exit_code || 0,
        nowIso,
        monitor.id
      ).run();
    }

    const updatedMonitor = (await this.getMonitorBySlugOrId(monitor.id))!;
    return { monitor: updatedMonitor, logId };
  }

  async getPingLogs(monitorId: string, limit = 50): Promise<PingLog[]> {
    const { results } = await this.env.DB.prepare(
      `SELECT * FROM ping_logs WHERE monitor_id = ? ORDER BY created_at DESC LIMIT ?`
    ).bind(monitorId, limit).all<PingLog>();
    return results;
  }

  // Channels
  async getChannels(projectId: string): Promise<Channel[]> {
    const { results } = await this.env.DB.prepare(
      `SELECT * FROM channels WHERE project_id = ? ORDER BY created_at DESC`
    ).bind(projectId).all<Channel>();
    return results;
  }

  async createChannel(data: {
    project_id: string;
    name: string;
    type: Channel['type'];
    config_json: string;
  }): Promise<Channel> {
    const id = `chan_${crypto.randomUUID().replace(/-/g, '').substring(0, 12)}`;
    await this.env.DB.prepare(
      `INSERT INTO channels (id, project_id, name, type, config_json, enabled) VALUES (?, ?, ?, ?, ?, 1)`
    ).bind(id, data.project_id, data.name, data.type, data.config_json).run();

    return {
      id,
      project_id: data.project_id,
      name: data.name,
      type: data.type,
      config_json: data.config_json,
      enabled: 1,
      created_at: new Date().toISOString()
    };
  }

  async deleteChannel(id: string): Promise<boolean> {
    const res = await this.env.DB.prepare(`DELETE FROM channels WHERE id = ?`).bind(id).run();
    return res.success;
  }

  // Evaluator helper: find monitors overdue for pings
  async getMonitorsForEvaluation(): Promise<Monitor[]> {
    const { results } = await this.env.DB.prepare(
      `SELECT * FROM monitors WHERE status IN ('up', 'new', 'grace') AND next_ping_expected_at IS NOT NULL`
    ).all<Monitor>();
    return results;
  }
}
