# 🚀 Getting Started with Health Monitor

This guide covers how to deploy **Health Monitor** to your Cloudflare account in seconds or run it locally for development.

---

## ⚡ Option A: 1-Click Cloudflare Deployment (Recommended)

Deploy directly to your Cloudflare account with **zero CLI configuration**:

1. Click the button below or open the deploy URL:
   [![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/mcontartesi/health-monitor)

2. Cloudflare will automatically:
   - Fork the repository into your GitHub account.
   - Provision Cloudflare D1 & KV resources.
   - Deploy your Worker to `https://<your-worker>.workers.dev`.

3. Open your generated Worker URL in any browser:
   - The interactive **Setup Wizard** will launch automatically on your first visit.
   - Set your **Admin Password** and initialize the database schema with a single click.

---

## 🛠️ Option B: Local Development Setup

If you prefer running or customizing Health Monitor on your local computer:

### 1. Prerequisites
- [Node.js](https://nodejs.org/) v18+
- [Git](https://git-scm.com/)
- Free [Cloudflare Account](https://dash.cloudflare.com)

### 2. Clone & Install
```bash
git clone https://github.com/mcontartesi/health-monitor.git
cd health-monitor
npm install
```

### 3. Start Local Dev Server
```bash
npm run dev
```
Open `http://localhost:3000` in your browser. The local Setup Wizard will guide you through initializing local SQLite tables.

### 4. Deploy via Wrangler CLI
```bash
# Compile frontend assets and deploy worker backend
npm run deploy
```

---

## ⚙️ Enabling `workers.dev` Domain in Cloudflare Dashboard

If your worker URL shows as disabled after initial deployment:

1. Log into [Cloudflare Dashboard](https://dash.cloudflare.com).
2. Go to **Workers & Pages** -> **health-monitor**.
3. Select the **Domains** tab.
4. Under **Worker URL**, toggle the **Production** switch to **ON** (`health-monitor.your-subdomain.workers.dev`).

---

## 🎯 Next Steps

- Check out the [API Reference](API-Reference) to send your first ping!
- Learn how to configure [Alert Channels](Alerts-and-Channels) for Slack, Discord, and Telegram.
