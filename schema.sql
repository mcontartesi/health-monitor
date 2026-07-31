-- Health Monitor Cloudflare D1 Database Schema

-- 1. Projects (Workspaces)
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Monitors (Cron & Health Checks)
CREATE TABLE IF NOT EXISTS monitors (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  schedule_type TEXT NOT NULL DEFAULT 'simple', -- 'simple' | 'cron'
  interval_seconds INTEGER DEFAULT 3600,       -- Ping interval in seconds (default 1h)
  cron_expression TEXT,                        -- Optional cron expression e.g. "0 * * * *"
  cron_tz TEXT DEFAULT 'UTC',
  grace_seconds INTEGER DEFAULT 900,           -- Grace period before marking DOWN (default 15m)
  status TEXT NOT NULL DEFAULT 'new',          -- 'new' | 'up' | 'grace' | 'down' | 'paused'
  last_ping_at DATETIME,
  next_ping_expected_at DATETIME,
  last_duration_ms INTEGER,
  last_exit_code INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- 3. Ping Audit Logs
CREATE TABLE IF NOT EXISTS ping_logs (
  id TEXT PRIMARY KEY,
  monitor_id TEXT NOT NULL,
  status TEXT NOT NULL,                        -- 'success' | 'start' | 'fail'
  remote_addr TEXT,
  user_agent TEXT,
  duration_ms INTEGER,
  body_snippet TEXT,
  exit_code INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (monitor_id) REFERENCES monitors(id) ON DELETE CASCADE
);

-- 4. Notification Channels
CREATE TABLE IF NOT EXISTS channels (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,                          -- 'discord' | 'telegram' | 'slack' | 'webhook' | 'email'
  config_json TEXT NOT NULL,                   -- JSON containing credentials / URLs
  enabled INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- 5. Monitor <-> Channel Link Table
CREATE TABLE IF NOT EXISTS monitor_channels (
  monitor_id TEXT NOT NULL,
  channel_id TEXT NOT NULL,
  PRIMARY KEY (monitor_id, channel_id),
  FOREIGN KEY (monitor_id) REFERENCES monitors(id) ON DELETE CASCADE,
  FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE CASCADE
);

-- 6. API Keys for Automation
CREATE TABLE IF NOT EXISTS api_keys (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  name TEXT NOT NULL,
  key_prefix TEXT NOT NULL,
  secret_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- 7. App System Configuration & Credentials
CREATE TABLE IF NOT EXISTS app_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_monitors_project ON monitors(project_id);
CREATE INDEX IF NOT EXISTS idx_monitors_slug ON monitors(slug);
CREATE INDEX IF NOT EXISTS idx_monitors_status ON monitors(status);
CREATE INDEX IF NOT EXISTS idx_ping_logs_monitor ON ping_logs(monitor_id, created_at DESC);

-- Initial Seed Data
INSERT OR IGNORE INTO projects (id, name) VALUES ('proj_default', 'Production Environment');

INSERT OR IGNORE INTO monitors (id, project_id, name, slug, description, schedule_type, interval_seconds, grace_seconds, status)
VALUES 
  ('chk_backup_db', 'proj_default', 'Database Nightly Backup', 'db-backup', 'Daily PostgreSQL automated dump to Cloudflare R2', 'simple', 86400, 3600, 'up'),
  ('chk_sync_analytics', 'proj_default', 'Analytics Sync Service', 'analytics-sync', 'Hourly data warehouse sync process', 'simple', 3600, 600, 'up'),
  ('chk_ssl_cert', 'proj_default', 'SSL Certificate Expiry Monitor', 'ssl-checker', 'Weekly SSL validity verification cron', 'cron', 604800, 7200, 'new');
