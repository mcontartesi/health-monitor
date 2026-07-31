# 🚀 Welcome to the Health Monitor Wiki

Welcome to the official documentation wiki for **Health Monitor** — the 100% Cloudflare Workers native cron job and service health monitoring platform!

---

## 🌟 Overview

**Health Monitor** is a modern, serverless, zero-maintenance alternative to [Healthchecks.io](https://github.com/healthchecks/healthchecks) — designed to run entirely on Cloudflare's global edge network using **Cloudflare Workers**, **Cloudflare D1**, **Cloudflare KV**, **Durable Objects**, and **Cloudflare Assets**.

![Health Monitor Architecture Banner](https://img.shields.io/badge/Health_Monitor-Cloudflare_Native-10b981?style=for-the-badge&logo=cloudflare)

---

## 📚 Wiki Navigation

Explore the sections below to learn how to deploy, configure, and integrate Health Monitor:

- 🚀 **[Getting Started](Getting-Started)**: 1-Click deployment guide, setup wizard, and local CLI workflow.
- 📖 **[API Reference](API-Reference)**: Complete HTTP REST API documentation, ping ingestion formats, and dynamic SVG status badges.
- 🔌 **[WebSockets & Real-Time Events](API-Reference#5-real-time-websocket-api)**: Real-time event streaming via Cloudflare Durable Object hibernation.
- 🔔 **[Alerts & Integrations](Alerts-and-Channels)**: Configure notifications for Discord, Slack, Telegram, and Custom Webhooks.
- 🏗️ **[Architecture Overview](Architecture)**: Deep-dive into database schema, background cron evaluators, and edge execution models.
- 🛠️ **[Troubleshooting & FAQ](Troubleshooting)**: Solutions to common deployment issues, Cloudflare permissions, and domain setup.

---

## ✨ Key Features

- **⚡ Edge Performance**: Sub-20ms ping ingestion across 300+ Cloudflare edge locations worldwide.
- **💰 100% Free Tier Compatible**: Runs completely within Cloudflare's generous free tier (zero VPS or external DB cost).
- **🔄 Live WebSockets**: Real-time status updates powered by Cloudflare Durable Objects with WebSocket Hibernation.
- **🛡️ First-Time Setup Wizard**: Zero-CLI initial setup wizard to provision D1 tables and admin login credentials automatically.
- **📢 Multi-Channel Alerting**: Instant notification dispatch on downtime and recovery to Discord, Slack, Telegram, and Webhooks.
- **🏷️ Dynamic SVG Badges**: Embed live status badges directly into your GitHub README files (`/badge/:slug/status.svg`).

---

## 🔗 Project Links

- **GitHub Repository**: [mcontartesi/health-monitor](https://github.com/mcontartesi/health-monitor)
- **Live Demo**: [mcontartesi.github.io/health-monitor](https://mcontartesi.github.io/health-monitor/)
- **License**: MIT
