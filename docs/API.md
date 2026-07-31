# 📖 Health Monitor API Reference

This document describes the HTTP REST endpoints available in Health Monitor.

---

## 1. Ping Endpoints

### Ping Check Success
`GET /ping/:slug` or `POST /ping/:slug`

Signals that a job or check completed successfully.

**Response**:
```text
OK - Ping recorded for "Nightly Backup" (UP)
```

---

### Signal Job Start
`GET /ping/:slug/start` or `POST /ping/:slug/start`

Signals that a job execution has started. Enables job duration timing.

---

### Signal Job Failure
`GET /ping/:slug/fail` or `POST /ping/:slug/fail`

Signals that a job failed. Accepts optional request body payload containing error message or stacktrace (up to 2KB).

---

### Signal Job Exit Code
`GET /ping/:slug/:exit_code`

Ingests process exit code directly (e.g. `/ping/db-backup/0` = success, `/ping/db-backup/1` = fail).

---

## 2. Dynamic SVG Status Badge

### Get Status Badge SVG
`GET /badge/:slug/status.svg`

Returns an SVG image badge indicating current status (`UP`, `LATE`, `DOWN`, `PAUSED`).

---

## 3. Administrative REST API

### List Monitors
`GET /api/monitors?project_id=:projectId`

**Response**:
```json
{
  "monitors": [
    {
      "id": "chk_backup_db",
      "name": "Database Nightly Backup",
      "slug": "db-backup",
      "status": "up",
      "interval_seconds": 86400,
      "grace_seconds": 3600,
      "last_ping_at": "2026-07-30T22:00:00.000Z"
    }
  ],
  "stats": {
    "total": 1,
    "up": 1,
    "grace": 0,
    "down": 0,
    "paused": 0
  }
}
```

### Create Monitor
`POST /api/monitors`

**Body**:
```json
{
  "project_id": "proj_default",
  "name": "Sync Service",
  "slug": "sync-service",
  "schedule_type": "simple",
  "interval_seconds": 3600,
  "grace_seconds": 600
}
```

### Get Audit Logs
`GET /api/monitors/:id/logs`

Returns recent ping log records for a monitor.

### Trigger Test Ping
`POST /api/monitors/:id/ping`

Manually simulates a ping for testing.
