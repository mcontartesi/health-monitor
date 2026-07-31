# 📐 Health Monitor Architecture & Technical Deep Dive

This document details the architectural design and Cloudflare primitive integrations of **Health Monitor**.

---

## 1. Cloudflare Ecosystem Stack

Health Monitor is engineered to require zero external services. Every layer of the application operates inside Cloudflare's edge platform:

| Component | Cloudflare Primitive | Purpose |
| :--- | :--- | :--- |
| **API & Ingestion** | Cloudflare Workers | Serverless HTTP routing, ping processing, SVG rendering |
| **Database** | Cloudflare D1 | Serverless SQL (SQLite at edge) storing checks, logs, channels |
| **State Caching** | Cloudflare KV | Low-latency state lookup and rate-limiting cache |
| **Background Evaluator** | Workers Cron Triggers | 1-minute scheduled execution inspecting overdue heartbeats |
| **Frontend UI** | Workers Static Assets | React + Tailwind SPA served directly from Worker edge |
| **Notifications** | Workers Fetch API | Outbound webhooks to Discord, Telegram, Slack, custom APIs |

---

## 2. Ingestion & Ping Processing Flow

```
[Cron Job / Script]
       │
       │ HTTP GET/POST /ping/:slug
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

## 3. Heartbeat Evaluator (Dead Man's Switch Engine)

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

## 4. Multi-Channel Notification Engine

The `NotifierService` handles asynchronous alert dispatching via `ctx.waitUntil()` to avoid blocking response execution:

- **Discord**: Posts embeds with color-coded status banners.
- **Slack**: Sends rich text blocks.
- **Telegram**: Dispatches Markdown-formatted messages via Telegram Bot API.
- **Generic Webhook**: Sends structured JSON payloads containing event type, check ID, timestamp, and status diff.
