# 📖 Health Monitor API Reference

This document describes the HTTP REST endpoints available in Health Monitor, including authentication mechanisms, public ping ingestion, dynamic badges, and administrative APIs.

---

## 🔐 Authentication & Security Model

Health Monitor implements a dual-mode edge security model:

1. **Public Unauthenticated Routes** (Zero overhead for ping ingestion & status badges):
   - `/ping/*` (Success, Start, Fail, Exit Code)
   - `/badge/*` (SVG status badges)
   - `/api/setup/*` (First-time setup status & schema initialization)
   - `/api/user` (Auth status check)
   - `/api/auth/login` (Admin login endpoint)

2. **Protected Administrative Routes** (Requires authentication):
   - `/api/monitors/*`
   - `/api/projects/*`
   - `/api/channels/*`

### Authentication Methods

Administrative API requests are authorized if **either** of the following conditions is met:

- **Cloudflare Access (Zero Trust)**: The request contains a valid `Cf-Access-Authenticated-User-Email` header injected by Cloudflare One at the edge.
- **Admin Bearer Token**: The request contains an `Authorization: Bearer <token>` header issued by `POST /api/auth/login`.

---

## 1. Authentication Endpoints

### Check Auth & User Identity
`GET /api/user`

Returns the current authentication status and user identity provider.

**Response (Authenticated via Cloudflare Access)**:
```json
{
  "authenticated": true,
  "provider": "Cloudflare Access (Zero Trust)",
  "email": "user@example.com",
  "country": "US"
}
```

**Response (Authenticated via Admin Password)**:
```json
{
  "authenticated": true,
  "provider": "Admin Password",
  "email": "admin@local",
  "country": "Local"
}
```

---

### Admin Login
`POST /api/auth/login`

Authenticates admin credentials against D1 `app_config` or `ADMIN_PASSWORD` environment secrets.

**Request Body**:
```json
{
  "username": "admin",
  "password": "your-admin-password"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "token": "YWRtaW46YWRtaW46aGVhbHRoX21vbml0b3Jfc2FsdF8yMDI2",
  "username": "admin"
}
```

---

### First-Time Setup & Credential Initialization
`POST /api/setup/init`

Initializes D1 database schema and sets custom admin credentials.

**Request Body**:
```json
{
  "username": "admin",
  "password": "my-secure-password",
  "withSampleData": true
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Cloudflare D1 database schema and admin credentials initialized successfully!",
  "token": "YWRtaW46bXktc2VjdXJlLXBhc3N3b3JkOmhlYWx0aF9tb25pdG9yX3NhbHRfMjAyNg==",
  "username": "admin"
}
```

---

## 2. Ping Endpoints (Public)

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

## 3. Dynamic SVG Status Badge (Public)

### Get Status Badge SVG
`GET /badge/:slug/status.svg`

Returns an SVG image badge indicating current status (`UP`, `LATE`, `DOWN`, `PAUSED`).

---

## 4. Administrative REST API (Protected)

### List Monitors
`GET /api/monitors?project_id=:projectId`

**Headers**: `Authorization: Bearer <token>`

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

**Headers**: `Authorization: Bearer <token>`  
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

---

## 5. Real-Time WebSocket API

### Connect to WebSocket Feed
`GET /api/ws` (HTTP Upgrade request)

Establishes a persistent, stateful WebSocket stream managed by Cloudflare Durable Objects.

- **URL Protocol**: `ws://` (HTTP) or `wss://` (HTTPS)
- **Authentication**: Unauthenticated for UI streaming; excluded from Bearer token locks.

#### Event Schema:
```json
{
  "type": "PING_RECEIVED",
  "payload": {
    "monitor": {
      "id": "chk_123",
      "name": "API Gateway",
      "slug": "api-gateway",
      "status": "up",
      "last_ping_at": "2026-07-31T01:00:00.000Z"
    },
    "logId": "log_456"
  },
  "timestamp": "2026-07-31T01:00:00.000Z"
}
```

#### Event Types:

| Event Type | Trigger | Payload |
| :--- | :--- | :--- |
| `CONNECTED` | WebSocket handshake complete | `{ "message": "WebSocket real-time connection established" }` |
| `PING_RECEIVED` | Ping recorded via `/ping/*` or test button | `{ monitor, previousStatus, pingType }` |
| `MONITOR_UPDATED` | Monitor status changed or edited | `{ monitor, previousStatus }` |
| `MONITOR_CREATED` | New check created | `{ monitor }` |
| `MONITOR_DELETED` | Check deleted | `{ monitorId }` |
| `PONG` | Sent in response to client text `"ping"` | `{ timestamp }` |

#### Client Keep-Alive:
Clients should send a text message `"ping"` every 25 seconds. The Durable Object will respond with `{"type": "PONG"}`.
