# 🏗️ Technical Architecture

**Health Monitor** is built 100% native to the Cloudflare Workers ecosystem, eliminating the need for server infrastructure, virtual machines, external databases, or Redis caches.

---

## 📐 High-Level Architecture Diagram

```
                              ┌────────────────────────────────────────┐
                              │            Clients / Crons             │
                              └───────────────────┬────────────────────┘
                                                  │ (Ping Signals / HTTP)
                                                  ▼
                              ┌────────────────────────────────────────┐
                              │       Cloudflare Edge Network          │
                              │         (300+ Locations)               │
                              └───────────────────┬────────────────────┘
                                                  │
                                                  ▼
                              ┌────────────────────────────────────────┐
                              │       Cloudflare Worker Routing        │
                              └───────┬──────────────────────┬─────────┘
                                      │                      │
                   ┌──────────────────┴──┐                ┌──┴──────────────────┐
                   ▼                     ▼                ▼                     ▼
        ┌──────────────────┐  ┌──────────────────┐  ┌───────────┐  ┌──────────────────┐
        │ Cloudflare D1    │  │ Durable Objects  │  │ Cron      │  │ Cloudflare       │
        │ Serverless DB    │  │ WebSocket Stream │  │ Trigger   │  │ Static Assets    │
        │ (monitors, logs) │  │ (Real-Time UI)   │  │ (Every    │  │ (React App)      │
        └──────────────────┘  └──────────────────┘  │  1 min)   │  └──────────────────┘
                                                    └───────────┘
```

---

## 🔧 Core Building Blocks

### 1. Cloudflare Workers (Backend Hono Engine)
- Serves API routes, handles ping processing in `< 20ms`, and formats dynamic SVG badges.
- Built using **Hono** web framework for lightweight performance.

### 2. Cloudflare D1 (Relational Database)
- Serverless SQLite database residing at the edge.
- Stores monitor configurations, audit logs (`ping_logs`), alert channels, and system credentials (`app_config`).

### 3. Cloudflare Durable Objects (`RealtimeBroadcaster`)
- Utilizes SQLite-backed Durable Objects with **WebSocket Hibernation**.
- Broadcasts real-time events (`PING_RECEIVED`, `MONITOR_UPDATED`) to connected dashboards without holding memory when idle.

### 4. Cloudflare Cron Triggers (`* * * * *`)
- Runs background heartbeat evaluation every minute.
- Identifies missing pings, calculates grace periods, transitions statuses (`UP` -> `GRACE` -> `DOWN`), and dispatches alert notifications.

### 5. Cloudflare Assets (Frontend Dashboard)
- Compiled SPA built with **React**, **TypeScript**, and **Tailwind CSS**.
- Hosted directly on Cloudflare Assets for zero-latency static file serving.
