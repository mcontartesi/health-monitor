# 💚 Health Monitor

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

## ⚡ 1-Click Deployment

Deploy **Health Monitor** directly to your Cloudflare account with a single click:

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/mcontartesi/health-monitor)

*The Cloudflare Workers Deploy Button will automatically fork the repository, connect your GitHub account, configure your Worker, and launch the deployment pipeline.*

---

## 🌟 Why Health Monitor?

Traditional cron monitoring services require running background worker servers, Redis caches, PostgreSQL instances, and celery queues.  
**Health Monitor** re-imagines cron heartbeat monitoring from the ground up for the modern Edge ecosystem:

- ⚡ **Zero External Infrastructure**: No VPS, Docker containers, Kubernetes pods, or external databases needed. 100% serverless!
- 🛡️ **Edge Performance**: Ping ingestion responds in `< 20ms` globally via Cloudflare's 300+ edge locations.
- 🕒 **Cloudflare Cron Triggers**: Background check heartbeat evaluator runs automatically every minute using Cloudflare Workers `scheduled` triggers.
- 📊 **D1 Relational Storage**: Serverless SQLite database at the edge storing monitors, audit logs, and alert configurations.
- 🎨 **Modern Dark UI**: React + Tailwind CSS dashboard hosted on Cloudflare Workers Static Assets (`assets`).
- 🔔 **Multi-Channel Alerting**: Instant notifications via **Discord**, **Slack**, **Telegram**, and **Custom Webhooks** when checks fail or recover.
- 🧙 **HTTP Setup Wizard**: Automatic first-time web wizard to initialize database tables and admin credentials with zero CLI hassle.
- 🏷️ **Dynamic SVG Badges**: Embed real-time status badges in your GitHub READMEs (`/badge/:slug/status.svg`).

---

## 🚀 Quick Start & Local Development

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

### 2. Create Cloudflare D1 Database & KV Namespace
Run Wrangler commands to create your serverless database and key-value cache:

```bash
# Create D1 database
npx wrangler d1 create health_monitor_db

# Create KV namespace
npx wrangler kv:namespace create HEALTH_MONITOR_KV
```

Copy the returned `database_id` and KV `id` into `wrangler.jsonc`:

```jsonc
"d1_databases": [
  {
    "binding": "DB",
    "database_name": "health_monitor_db",
    "database_id": "YOUR_D1_DATABASE_ID"
  }
],
"kv_namespaces": [
  {
    "binding": "KV",
    "id": "YOUR_KV_NAMESPACE_ID"
  }
]
```

### 3. Run Locally & Setup Wizard
Start local development server (Vite + Cloudflare Worker local preview):

```bash
npm run dev
```

1. Open `http://localhost:3000` in your browser.
2. The interactive **Setup Wizard** will automatically launch to create tables and set your admin credentials.

### 4. Deploy to Cloudflare
Deploy the worker backend, cron trigger, and compiled static React frontend in a single command:

```bash
npm run deploy
```

---

## 📡 Ping API Usage

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

## 🖼️ GitHub Status Badges

Embed real-time status badges into your project READMEs:

```markdown
![Backup Status](https://your-worker.workers.dev/badge/db-backup/status.svg)
```

| Monitor Status | Badge Preview |
| :--- | :--- |
| **UP** | `[ health | UP ]` (Emerald Green) |
| **GRACE** | `[ health | LATE ]` (Amber Yellow) |
| **DOWN** | `[ health | DOWN ]` (Rose Red) |
| **PAUSED** | `[ health | PAUSED ]` (Slate Gray) |

---

## 🔑 Admin Password Authentication

Health Monitor includes **built-in Admin Password protection** out-of-the-box:

- **Default Credentials**: Username `admin`, Password `admin` (configured via Setup Wizard on initial launch).
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

## 🔐 Zero Trust & Cloudflare Access Authentication

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

## 🧱 Architecture Overview

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

## ❓ Troubleshooting & FAQ

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

## 🤝 Contributing

Contributions are welcome! Follow these steps to contribute:

1. **Fork the repository** on GitHub.
2. **Create a feature branch**: `git checkout -b feature/my-cool-feature`
3. **Run unit tests**: `npm test`
4. **Build & verify**: `npm run build`
5. **Open a Pull Request**.

---

## 👨‍💻 Author & Maintainer

Designed and developed by **[Maximiliano Contartesi](https://github.com/mcontartesi)**.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
