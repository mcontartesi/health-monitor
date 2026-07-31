# Changelog

All notable changes to **Health Monitor** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-07-31

### Added
- **Native Cloudflare Workers Core**: Hono REST API engine running 100% serverless at the edge.
- **Relational D1 Backend**: Schema support for monitors, check-ins, alert channels, and incident logs.
- **Cron Job & Heartbeat Monitoring**: Dead-man switch support with configurable grace periods.
- **HTTP / Uptime Checkers**: Automated periodic uptime ping engine via Cloudflare Scheduled Triggers.
- **Multi-Channel Alert Dispatcher**: Native webhooks for Discord, Slack, Telegram, and generic HTTP endpoints.
- **Modern Dashboard UI**: Built with React 18, Vite, Lucide icons, and Tailwind CSS dark theme.
- **Developer Documentation**: Complete API reference (`docs/API.md`) and architecture specification (`docs/ARCHITECTURE.md`).
- **CI/CD Workflows**: Automated GitHub Actions for unit testing, release management, and GitHub Pages deployment.
