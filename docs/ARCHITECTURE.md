# 📐 Health Monitor Architecture & Technical Deep Dive

This document details the architectural design, Cloudflare primitive integrations, and security architecture of **Health Monitor**.

---

## 1. Cloudflare Ecosystem Stack

Health Monitor is engineered to require zero external services. Every layer of the application operates inside Cloudflare's edge platform:

| Component | Cloudflare Primitive | Purpose |
| :--- | :--- | :--- |
| **Real-time Hub** | Cloudflare Durable Objects | Stateful WebSocket broadcasting with WebSocket Hibernation |
| **API & Ingestion** | Cloudflare Workers | Serverless HTTP routing, ping processing, SVG rendering |
| **Database** | Cloudflare D1 | Serverless SQL (SQLite at edge) storing checks, logs, channels, config |
| **State Caching** | Cloudflare KV | Low-latency state lookup and rate-limiting cache |
| **Background Evaluator** | Workers Cron Triggers | 1-minute scheduled execution inspecting overdue heartbeats |
| **Frontend UI** | Workers Static Assets | React + Tailwind SPA served directly from Worker edge |
| **Zero Trust Auth** | Cloudflare Access | Enterprise Single Sign-On (GitHub, Google, Azure AD, Okta) |
| **Notifications** | Workers Fetch API | Outbound webhooks to Discord, Telegram, Slack, custom APIs |

---

## 2. Ingestion & Ping Processing Flow (Public Edge Pipeline)

```
[Cron Job / Script]
       │
       │ HTTP GET/POST /ping/:slug (Public, Unauthenticated <20ms)
       ▼
[Cloudflare Worker Endpoint]
       │
       ├── 1. Validate slug & load monitor from D1 / KV cache
       ├── 2. Calculate next_ping_expected_at = now + interval_seconds
       ├── 3. Insert audit log into `ping_logs` D1 table
       ├── 4. Update monitor status to 'UP'
       └── 5. If previous status was 'DOWN' or 'GRACE' -> Trigger NotifierService
```

### Response Latency
Because Cloudflare Workers execute ping ingestion at the nearest edge pop to the requesting client, ping processing latency is typically **10ms - 20ms**, minimizing overhead on monitored cron scripts.

---

## 3. Security & Authentication Architecture

Health Monitor uses an isolated routing pattern to guarantee high-performance public ping ingestion while securing administrative management APIs:

```
                      ┌──────────────────────────────────────────────┐
                      │            Cloudflare Worker Router          │
                      └──────────────────────┬───────────────────────┘
                                             │
             ┌───────────────────────────────┴──────────────────────────────┐
             ▼                                                              ▼
    [Public Edge Routers]                                         [Protected Management API]
  /ping/*  /badge/*  /health                                      /api/monitors/*  /api/channels/*
 (Unauthenticated <20ms)                                          (Requires Auth Middleware)
                                                                            │
                                                       ┌────────────────────┴────────────────────┐
                                                       ▼                                         ▼
                                          [Cloudflare Access (Zero Trust)]            [Admin Password Fallback]
                                       Cf-Access-Authenticated-User-Email        D1 `app_config` / ADMIN_PASSWORD
```

### Authentication Precedence
1. **Cloudflare Access (Cloudflare One)**: If `Cf-Access-Authenticated-User-Email` header is present, identity is verified at the Cloudflare edge.
2. **Environment Secret Override**: If `ADMIN_PASSWORD` is configured in `wrangler` secrets, environment credentials take precedence.
3. **D1 App Configuration**: If no secret override is set, admin credentials configured during the first-time **Setup Wizard** (stored in D1 `app_config` table) are checked against the `Authorization: Bearer <token>` header.

---

## 4. Heartbeat Evaluator (Dead Man's Switch Engine)

The heartbeat evaluator functions via Cloudflare Workers `scheduled()` event configured in `wrangler.jsonc`:

```jsonc
"triggers": {
  "crons": ["* * * * *"]
}
```

Every 60 seconds:
1. The Worker executes `MonitorEvaluator.evaluateAllMonitors()`.
2. Queries D1 for checks in `up`, `grace`, or `new` status.
3. Computes:
   - `expected_time = last_ping_at + interval_seconds`
   - `grace_period_end = expected_time + grace_seconds`
4. State Transitions:
   - `now > grace_period_end`: Transition status to **DOWN**, create audit log, and send notification payloads to configured channels.
   - `now > expected_time` and `status == 'up'`: Transition status to **GRACE**.

---

## 5. Multi-Channel Notification Engine

The `NotifierService` handles asynchronous alert dispatching via `ctx.waitUntil()` to avoid blocking response execution:

- **Discord**: Posts embeds with color-coded status banners.
- **Slack**: Sends rich text blocks.
- **Telegram**: Dispatches Markdown-formatted messages via Telegram Bot API.
- **Generic Webhook**: Sends structured JSON payloads containing event type, check ID, timestamp, and status diff.

---

## 6. Real-Time WebSocket Architecture (Cloudflare Durable Objects)

```
[Browser Dashboard]  ◄═════ Native WebSocket (wss://.../api/ws) ═════►  [RealtimeBroadcaster]
                                                                        (Cloudflare Durable Object)
                                                                                  ▲
[Ping Endpoint / Evaluator] ─── broadcastRealtimeEvent(env, type, data) ──────────┘
```

### Key Principles:
1. **WebSocket Hibernation**: Connected WebSockets use `this.state.acceptWebSocket(ws)`. When no messages are active, the Durable Object hibernates in memory, incurring zero execution charges while maintaining open connections.
2. **Event Fan-Out**: When a ping arrives at `/ping/:slug` or a status transition occurs in `MonitorEvaluator`, `broadcastRealtimeEvent()` posts the JSON payload to the Durable Object `/broadcast` route.
3. **Broadcasting**: `RealtimeBroadcaster` iterates through `state.getWebSockets()` and pushes real-time payloads (`PING_RECEIVED`, `MONITOR_UPDATED`, `MONITOR_CREATED`, `MONITOR_DELETED`) to all connected frontend clients.
4. **Client Lifecycle**: The React `useWebSocket` hook automatically handles connection initialization, exponential backoff reconnects, and 25-second keep-alive `ping`/`pong` frames.
