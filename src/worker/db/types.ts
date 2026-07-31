export interface Env {
  DB: D1Database;
  KV: KVNamespace;
  ASSETS?: Fetcher;
}

export type MonitorStatus = 'new' | 'up' | 'grace' | 'down' | 'paused';
export type ScheduleType = 'simple' | 'cron';

export interface Project {
  id: string;
  name: string;
  created_at: string;
}

export interface Monitor {
  id: string;
  project_id: string;
  name: string;
  slug: string;
  description: string | null;
  schedule_type: ScheduleType;
  interval_seconds: number;
  cron_expression: string | null;
  cron_tz: string;
  grace_seconds: number;
  status: MonitorStatus;
  last_ping_at: string | null;
  next_ping_expected_at: string | null;
  last_duration_ms: number | null;
  last_exit_code: number;
  created_at: string;
  updated_at: string;
}

export interface PingLog {
  id: string;
  monitor_id: string;
  status: 'success' | 'start' | 'fail';
  remote_addr: string | null;
  user_agent: string | null;
  duration_ms: number | null;
  body_snippet: string | null;
  exit_code: number;
  created_at: string;
}

export interface Channel {
  id: string;
  project_id: string;
  name: string;
  type: 'discord' | 'telegram' | 'slack' | 'webhook' | 'email';
  config_json: string;
  enabled: number;
  created_at: string;
}

export interface ApiKey {
  id: string;
  project_id: string;
  name: string;
  key_prefix: string;
  secret_hash: string;
  created_at: string;
}
