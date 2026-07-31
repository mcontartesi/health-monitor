# 📖 API Reference

Health Monitor provides a high-performance REST API for ping ingestion, status badges, database administration, and real-time WebSockets.

---

## 📡 1. Public Ping API (Zero Authentication)

Send ping signals from your scripts, cronjobs, worker tasks, or CI/CD pipelines:

### Success Ping (Job Succeeded)
- **Endpoint**: `GET /ping/:slug` or `POST /ping/:slug`
- **Description**: Records a successful check execution and resets the expected interval timer.
- **Example**:
  ```bash
  curl -s https://<your-worker>.workers.dev/ping/db-backup
  ```

### Start Ping (Job Started)
- **Endpoint**: `GET /ping/:slug/start` or `POST /ping/:slug/start`
- **Description**: Marks the start of a background job to measure duration.
- **Example**:
  ```bash
  curl -s https://<your-worker>.workers.dev/ping/db-backup/start
  ```

### Failure Ping (Job Failed)
- **Endpoint**: `GET /ping/:slug/fail` or `POST /ping/:slug/fail`
- **Description**: Immediately triggers a failure alert. Accepts optional JSON error body (up to 2KB).
- **Example**:
  ```bash
  curl -X POST https://<your-worker>.workers.dev/ping/db-backup/fail \
    -H "Content-Type: application/json" \
    -d '{"error": "Database connection timeout after 30s"}'
  ```

### Exit Code Ping
- **Endpoint**: `GET /ping/:slug/:exit_code`
- **Description**: Ingests process exit codes (`0` = success, `> 0` = failure).
- **Example**:
  ```bash
  ./backup_script.sh
  curl -s https://<your-worker>.workers.dev/ping/db-backup/$?
  ```

---

## 🏷️ 2. Dynamic SVG Status Badge

Embed live status badges in GitHub READMEs, docs, or web portals:

- **Endpoint**: `GET /badge/:slug/status.svg`
- **Markdown Example**:
  ```markdown
  ![Status](https://<your-worker>.workers.dev/badge/db-backup/status.svg)
  ```

---

## 🔐 3. Protected Administrative REST API

Requires Bearer Token authentication (`Authorization: Bearer <token>`) or active Cloudflare Access Zero Trust headers.

### Login / Issue Bearer Token
- **Endpoint**: `POST /api/auth/login`
- **Body**:
  ```json
  {
    "username": "admin",
    "password": "your-admin-password"
  }
  ```

### List All Monitors
- **Endpoint**: `GET /api/monitors?project_id=proj_default`
- **Headers**: `Authorization: Bearer <token>`

### Create New Monitor
- **Endpoint**: `POST /api/monitors`
- **Body**:
  ```json
  {
    "project_id": "proj_default",
    "name": "Nightly ETL Pipeline",
    "slug": "etl-pipeline",
    "schedule_type": "simple",
    "interval_seconds": 86400,
    "grace_seconds": 3600
  }
  ```

---

## 🔄 4. Real-Time WebSocket Streaming API

- **Endpoint**: `GET /api/ws` (HTTP Upgrade)
- **Protocol**: `wss://`
- **Description**: Managed by Cloudflare Durable Objects with WebSocket Hibernation. Emits live events (`PING_RECEIVED`, `MONITOR_UPDATED`, `MONITOR_CREATED`, `MONITOR_DELETED`).
