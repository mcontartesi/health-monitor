# Health Monitor

> **100% Cloudflare Ecosystem Native Cron Job & Service Health Monitoring**  
> Modern, serverless, zero-maintenance alternative to [Healthchecks.io](https://github.com/healthchecks/healthchecks) — running entirely on **Cloudflare Workers**, **Cloudflare D1**, **Cloudflare KV**, and **Cloudflare Assets**.

---

![Health Monitor Status](https://img.shields.io/badge/Health_Monitor-Cloudflare_Native-10b981?style=for-the-badge&logo=cloudflare)
[![Version](https://img.shields.io/github/v/release/mcontartesi/health-monitor?style=for-the-badge&color=blue)](https://github.com/mcontartesi/health-monitor/releases)
[![Tests Status](https://img.shields.io/badge/Tests-Passing-10b981?style=for-the-badge&logo=vitest)](https://github.com/mcontartesi/health-monitor/actions/workflows/test.yml)
[![Coverage Status](https://img.shields.io/badge/Coverage-100%25-brightgreen?style=for-the-badge&logo=codecov)](https://github.com/mcontartesi/health-monitor/actions/workflows/test.yml)
![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178c6?style=for-the-badge&logo=typescript)

---

## 1-Click Deployment (Recommended)

Deploy **Health Monitor** directly to your Cloudflare account in seconds — **zero CLI commands required**:

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/mcontartesi/health-monitor)

### 3-Step Instant Setup:
1. Click the **Deploy to Cloudflare Workers** button above.
2. Cloudflare will automatically fork the repository, provision Cloudflare D1 & KV bindings, and deploy your Worker.
3. Open your generated Worker URL (`https://health-monitor.your-subdomain.workers.dev`) in any browser.  
   The interactive **Setup Wizard** will launch automatically on your first visit to create database tables and set your custom **Admin Username & Password**!

---

## The Story Behind Health Monitor

📖 Read the full article on Medium: **[How a Silent Cron Job Ruined My Weekend (And Why I Built a $0 Open Source Alternative on Cloudflare)](https://medium.com/@maxiconta/how-a-silent-cron-job-ruined-my-weekend-and-why-i-built-a-0-open-source-alternative-on-a57173e25db3)**

> **Summary**: After a silent cron job failure disrupted a weekend and revealed the heavy infrastructure requirements of self-hosted alternatives, Health Monitor was created as a lightweight, 100% serverless, zero-maintenance solution running entirely on Cloudflare's free tier.

---

## Why Health Monitor?

Traditional cron monitoring services require running background worker servers, Redis caches, PostgreSQL instances, and celery queues.  
**Health Monitor** re-imagines cron heartbeat monitoring from the ground up for the modern Edge ecosystem:

- **Zero External Infrastructure**: No VPS, Docker containers, Kubernetes pods, or external databases needed. 100% serverless!
- **Native Real-Time WebSockets**: Powered by **Cloudflare Durable Objects** with *WebSocket Hibernation* for instant live status updates & glowing border visual flashes without polling.
- **Edge Performance**: Ping ingestion responds in `< 20ms` globally via Cloudflare's 300+ edge locations.
- **Cloudflare Cron Triggers**: Background check heartbeat evaluator runs automatically every minute using Cloudflare Workers `scheduled` triggers.
- **D1 Relational Storage**: Serverless SQLite database at the edge storing monitors, audit logs, and alert configurations.
- **Modern Dark UI**: React + Tailwind CSS dashboard hosted on Cloudflare Workers Static Assets (`assets`).
- **Multi-Channel Alerting**: Instant notifications via **Discord**, **Slack**, **Telegram**, and **Custom Webhooks** when checks fail or recover.
- **HTTP Setup Wizard**: Automatic first-time web wizard to initialize database tables and admin credentials with zero CLI hassle.
- **Dynamic SVG Badges**: Embed real-time status badges in your GitHub READMEs (`/badge/:slug/status.svg`).

---

## Local Development & CLI Setup (Optional)

If you prefer running or customizing Health Monitor locally:

### Prerequisites
- [Node.js](https://nodejs.org/) v18 or newer
- A free or paid [Cloudflare Account](https://dash.cloudflare.com)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/) installed (`npm install -g wrangler`)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/mcontartesi/health-monitor.git
cd health-monitor
npm install
```

### 2. Run Local Preview
Start local development server (Vite + Cloudflare Worker local preview):

```bash
npm run dev
```

1. Open `http://localhost:3000` in your browser.
2. The interactive **Setup Wizard** will automatically launch to create local tables and set your admin credentials.

### 3. Deploy via Wrangler CLI
Deploy the worker backend, cron trigger, and compiled static React frontend:

```bash
npm run deploy
```

---

## Ping API Usage

Health Monitor supports simple HTTP ping signals from your scripts, cronjobs, background workers, and CI/CD pipelines:

### 1. Standard Ping (Success Signal)
Send a GET or POST request when your job finishes successfully:
```bash
curl -m 10 https://your-worker.workers.dev/ping/db-backup
```

### 2. Signal Job Start (Duration Tracking)
Call `/start` before initiating a heavy task:
```bash
curl -m 10 https://your-worker.workers.dev/ping/db-backup/start
```

### 3. Signal Job Failure
Call `/fail` when your job encounters an unhandled exception:
```bash
curl -m 10 -d "Error: connection timeout to DB host" https://your-worker.workers.dev/ping/db-backup/fail
```

### 4. Exit Code Ingestion
Pass execution exit codes directly:
```bash
curl -m 10 https://your-worker.workers.dev/ping/db-backup/$?
```

---

## Native Real-Time WebSockets & Live Dashboard Highlights

Health Monitor features **native, zero-polling real-time updates** powered by **Cloudflare Durable Objects** with *WebSocket Hibernation*:

- **Endpoint**: `/api/ws` (WebSocket connection for browser dashboard).
- **Durable Object Hub (`RealtimeBroadcaster`)**: Manages stateful client connections at the Cloudflare edge without memory leaks or high compute cost.
- **Instant Live Highlights**: When an incoming HTTP ping (`/ping/:slug`) or state evaluation transition (`UP` → `GRACE` → `DOWN`) occurs:
  - The backend broadcasts a `PING_RECEIVED` or `MONITOR_UPDATED` event to all connected dashboard WebSockets.
  - The dashboard updates the monitor card status **instantly** in under 10ms.
  - The corresponding monitor card flashes with a **glowing emerald border shadow** (`border-emerald-500/80 shadow-[0_0_30px_rgba(16,185,129,0.35)]`) and displays a **`PING RECEIVED`** animated pulse badge for 2.5 seconds.
- **Auto-Reconnect**: The React frontend hook (`useWebSocket`) automatically reconnects with exponential backoff on network interruptions and maintains keep-alive ping/pong heartbeats.

---

## GitHub Dynamic Status Badges

Health Monitor renders real-time, zero-cache SVG status badges designed for embedding into GitHub READMEs, status pages, and documentation:

### Badge Endpoint URL
```text
https://<your-worker-url>/badge/:slug_or_id/status.svg
```

### Embedding Snippets

#### 1. Standard Markdown
```markdown
![Database Backup Status](https://your-worker.workers.dev/badge/db-backup/status.svg)
```

#### 2. Clickable Badge (Links to your Dashboard)
```markdown
[![Database Backup Status](https://your-worker.workers.dev/badge/db-backup/status.svg)](https://your-worker.workers.dev)
```

#### 3. HTML Format (Custom Sizing)
```html
<a href="https://your-worker.workers.dev">
  <img src="https://your-worker.workers.dev/badge/db-backup/status.svg" alt="Health Status" />
</a>
```

### Status Color Matrix

| Monitor State | Badge Text | Badge Color | Hex | Condition |
| :--- | :--- | :--- | :--- | :--- |
| **UP** | `health \| UP` | Emerald Green | `#10B981` | Heartbeat ping received within schedule |
| **GRACE** | `health \| LATE` | Amber Yellow | `#F59E0B` | Ping overdue, currently in grace window |
| **DOWN** | `health \| DOWN` | Rose Red | `#EF4444` | Ping overdue past grace period |
| **PAUSED** | `health \| PAUSED` | Slate Gray | `#6B7280` | Check manually paused by admin |
| **UNKNOWN** | `health \| UNKNOWN` | Slate Gray | `#6B7280` | Monitor slug or ID does not exist |

> **Zero Cache Delay**: Badge responses enforce `Cache-Control: no-cache, no-store, must-revalidate` headers so GitHub's Camo image proxy always renders live status.

---

## Admin Password Authentication

Health Monitor includes **built-in Admin Password protection** out-of-the-box:

- **Setup Wizard Credentials**: Custom username and password set directly by you in the browser during the first-time setup wizard.
- **Automatic Challenge**: Unauthenticated API requests receive HTTP 401 and trigger a modern Admin Login modal in the dashboard.
- **Custom Production Password**: Set your custom production password securely via Wrangler CLI:
  ```bash
  npx wrangler secret put ADMIN_PASSWORD
  ```
- **Custom Production Username**: Optionally override default username:
  ```bash
  npx wrangler secret put ADMIN_USERNAME
  ```

---

## Zero Trust & Cloudflare Access Authentication

Health Monitor supports **Cloudflare Access (Cloudflare One)** out-of-the-box for Zero Trust authentication **without breaking 1-Click Deployment simplicity**:

1. **Zero Code Overhead**: Deploy normally with 1-Click or Wrangler CLI.
2. **Protect Dashboard via Cloudflare One**:
   - Go to [Cloudflare Zero Trust Dashboard](https://one.dash.cloudflare.com) → **Access** → **Applications**.
   - Click **Add an Application** → **Self-hosted**.
   - Point to your Worker URL (`health-monitor.your-subdomain.workers.dev`).
   - Configure Single Sign-On (GitHub, Google, Azure AD, Okta, or Email OTP).
   - Exclude `/ping/*` and `/badge/*` routes from Access policies so external cron scripts can ping without credentials.
3. **Automatic User Identity**: Health Monitor detects authenticated user sessions (`Cf-Access-Authenticated-User-Email`) and displays an active Zero Trust identity badge in the UI header.

---

## Architecture Overview

```
                        ┌──────────────────────────────────────────────┐
                        │              Cloudflare Edge                 │
                        │                                              │
    Cron Job / Client ──┼──► /ping/:slug  ───┐                         │
                        │                    │                         │
      Browser Dashboard ┼──► / (Static App)  ├──► Cloudflare Worker    │
                        │                    │    (Hono Router)        │
    Cron Trigger (1m) ──┼──► scheduled() ────┘         │               │
                        │                              │               │
                        │               ┌──────────────┼──────────────┐│
                        │               ▼              ▼              ▼│
                        │          Cloudflare D1  Cloudflare KV Notifier│
                        └──────────────────────────────────────────────┘
```

For complete technical specifications, see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) and [docs/API.md](docs/API.md).

---

## Troubleshooting & FAQ

<details>
<summary><b>Q: D1_ERROR: no such table: monitors?</b></summary>
<br />
Run the setup wizard by opening the web app in your browser, or execute local schema manually:
<code>npm run db:setup:local</code>
</details>

<details>
<summary><b>Q: How do external ping endpoints stay public when auth is enabled?</b></summary>
<br />
All <code>/ping/*</code> and <code>/badge/*</code> routes are handled on dedicated public routers outside the administrative API middleware, ensuring ping ingestion and badge rendering remain 100% public, unauthenticated, and ultra-fast (&lt;20ms).
</details>

---

---

## 🤝 Open Source Community & Governance

We believe in open, transparent, and collaborative software development.

- **[Contributing Guide](CONTRIBUTING.md)**: Guidelines for opening issues, submitting Pull Requests, and code conventions.
- **[Code of Conduct](CODE_OF_CONDUCT.md)**: Standards of conduct for participants in the Health Monitor community.
- **[Changelog](CHANGELOG.md)**: Version history, release notes, and breaking changes.
- **[Security Policy](SECURITY.md)**: Guidelines for reporting security vulnerabilities responsibly.

---

## 👤 Author & Maintainer

Created and maintained with ❤️ by **[Maximiliano Contartesi](https://github.com/mcontartesi)**.

- 🐙 **GitHub**: [@mcontartesi](https://github.com/mcontartesi)
- 📝 **Medium**: [@maxiconta](https://medium.com/@maxiconta)
- 📄 **Story**: Read [How a Silent Cron Job Ruined My Weekend](https://medium.com/@maxiconta/how-a-silent-cron-job-ruined-my-weekend-and-why-i-built-a-0-open-source-alternative-on-a57173e25db3)

---

## 📜 License

This project is licensed under the [MIT License](LICENSE). Feel free to use, modify, and distribute it in your own projects.
